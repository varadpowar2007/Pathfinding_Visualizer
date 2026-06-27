export const ROWS = 22;
export const COLS = 50;

export const TERRAIN = {
  road:     { weight: 1, label: "Road",     passable: true },
  grass:    { weight: 3, label: "Grass",    passable: true },
  mud:      { weight: 5, label: "Mud",      passable: true },
  sand:     { weight: 4, label: "Sand",     passable: true },
  snow:     { weight: 6, label: "Snow",     passable: true },
  forest:   { weight: 7, label: "Forest",   passable: true },
  mountain: { weight: 10, label: "Mountain", passable: true },
  bridge:   { weight: 1, label: "Bridge",   passable: true },
  wall:     { weight: Infinity, label: "Building", passable: false },
  water:    { weight: Infinity, label: "Water",    passable: false },
};

export const TERRAIN_COLORS = {
  road: "#94a3b8",
  grass: "#86efac",
  mud: "#d97706",
  sand: "#fde68a",
  snow: "#e0f2fe",
  forest: "#166534",
  mountain: "#78716c",
  bridge: "#fcd34d",
  wall: "#1e293b",
  water: "#3b82f6",
  start: "#16a34a",
  end: "#dc2626",
};

export const MIN_TERRAIN_WEIGHT = 1;

export function createNode(row, col) {
  return {
    row,
    col,
    type: "road",
    distance: Infinity,
    g: Infinity,
    h: 0,
    f: Infinity,
    parent: null,
    isVisited: false,
    isPath: false,
    visitCount: 0,
  };
}

export function createGrid() {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => createNode(r, c))
  );
}

export function isPassable(node) {
  if (node.type === "start" || node.type === "end") return true;
  const terrain = TERRAIN[node.type];
  if (terrain) return terrain.passable;
  return true;
}

export function getNodeWeight(node) {
  if (node.type === "start" || node.type === "end") return 1;
  const terrain = TERRAIN[node.type];
  return terrain ? terrain.weight : 1;
}

export function getPathCost(path) {
  return path.reduce((sum, node) => sum + getNodeWeight(node), 0);
}

export function getNeighbours(node, grid) {
  const { row, col } = node;
  const neighbours = [];
  if (row > 0)        neighbours.push(grid[row - 1][col]);
  if (row < ROWS - 1) neighbours.push(grid[row + 1][col]);
  if (col > 0)        neighbours.push(grid[row][col - 1]);
  if (col < COLS - 1) neighbours.push(grid[row][col + 1]);
  return neighbours.filter(isPassable);
}

export function tracePath(endNode) {
  const path = [];
  let current = endNode;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

export function manhattan(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function resetNodeSearchState(node) {
  node.distance = Infinity;
  node.g = Infinity;
  node.f = Infinity;
  node.h = 0;
  node.parent = null;
  node.isVisited = false;
  node.isPath = false;
}

export function cloneGridForSearch(grid) {
  return grid.map(row =>
    row.map(node => {
      const copy = { ...node };
      resetNodeSearchState(copy);
      return copy;
    })
  );
}

export function gridToSerializable(grid, startPos, endPos) {
  return {
    version: 1,
    rows: ROWS,
    cols: COLS,
    start: startPos,
    end: endPos,
    cells: grid.map(row => row.map(n => n.type)),
  };
}

export function gridFromSerializable(data) {
  const grid = createGrid();
  data.cells.forEach((row, r) => {
    row.forEach((type, c) => {
      grid[r][c].type = type;
    });
  });
  return grid;
}

export function getHeatmapColor(count, maxCount) {
  if (!count || !maxCount) return null;
  const t = Math.min(count / maxCount, 1);
  const r = Math.round(255 * t);
  const g = Math.round(80 * (1 - t));
  const b = Math.round(255 * (1 - t * 0.5));
  return `rgba(${r}, ${g}, ${b}, ${0.35 + t * 0.45})`;
}
