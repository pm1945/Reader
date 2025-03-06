function calculateArea(points) {
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
        let j = (i + 1) % n;
        area += points[i][0] * points[j][1] - points[j][0] * points[i][1];
    }
    return Math.abs(area / 2);
}

function calculatePerimeter(points) {
    let perimeter = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
        let j = (i + 1) % n;
        let dx = points[j][0] - points[i][0];
        let dy = points[j][1] - points[i][1];
        perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
}

function findRooms(walls) {
    let edges = new Map();
    
    walls.forEach(([x1, y1, x2, y2]) => {
        let p1 = `${x1},${y1}`;
        let p2 = `${x2},${y2}`;
        if (!edges.has(p1)) edges.set(p1, []);
        if (!edges.has(p2)) edges.set(p2, []);
        edges.get(p1).push(p2);
        edges.get(p2).push(p1);
    });
    
    let visitedEdges = new Set();
    let rooms = [];
    
    function traverse(start, path, edgeSet) {
        let last = path[path.length - 1];
        if (path.length > 2 && last === start) {
            rooms.push(path.map(p => p.split(',').map(Number)));
            return;
        }
        
        for (let neighbor of edges.get(last)) {
            let edge = `${last}-${neighbor}`;
            let reverseEdge = `${neighbor}-${last}`;
            if (!edgeSet.has(edge) && !edgeSet.has(reverseEdge)) {
                edgeSet.add(edge);
                traverse(start, [...path, neighbor], edgeSet);
                edgeSet.delete(edge);
            }
        }
    }
    
    for (let node of edges.keys()) {
        for (let neighbor of edges.get(node)) {
            let edge = `${node}-${neighbor}`;
            let reverseEdge = `${neighbor}-${node}`;
            if (!visitedEdges.has(edge) && !visitedEdges.has(reverseEdge)) {
                visitedEdges.add(edge);
                traverse(node, [node], new Set([edge]));
            }
        }
    }
    
    return rooms;
}

// Входные данные: список стен без сортировки
const walls = [
    [4, 0, 4, 3],
    [0, 3, 0, 0],
    [4, 3, 0, 3],
    [0, 0, 4, 0]
];

const rooms = findRooms(walls);
rooms.forEach((room, index) => {
    console.log(`Комната ${index + 1}:`);
    console.log(`  Площадь: ${calculateArea(room)} кв. единиц`);
    console.log(`  Периметр: ${calculatePerimeter(room)} единиц`);
});
