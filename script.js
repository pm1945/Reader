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

        //Крайние точки
        var xmin=0;
        var xmax=0;
        var ymin=0;
        var ymax=0;

        // Extract walls with role "wall"
        const walls = [];
        for (const key in jsonData.plan.walls) {
            const wall = jsonData.plan.walls[key];
            if (wall.role === "wall") {
                const wallData = {
                    id: wall.id,
                    l1: wall.l1,
                    l2: wall.l2,
                    r1: wall.r1,
                    r2: wall.r2,
                    depth: wall.depth,
                    height: wall.height,
                    neighbors: wall.neighbors,
                    lnx: wall.l2.y - wall.l1.y,
                    lny: wall.l2.x - wall.l1.x,
                    holes: [] // Array for holes
                };

                //Считаем размер дома
                if(wall.l1.x<xmin) xmin=wall.l1.x;
                if(wall.l1.x>xmax) xmax=wall.l1.x;
                if(wall.l1.y<ymin) ymin=wall.l1.y;
                if(wall.l1.y>ymax) ymax=wall.l1.y;
                if(wall.l2.x<xmin) xmin=wall.l2.x;
                if(wall.l2.x>xmax) xmax=wall.l2.x;
                if(wall.l2.y<ymin) ymin=wall.l2.y;
                if(wall.l2.y>ymax) ymax=wall.l2.y;
                

                // Extract holes
                if (wall.holes) {
                    for (const holeKey in wall.holes) {
                        const hole = wall.holes[holeKey];
                        wallData.holes.push({
                            id: hole.id,
                            type: hole.type,
                            group: hole.group,
                            width: hole.width,
                            height: hole.height,
                            depth: hole.depth
                        });
                    }
                }

                walls.push(wallData);
            }
        }

        // Display extracted data
        output.innerHTML = walls.map(wall => {
            const holesHtml = wall.holes.map(hole => `
                <div style="margin-left: 20px;">
                    <strong>Hole ID:</strong> ${hole.id}<br>
                    &nbsp;&nbsp;<strong>Type:</strong> ${hole.type}<br>
                    &nbsp;&nbsp;<strong>Group:</strong> ${hole.group}<br>
                    &nbsp;&nbsp;<strong>Width:</strong> ${hole.width}<br>
                    &nbsp;&nbsp;<strong>Height:</strong> ${hole.height}<br>
                    &nbsp;&nbsp;<strong>Depth:</strong> ${hole.depth}<br>
                </div>
            `).join("");

            return `
                <div>
                    <strong>Wall ID:</strong> ${wall.id}<br>
                    <strong>Coordinates:</strong><br>
                    &nbsp;&nbsp;l1: ${JSON.stringify(wall.l1)}<br>
                    &nbsp;&nbsp;l2: ${JSON.stringify(wall.l2)}<br>
                    &nbsp;&nbsp;r1: ${JSON.stringify(wall.r1)}<br>
                    &nbsp;&nbsp;r2: ${JSON.stringify(wall.r2)}<br>
                    &nbsp;&nbsp;depth: ${JSON.stringify(wall.depth)}<br>
                    &nbsp;&nbsp;height: ${JSON.stringify(wall.height)}<br>
                    &nbsp;&nbsp;neighbors: ${JSON.stringify(wall.neighbors)}<br>
                    &nbsp;&nbsp;lnx: ${JSON.stringify(wall.lnx)}<br>
                    &nbsp;&nbsp;lny: ${JSON.stringify(wall.lny)}<br>
                    <strong>Holes:</strong><br>
                    ${holesHtml}
                </div><hr>`;
        }).join("");
    } catch (error) {
        output.textContent = `Error processing file: ${error.message}`;
    }
});
