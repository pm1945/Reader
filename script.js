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

    //Крайние точки
    var xmin=100000;
    var xmax=-100000;
    var ymin=100000;
    var ymax=-100000;

    try {
        // Read file content
        const text = await file.text();
        const jsonData = JSON.parse(text);

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

        //Габариты дома
        var sizeX=xmax-xmin;
        var sizeY=ymax-ymin;
               

        // Создание HTML для отображения данных стен
        const wallsHtml = walls.map(wall => {
            const holesHtml = wall.holes.map(hole => `
                <div style="margin-left: 20px;">
                    <strong>Hole ID:</strong> ${hole.id}<br>
                    &nbsp;&nbsp;<strong>Тип:</strong> ${hole.type}<br>
                    &nbsp;&nbsp;<strong>Вид проема:</strong> ${hole.group}<br>
                    &nbsp;&nbsp;<strong>Ширина:</strong> ${hole.width}<br>
                    &nbsp;&nbsp;<strong>Высота:</strong> ${hole.height}<br>
                    &nbsp;&nbsp;<strong>Толщина:</strong> ${hole.depth}<br>
                </div>
            `).join("");

            return `
                <div>
                    <strong>Wall ID:</strong> ${wall.id}<br>
                    <strong>Координаты:</strong><br>
                    &nbsp;&nbsp;l1: ${JSON.stringify(wall.l1)}<br>
                    &nbsp;&nbsp;l2: ${JSON.stringify(wall.l2)}<br>
                    &nbsp;&nbsp;r1: ${JSON.stringify(wall.r1)}<br>
                    &nbsp;&nbsp;r2: ${JSON.stringify(wall.r2)}<br>
                    &nbsp;&nbsp;толщина: ${JSON.stringify(wall.depth)}<br>
                    &nbsp;&nbsp;высота: ${JSON.stringify(wall.height)}<br>
                    &nbsp;&nbsp;стены рядом: ${JSON.stringify(wall.neighbors)}<br>
                    &nbsp;&nbsp;длина x: ${JSON.stringify(wall.lnx)}<br>
                    &nbsp;&nbsp;длина y: ${JSON.stringify(wall.lny)}<br>
                    <strong>Проемы:</strong><br>
                    ${holesHtml}
                </div><hr>`;
        }).join("");

        // Отображение данных
        output.innerHTML = `
            <strong>Размер дома:</strong><br>
            <strong>По X:</strong> ${sizeX}<br>
            <strong>По Y:</strong> ${sizeY}<br>
            ${wallsHtml}
        `;
    } catch (error) {
        try{
            //Если файл не открылся попробуем zip открыть его с помощью FileReader
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async () => {
                const zip = new JSZip();
                await zip.loadAsync(reader.result);
                const fileContent = await zip.file("plan").async("string");
                const jsonData = JSON.parse(fileContent);
                //Разберем json циклом по всем объектам и выведем их в консоль
                // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                const floors = [];
                let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;

                for (const floorUid in jsonData.floors) {
                    const floor = jsonData.floors[floorUid];
                    const floorData = {
                        floor_uid: floorUid,
                        plans_count: Object.keys(floor.plans).length,
                        plans: []
                    };
                    
                    for (const planId in floor.plans) {
                        const plan = floor.plans[planId];
                        const planData = {
                            plan_id: planId,
                            walls: []
                        };
                        
                        for (const wallKey in plan.data.walls) {
                            const wall = plan.data.walls[wallKey];
                            //output.textContent = "point 2";
                            if (wall.role === "wall") {
                                
                                const wallData = {
                                    id: wall.id,
                                    p1: wall.p1,
                                    p2: wall.p2,
                                    depth: wall.depth,
                                    height: wall.height,
                                    neighbors: wall.neighbors,
                                    holes: []
                                };
                                
                                xmin = Math.min(xmin, wall.p1.x, wall.p2.x);
                                xmax = Math.max(xmax, wall.p1.x, wall.p2.x);
                                ymin = Math.min(ymin, wall.p1.y, wall.p2.y);
                                ymax = Math.max(ymax, wall.p1.y, wall.p2.y);

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

                                planData.walls.push(wallData);
                            }
                        }

                        floorData.plans.push(planData);
                    }

                    floors.push(floorData);
                }

                const floorsHtml = floors.map(floor => {
                    const plansHtml = floor.plans.map(plan => {
                        const wallsHtml = plan.walls.map(wall => {
                            const holesHtml = wall.holes.map(hole => `
                                <div style="margin-left: 60px;">
                                    <strong>Hole ID:</strong> ${hole.id}<br>
                                    &nbsp;&nbsp;Type:</strong> ${hole.type}<br>
                                    &nbsp;&nbsp;Group:</strong> ${hole.group}<br>
                                    &nbsp;&nbsp;Width:</strong> ${hole.width}<br>
                                    &nbsp;&nbsp;Height:</strong> ${hole.height}<br>
                                    &nbsp;&nbsp;Depth:</strong> ${hole.depth}<br>
                                </div>
                            `).join("");

                            return `
                                <div style="margin-left: 40px;">
                                    <strong>Wall ID:</strong> ${wall.id}<br>
                                    <strong>Coordinates:</strong><br>
                                    &nbsp;&nbsp;p1: ${JSON.stringify(wall.p1)}<br>
                                    &nbsp;&nbsp;p2: ${JSON.stringify(wall.p2)}<br>
                                    &nbsp;&nbsp;Depth: ${wall.depth}<br>
                                    &nbsp;&nbsp;Height: ${wall.height}<br>
                                    &nbsp;&nbsp;Neighbors: ${JSON.stringify(wall.neighbors)}<br>
                                    <strong>Holes:</strong><br>
                                    ${holesHtml}
                                </div>
                            `;
                        }).join("");

                        return `
                            <div style="margin-left: 20px;">
                                <strong>Plan ID:</strong> ${plan.plan_id}<br>
                                <strong>Walls:</strong><br>
                                ${wallsHtml}
                            </div>
                        `;
                    }).join("");

                    return `
                        <div>
                            <strong>Floor UID:</strong> ${floor.floor_uid}<br>
                            <strong>Plans Count:</strong> ${floor.plans_count}<br>
                            <strong>Plans:</strong><br>
                            ${plansHtml}
                        </div>
                    `;
                }).join("");

                output.innerHTML = `
                    <strong>House Dimensions:</strong><br>
                    <strong>X:</strong> ${xmax - xmin}<br>
                    <strong>Y:</strong> ${ymax - ymin}<br>
                    ${floorsHtml}
                `;
              
               //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
            };
        }
        catch (error) {
            output.textContent = `Error processing file: ${error.message}`;
        }    
    }
});
