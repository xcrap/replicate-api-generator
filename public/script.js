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
    imageContainer.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center p-4">
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
        </div>
        <span class="mt-4 text-xs uppercase">Queue position: ${queueCount}</span></div>`;

    generatedImagesDiv.appendChild(imageContainer, generatedImagesDiv.firstChild);

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
