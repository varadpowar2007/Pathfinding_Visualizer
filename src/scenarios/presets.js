import { createGrid, ROWS, COLS } from "../algorithms/helpers";

function fillRect(grid, r1, c1, r2, c2, type) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (grid[r][c].type !== "start" && grid[r][c].type !== "end") {
        grid[r][c].type = type;
      }
    }
  }
}

function carveRoadStrip(grid, fixedRow, fixedCol, horizontal, length) {
  if (horizontal) {
    for (let c = fixedCol; c < fixedCol + length && c < COLS; c++) {
      if (grid[fixedRow][c].type !== "start" && grid[fixedRow][c].type !== "end") {
        grid[fixedRow][c].type = "road";
      }
    }
  } else {
    for (let r = fixedRow; r < fixedRow + length && r < ROWS; r++) {
      if (grid[r][fixedCol].type !== "start" && grid[r][fixedCol].type !== "end") {
        grid[r][fixedCol].type = "road";
      }
    }
  }
}

export const SCENARIOS = {
  blank: {
    id: "blank",
    name: "Open Field",
    description: "Empty map with no obstacles. Good for comparing basic search behavior.",
    apply: (grid) => grid,
  },
  cityBlocks: {
    id: "cityBlocks",
    name: "City Blocks",
    description: "City streets with building blocks between roads.",
    apply: (grid) => {
      for (let r = 2; r < ROWS - 2; r += 4) {
        for (let c = 2; c < COLS - 2; c += 6) {
          fillRect(grid, r, c, r + 1, c + 3, "wall");
        }
      }
      for (let c = 0; c < COLS; c += 2) {
        for (let r = 0; r < ROWS; r++) {
          if (grid[r][c].type !== "start" && grid[r][c].type !== "end" && grid[r][c].type !== "wall") {
            grid[r][c].type = "road";
          }
        }
      }
      return grid;
    },
  },
  highway: {
    id: "highway",
    name: "Highway Corridor",
    description: "Main roads through grass fields. Weighted algorithms should prefer the roads.",
    apply: (grid) => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c].type === "start" || grid[r][c].type === "end") continue;
          grid[r][c].type = "grass";
        }
      }
      carveRoadStrip(grid, 10, 0, true, COLS);
      carveRoadStrip(grid, 0, 24, false, ROWS);
      for (let c = 20; c < 30; c++) grid[10][c].type = "road";
      return grid;
    },
  },
  muddyTrail: {
    id: "muddyTrail",
    name: "Muddy Trail",
    description: "A muddy shortcut versus a longer road around it.",
    apply: (grid) => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c].type !== "start" && grid[r][c].type !== "end") {
            grid[r][c].type = "road";
          }
        }
      }
      for (let c = 8; c < 42; c++) {
        if (grid[10][c].type !== "start" && grid[10][c].type !== "end") {
          grid[10][c].type = "mud";
        }
      }
      for (let r = 6; r <= 14; r++) {
        grid[r][5].type = "road";
        grid[r][45].type = "road";
      }
      return grid;
    },
  },
  warehouse: {
    id: "warehouse",
    name: "Warehouse Aisles",
    description: "Storage racks with narrow aisles, like a warehouse layout.",
    apply: (grid) => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c].type !== "start" && grid[r][c].type !== "end") {
            grid[r][c].type = "road";
          }
        }
      }
      for (let c = 3; c < COLS - 3; c += 5) {
        for (let r = 1; r < ROWS - 1; r++) {
          if (grid[r][c].type !== "start" && grid[r][c].type !== "end") {
            grid[r][c].type = "wall";
          }
        }
      }
      return grid;
    },
  },
  riverCrossing: {
    id: "riverCrossing",
    name: "River Crossing",
    description: "A river in the middle with a few road bridges to cross it.",
    apply: (grid) => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c].type !== "start" && grid[r][c].type !== "end") {
            grid[r][c].type = "grass";
          }
        }
      }
      for (let r = 0; r < ROWS; r++) {
        for (let c = 22; c < 28; c++) {
          if (grid[r][c].type !== "start" && grid[r][c].type !== "end") {
            grid[r][c].type = "water";
          }
        }
      }
      for (const bridgeRow of [4, 10, 17]) {
        for (let c = 20; c < 30; c++) {
          grid[bridgeRow][c].type = "bridge";
        }
      }
      return grid;
    },
  },
};

export const SCENARIO_LIST = Object.values(SCENARIOS);

export function applyScenario(scenarioId, startPos, endPos) {
  const grid = createGrid();
  grid[startPos.row][startPos.col].type = "start";
  grid[endPos.row][endPos.col].type = "end";
  const scenario = SCENARIOS[scenarioId] ?? SCENARIOS.blank;
  return scenario.apply(grid);
}
