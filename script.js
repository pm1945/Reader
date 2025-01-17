// Select DOM elements
const fileInput = document.getElementById("fileInput");
const output = document.getElementById("output");

// File input event listener
fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];

    // Ensure a file is selected
    if (!file) {
        output.textContent = "Please select a file.";
        return;
    }

    // Validate file extension
    if (!file.name.endsWith(".plan")) {
        output.textContent = "Invalid file type. Please select a .plan file.";
        return;
    }

    try {
        // Read file content
        const text = await file.text();
        const jsonData = JSON.parse(text);

        // Extract walls with role "wall"
        const walls = [];
        for (const key in jsonData.plan.walls) {
            const wall = jsonData.plan.walls[key];
            if (wall.role === "wall") {
                walls.push({
                    id: wall.id,
                    l1: wall.l1,
                    l2: wall.l2,
                    r1: wall.r1,
                    r2: wall.r2
                });
            }
        }

        // Display extracted data
        output.textContent = JSON.stringify(walls, null, 2);
    } catch (error) {
        output.textContent = `Error processing file: ${error.message}`;
    }
});