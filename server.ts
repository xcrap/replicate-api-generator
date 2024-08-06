import { serve } from "bun";
import Replicate from "replicate";
import { file, write } from "bun";
import { mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

// Initialize Replicate with API token from environment variables
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Function to download a file from a given URL and save it to an output path
async function downloadFile(url: string, outputPath: string): Promise<void> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const buffer = await response.arrayBuffer();
        await write(outputPath, buffer);
        console.log("File downloaded successfully!");
    } catch (error) {
        console.error("Error downloading the file:", error);
        throw error;
    }
}

// Function to generate a placeholder image URL based on the aspect ratio
function generatePlaceholderUrl(aspectRatio: string): string {
    // Default dimensions
    let width = 300;
    let height = 500;

    // Parse aspect ratio
    const [aspectWidth, aspectHeight] = aspectRatio.split(":").map(Number);

    if (aspectWidth && aspectHeight) {
        // Calculate placeholder dimensions maintaining the aspect ratio
        if (aspectWidth > aspectHeight) {
            width = 500;
            height = Math.round((500 * aspectHeight) / aspectWidth);
        } else {
            height = 500;
            width = Math.round((500 * aspectWidth) / aspectHeight);
        }
    }

    return `https://via.placeholder.com/${width}x${height}.png?text=Placeholder+Image`;
}

// Set up a server using Bun's serve API
const server = serve({
    port: process.env.PORT || 3000, // Use environment variable PORT or default to 3000
    async fetch(req) {
        const url = new URL(req.url);

        // Serve index.html for root path
        if (url.pathname === "/" && req.method === "GET") {
            return new Response(file("public/index.html"));
        }

        // Serve CSS file
        if (url.pathname === "/styles.min.css" && req.method === "GET") {
            return new Response(file("public/styles.min.css"), {
                headers: { "Content-Type": "text/css" },
            });
        }

        // Serve JavaScript file
        if (url.pathname === "/script.js" && req.method === "GET") {
            return new Response(file("public/script.js"), {
                headers: { "Content-Type": "application/javascript" },
            });
        }

        // Handle requests to serve generated images
        if (url.pathname.startsWith("/generated") && req.method === "GET") {
            // Get the home directory or user profile directory
            const homeDir = process.env.HOME || process.env.USERPROFILE;

            // Ensure homeDir is a string
            if (!homeDir) {
                console.error("Error: HOME or USERPROFILE environment variable is not set.");
                return new Response("Internal Server Error: Environment variable missing", { status: 500 });
            }

            const filePath = path.join(homeDir, "Desktop", url.pathname.replace("/generated", ""));
            try {
                const fileData = readFileSync(filePath);
                return new Response(fileData, {
                    headers: { "Content-Type": "image/png" }, // Adjust content-type if needed
                });
            } catch (error) {
                console.error("Error reading file:", error);
                return new Response("File not found", { status: 404 });
            }
        }

        // Handle image generation request
        if (url.pathname === "/generate" && req.method === "POST") {
            try {
                const { prompt, aspect_ratio } = await req.json();
                const aspectRatio = aspect_ratio || "9:16"; // Default to 9:16 if not provided

                // Check if DEBUG mode is enabled
                if (process.env.DEBUG === "TRUE") {
                    console.log("DEBUG mode is enabled, returning a placeholder image.");

                    // Generate a placeholder image URL based on the aspect ratio
                    const placeholderImageUrl = generatePlaceholderUrl(aspectRatio);

                    // Return placeholder image URL for both imageUrl and localPath
                    return Response.json({ imageUrl: placeholderImageUrl, localPath: placeholderImageUrl });
                }

                const input = {
                    prompt: prompt,
                    output_quality: 100,
                    disable_safety_checker: true,
                    aspect_ratio: aspectRatio,
                };

                // Use the correct replicate.run() method for the model
                const output = await replicate.run("black-forest-labs/flux-schnell", { input });
                console.log("Output:", output);

                // Assuming output is an array with the URL at the first position
                if (!Array.isArray(output) || !output[0]) {
                    throw new Error("Unexpected output format");
                }

                const imageUrl = output[0] as string;
                console.log("Output URL:", imageUrl);

                // Ensure homeDir is defined for non-debug cases
                const homeDir = process.env.HOME || process.env.USERPROFILE;
                if (!homeDir) {
                    throw new Error("HOME or USERPROFILE environment variable is not set.");
                }

                // Save in the current script directory + 'outputs/'
                const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
                const fileName = `replicate_${timestamp}.png`;
                const outputPath = path.join(process.cwd(), "outputs", fileName);

                // Ensure the directory exists
                await mkdir(path.dirname(outputPath), { recursive: true });

                // Save the file to the output path
                await downloadFile(imageUrl, outputPath);

                // Return both image URL and local path
                return Response.json({ imageUrl, localPath: `/generated/${fileName}` });
            } catch (error) {
                console.error("Error generating image:", error);
                return Response.json({ error: (error as Error).message }, { status: 500 });
            }
        }

        // Return 404 for unknown paths
        return new Response("Not Found", { status: 404 });
    },
});

// Log the server's listening port
console.log(`Server is running on http://localhost:${server.port}`);