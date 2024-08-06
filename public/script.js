let queueCount = 0;
let selectedAspectRatio = "9:16"; // Default aspect ratio

// Add event listeners to aspect ratio buttons
const buttons = document.querySelectorAll(".aspect-button");
for (const button of buttons) {
    button.addEventListener("click", () => {
        // Remove active class from all buttons
        for (const btn of buttons) {
            btn.classList.remove("bg-blue-700", "text-white");
            btn.classList.add("bg-gray-300", "hover:bg-gray-400", "text-black");
        }

        // Add active class to the clicked button
        button.classList.add("active", "bg-blue-500", "hover:bg-blue-700", "text-white");
        button.classList.remove("bg-gray-300", "hover:bg-gray-400", "text-black");

        // Update selected aspect ratio
        selectedAspectRatio = button.getAttribute("data-ratio");
    });
}

document.getElementById("generateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = document.getElementById("prompt").value;
    const generatedImagesDiv = document.getElementById("generatedImages");

    queueCount++;
    const imageContainer = document.createElement("div");
    imageContainer.className = "w-48 block bg-white rounded-lg flex flex-col justify-center items-center p-2";
    imageContainer.innerHTML = `<div class="text-center p-4">Generating image...<br>Queue position: ${queueCount}</div>`;

    generatedImagesDiv.insertBefore(imageContainer, generatedImagesDiv.firstChild);

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, aspect_ratio: selectedAspectRatio }),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        const img = document.createElement("img");
        img.src = data.imageUrl;
        img.alt = "Generated Image";
        img.className = "w-full block object-contain rounded-lg";

        const link = document.createElement("a");
        link.href = data.localPath; // Use localPath for the link
        link.target = "_blank";
        link.textContent = "Open Image";
        link.className = "text-xs uppercase mt-2 text-blue-500 hover:text-blue-700";

        imageContainer.innerHTML = "";
        imageContainer.appendChild(img);
        imageContainer.appendChild(link);
    } catch (error) {
        console.error("Error:", error);
        imageContainer.innerHTML = '<div class="text-center p-4">Error generating image</div>';
    } finally {
        queueCount--;
    }
});
