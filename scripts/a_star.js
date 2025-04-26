window.addEventListener("load", function() {
    let gridSize = 5;     let grid = [];        let cellSize = 50;    
  const canvas = document.getElementById("mapCanvas");
  const ctx = canvas.getContext("2d");
  const statusMessage = document.getElementById("statusMessage");

    let mode = "obstacle";   let startCell = null;
  let endCell = null;

    const gridSizeInput = document.getElementById("gridSizeInput");
  const generateMapBtn = document.getElementById("generateMapBtn");
  const modeSelect = document.getElementById("modeSelect");
  const runAlgorithmBtn = document.getElementById("runAlgorithmBtn");

    
    modeSelect.addEventListener("change", function() {
    mode = modeSelect.value;
  });

    generateMapBtn.addEventListener("click", function() {
    gridSize = parseInt(gridSizeInput.value);
        cellSize = Math.floor(500 / gridSize);
    canvas.width = cellSize * gridSize;
    canvas.height = cellSize * gridSize;

        grid = [];
    for (let y = 0; y < gridSize; y++) {
      let row = [];
      for (let x = 0; x < gridSize; x++) {
        row.push("empty");
      }
      grid.push(row);
    }

    startCell = null;
    endCell = null;
    statusMessage.textContent = "Карта сгенерирована. Установите препятствия, начало и конец.";
    drawGrid();
  });

    canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return;

        if (mode === "obstacle") {
                  grid[y][x] = (grid[y][x] === "obstacle") ? "empty" : "obstacle";
                      } 
    else if (mode === "start") {
            if (grid[y][x] === "obstacle") {
        statusMessage.textContent = "Нельзя ставить начало на препятствие!";
        return; 
      }
            if (startCell) {
        grid[startCell.y][startCell.x] = "empty";
      }
            clearPathCells();

      grid[y][x] = "start";
      startCell = { x, y };
    } 
    else if (mode === "end") {
            if (grid[y][x] === "obstacle") {
        statusMessage.textContent = "Нельзя ставить конец на препятствие!";
        return;
      }
            if (endCell) {
        grid[endCell.y][endCell.x] = "empty";
      }
            clearPathCells();

      grid[y][x] = "end";
      endCell = { x, y };
    }

    drawGrid();
  });

    runAlgorithmBtn.addEventListener("click", function() {
    runPathFinding();
  });

  
    function drawGrid() {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        let state = grid[y][x];
        switch (state) {
          case "empty":
            ctx.fillStyle = "#ffffff";
            break;
          case "obstacle":
            ctx.fillStyle = "#000000";
            break;
          case "start":
            ctx.fillStyle = "#00ff00";
            break;
          case "end":
            ctx.fillStyle = "#ff0000";
            break;
          case "path":
            ctx.fillStyle = "#ffff00";
            break;
          default:
            ctx.fillStyle = "#ffffff";
        }
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.strokeStyle = "#cccccc";
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

    function clearPathCells() {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (grid[y][x] === "path") {
          grid[y][x] = "empty";
        }
      }
    }
  }

    function runPathFinding() {
    if (!startCell || !endCell) {
      statusMessage.textContent = "Установите начальную и конечную клетку!";
      return;
    }
        clearPathCells();

    let path = findPathAStar();
    if (path) {
      statusMessage.textContent = "Маршрут найден!";
            for (let cell of path) {
        if ((cell.x === startCell.x && cell.y === startCell.y) ||
            (cell.x === endCell.x && cell.y === endCell.y)) continue;
        grid[cell.y][cell.x] = "path";
      }
    } else {
      statusMessage.textContent = "Маршрут не существует!";
    }
    drawGrid();
  }

    function findPathAStar() {
        function cellKey(cell) {
      return cell.x + "," + cell.y;
    }

    let openSet = [];
    let closedSet = new Set();

        function heuristic(a, b) {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    let startNode = {
      x: startCell.x,
      y: startCell.y,
      g: 0,
      h: heuristic(startCell, endCell),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
      let current = openSet.shift();

      if (current.x === endCell.x && current.y === endCell.y) {
                let path = [];
        let temp = current;
        while (temp) {
          path.push({ x: temp.x, y: temp.y });
          temp = temp.parent;
        }
        return path.reverse();
      }
      closedSet.add(cellKey(current));

            let directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
      ];
      for (let dir of directions) {
        let nx = current.x + dir.x;
        let ny = current.y + dir.y;
        if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) continue;
        if (grid[ny][nx] === "obstacle") continue;

        let neighbor = { x: nx, y: ny };
        if (closedSet.has(cellKey(neighbor))) continue;

        let tentativeG = current.g + 1;
        let existing = openSet.find(n => n.x === nx && n.y === ny);
        if (!existing) {
          neighbor.g = tentativeG;
          neighbor.h = heuristic(neighbor, endCell);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          openSet.push(neighbor);
        } else if (tentativeG < existing.g) {
          existing.g = tentativeG;
          existing.f = existing.g + existing.h;
          existing.parent = current;
        }
      }
    }
        return null;
  }

    generateMapBtn.click();
});
