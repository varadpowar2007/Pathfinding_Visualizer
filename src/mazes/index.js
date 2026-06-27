import { createGrid, ROWS, COLS } from "../algorithms/helpers";

function stampStartEnd(grid, startPos, endPos) {
  grid[startPos.row][startPos.col].type = "start";
  grid[endPos.row][endPos.col].type = "end";
  return grid;
}

function carvePassage(grid, r, c) {
  if (grid[r][c].type !== "start" && grid[r][c].type !== "end") {
    grid[r][c].type = "road";
  }
}

export function mazeBacktracking(startPos, endPos) {
  const grid = createGrid().map(r => r.map(n => ({ ...n, type: "wall" })));
  stampStartEnd(grid, startPos, endPos);

  function carve(r, c) {
    const dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && grid[nr][nc].type === "wall") {
        carvePassage(grid, r + dr / 2, c + dc / 2);
        carvePassage(grid, nr, nc);
        carve(nr, nc);
      }
    }
  }

  const sr = startPos.row % 2 === 0 ? startPos.row + 1 : startPos.row;
  const sc = startPos.col % 2 === 0 ? startPos.col + 1 : startPos.col;
  carvePassage(grid, sr, sc);
  carve(sr, sc);
  stampStartEnd(grid, startPos, endPos);
  return grid;
}

export function mazeRecursiveDivision(startPos, endPos) {
  const grid = createGrid().map(r => r.map(n => ({ ...n, type: "road" })));
  stampStartEnd(grid, startPos, endPos);

  function divide(r1, c1, r2, c2) {
    const height = r2 - r1 + 1;
    const width = c2 - c1 + 1;
    if (height < 3 || width < 3) return;

    const wallRow = r1 + 1 + Math.floor(Math.random() * (height - 2));
    const wallCol = c1 + 1 + Math.floor(Math.random() * (width - 2));

    for (let c = c1; c <= c2; c++) {
      if (grid[wallRow][c].type !== "start" && grid[wallRow][c].type !== "end") {
        grid[wallRow][c].type = "wall";
      }
    }
    for (let r = r1; r <= r2; r++) {
      if (grid[r][wallCol].type !== "start" && grid[r][wallCol].type !== "end") {
        grid[r][wallCol].type = "wall";
      }
    }

    const openings = [];
    for (let c = c1; c <= c2; c++) if (c !== wallCol) openings.push([wallRow, c]);
    for (let r = r1; r <= r2; r++) if (r !== wallRow) openings.push([r, wallCol]);
    const [or, oc] = openings[Math.floor(Math.random() * openings.length)];
    grid[or][oc].type = "road";

    divide(r1, c1, wallRow - 1, wallCol - 1);
    divide(r1, wallCol + 1, wallRow - 1, c2);
    divide(wallRow + 1, c1, r2, wallCol - 1);
    divide(wallRow + 1, wallCol + 1, r2, c2);
  }

  divide(1, 1, ROWS - 2, COLS - 2);
  stampStartEnd(grid, startPos, endPos);
  return grid;
}

export function mazePrims(startPos, endPos) {
  const grid = createGrid().map(r => r.map(n => ({ ...n, type: "wall" })));
  stampStartEnd(grid, startPos, endPos);

  const startR = startPos.row % 2 === 1 ? startPos.row : startPos.row + 1;
  const startC = startPos.col % 2 === 1 ? startPos.col : startPos.col + 1;
  carvePassage(grid, startR, startC);

  const walls = [];
  const addWalls = (r, c) => {
    [[0, 2], [2, 0], [0, -2], [-2, 0]].forEach(([dr, dc]) => {
      const wr = r + dr / 2;
      const wc = c + dc / 2;
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1) {
        walls.push({ wr, wc, nr, nc, pr: r, pc: c });
      }
    });
  };
  addWalls(startR, startC);

  while (walls.length > 0) {
    const idx = Math.floor(Math.random() * walls.length);
    const { wr, wc, nr, nc } = walls.splice(idx, 1)[0];
    if (grid[nr][nc].type === "wall") {
      carvePassage(grid, wr, wc);
      carvePassage(grid, nr, nc);
      addWalls(nr, nc);
    }
  }

  stampStartEnd(grid, startPos, endPos);
  return grid;
}

export function mazeKruskal(startPos, endPos) {
  const grid = createGrid().map(r => r.map(n => ({ ...n, type: "wall" })));
  stampStartEnd(grid, startPos, endPos);

  const cells = [];
  for (let r = 1; r < ROWS - 1; r += 2) {
    for (let c = 1; c < COLS - 1; c += 2) {
      cells.push({ r, c, id: `${r},${c}` });
      carvePassage(grid, r, c);
    }
  }

  const parent = {};
  cells.forEach(c => { parent[c.id] = c.id; });

  function find(id) {
    if (parent[id] !== id) parent[id] = find(parent[id]);
    return parent[id];
  }

  function unite(a, b) {
    parent[find(a)] = find(b);
  }

  const edges = [];
  cells.forEach(({ r, c, id }) => {
    [[0, 2], [2, 0]].forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1) {
        edges.push({ r1: r, c1: c, r2: nr, c2: nc, id1: id, id2: `${nr},${nc}` });
      }
    });
  });
  edges.sort(() => Math.random() - 0.5);

  edges.forEach(({ r1, c1, r2, c2, id1, id2 }) => {
    if (find(id1) !== find(id2)) {
      unite(id1, id2);
      carvePassage(grid, (r1 + r2) / 2, (c1 + c2) / 2);
    }
  });

  stampStartEnd(grid, startPos, endPos);
  return grid;
}

export const MAZE_ALGORITHMS = {
  backtracking: { id: "backtracking", name: "Recursive Backtracking", run: mazeBacktracking },
  division: { id: "division", name: "Recursive Division", run: mazeRecursiveDivision },
  prim: { id: "prim", name: "Prim's Algorithm", run: mazePrims },
  kruskal: { id: "kruskal", name: "Kruskal's Algorithm", run: mazeKruskal },
};

export const MAZE_LIST = Object.values(MAZE_ALGORITHMS);

export function generateMaze(type, startPos, endPos) {
  const maze = MAZE_ALGORITHMS[type] ?? MAZE_ALGORITHMS.backtracking;
  return maze.run(startPos, endPos);
}
