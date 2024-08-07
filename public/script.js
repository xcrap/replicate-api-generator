let queueCount = 0;

document.getElementById("generateForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = document.getElementById("prompt").value;
    const generatedImagesDiv = document.getElementById("generatedImages");

    queueCount++;
    const imageContainer = document.createElement("div");
    imageContainer.className = "w-full block bg-white rounded-lg flex flex-col justify-center items-center p-2";
    imageContainer.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center p-4">
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
        </div>
        <span class="mt-4 text-xs uppercase">Queue position: ${queueCount}</span></div>`;

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



// Aspect Ratio Code
let selectedAspectRatio = "9:16"; // Default aspect ratio

// Define the aspect ratio options
const ratios = [
    { ratio: '9:21', height: 'h-20', aspect: 'aspect-[9/21]' },
    { ratio: '9:16', height: 'h-16', aspect: 'aspect-[9/16]' },
    { ratio: '2:3', height: 'h-14', aspect: 'aspect-[2/3]' },
    { ratio: '4:5', height: 'h-14', aspect: 'aspect-[4/5]' },
    { ratio: '1:1', height: 'h-12', aspect: 'aspect-[1/1]' },
    { ratio: '5:4', height: 'h-11', aspect: 'aspect-[5/4]' },
    { ratio: '3:2', height: 'h-10', aspect: 'aspect-[3/2]' },
    { ratio: '16:9', height: 'h-9', aspect: 'aspect-[16/9]' },
    { ratio: '21:9', height: 'h-8', aspect: 'aspect-[21/9]' },
];

class AspectRatioDropdown {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container with id "${containerId}" not found`);

        this.selectedRatio = '9:16'; // Default ratio
        this.isOpen = false;

        this.render();
        this.initializeEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="relative inline-block text-left">
                <button type="button" id="aspect-ratio-button" class="bg-gray-50 hover:bg-gray-100 text-gray-500 px-4 py-2 text-sm uppercase focus:outline-none transition rounded">
                    ${this.selectedRatio}
                </button>
                <div id="aspect-ratio-options" class="absolute mt-2 bg-white rounded-md border border-gray-100 shadow-sm z-10 hidden">
                    <div class="p-4 flex items-center gap-2">
                        ${ratios.map(option => `
                            <button type="button" class="aspect-button ${option.height} ${option.aspect} flex items-center justify-center p-2 text-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${this.selectedRatio === option.ratio ? 'bg-blue-500 text-white' : 'bg-gray-50 hover:bg-gray-100 text-black'}"
                                    data-ratio="${option.ratio}">
                                ${option.ratio}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.buttonElement = this.container.querySelector('#aspect-ratio-button');
        this.optionsElement = this.container.querySelector('#aspect-ratio-options');
    }

    initializeEventListeners() {
        this.buttonElement.addEventListener('click', () => this.toggleDropdown());

        // Use your existing button click logic
        const buttons = this.optionsElement.querySelectorAll(".aspect-button");
        for (const button of buttons) {
            button.addEventListener("click", () => {
                // Remove active class from all buttons
                for (const btn of buttons) {
                    btn.classList.remove("bg-blue-500", "text-white");
                    btn.classList.add("bg-gray-50", "hover:bg-gray-100", "text-black");
                }
                // Add active class to the clicked button
                button.classList.add("active", "bg-blue-500", "hover:bg-blue-700", "text-white");
                button.classList.remove("bg-gray-50", "hover:bg-gray-100", "text-black");
                // Update selected aspect ratio
                this.selectRatio(button.getAttribute("data-ratio"));
            });
        }

        document.addEventListener('click', (event) => this.handleClickOutside(event));
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
        this.optionsElement.classList.toggle('hidden', !this.isOpen);
    }

    handleClickOutside(event) {
        if (!this.container.contains(event.target) && this.isOpen) {
            this.isOpen = false;
            this.optionsElement.classList.add('hidden');
        }
    }

    selectRatio(ratio) {
        this.selectedRatio = ratio;
        this.buttonElement.textContent = `${ratio}`;
        this.isOpen = false;
        this.optionsElement.classList.add('hidden');
        // Dispatch a custom event to notify about the ratio change
        this.container.dispatchEvent(new CustomEvent('ratioChange', { detail: { ratio: this.selectedRatio } }));
    }

    getSelectedRatio() {
        return this.selectedRatio;
    }
}

// Initialize the aspect ratio dropdown
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = new AspectRatioDropdown('aspect-ratio-container');
    // Listen for ratio changes
    document.getElementById('aspect-ratio-container').addEventListener('ratioChange', (event) => {
        // Update your application state or perform any necessary actions here
        selectedAspectRatio = event.detail.ratio; // Update the global selectedAspectRatio variable
    });
});
