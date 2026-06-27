import { bfs } from "./bfs";
import { dfs } from "./dfs";
import { dijkstra } from "./dijkstra";
import { astar } from "./astar";
import { greedyBestFirst } from "./greedy";
import { bidirectionalBfs } from "./bidirectionalBfs";
import { cloneGridForSearch, getPathCost } from "./helpers";

export const COMPARE_IDS = ["bfs", "dfs", "dijkstra", "astar"];

export const ALGORITHMS = {
  bfs: {
    id: "bfs",
    name: "Breadth First Search",
    summary: "Explores in layers. Best for unweighted shortest paths.",
    weighted: false,
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    advantages: ["Guarantees fewest steps on unweighted grids", "Simple to implement"],
    disadvantages: ["Ignores terrain weights", "Can explore many nodes on large maps"],
    useCases: ["Maze solving", "Social networks", "Uniform cost grids"],
    run: bfs,
  },
  dfs: {
    id: "dfs",
    name: "Depth First Search",
    summary: "Explores as deep as possible before backtracking.",
    weighted: false,
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    advantages: ["Low memory on sparse graphs", "Good for exhaustive exploration"],
    disadvantages: ["Does not guarantee shortest path", "Can get stuck in deep branches"],
    useCases: ["Topological sort", "Cycle detection", "Maze generation"],
    run: dfs,
  },
  dijkstra: {
    id: "dijkstra",
    name: "Dijkstra",
    summary: "Finds the lowest total cost path on weighted terrain.",
    weighted: true,
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V)",
    advantages: ["Optimal on weighted graphs", "Works with any non negative weights"],
    disadvantages: ["Explores more nodes than A*", "Slower on large maps"],
    useCases: ["GPS routing", "Network routing", "Delivery optimization"],
    run: dijkstra,
  },
  astar: {
    id: "astar",
    name: "A Star",
    summary: "Uses a heuristic to reach the goal faster while staying optimal.",
    weighted: true,
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V)",
    advantages: ["Fewer nodes explored than Dijkstra", "Optimal with admissible heuristic"],
    disadvantages: ["Needs a good heuristic", "More complex implementation"],
    useCases: ["Game AI", "Robotics", "Map navigation"],
    run: (grid, start, end, onStep, options) => astar(grid, start, end, onStep, options),
  },
  greedy: {
    id: "greedy",
    name: "Greedy Best First",
    summary: "Moves toward the goal using distance estimate only.",
    weighted: false,
    timeComplexity: "O(V log V)",
    spaceComplexity: "O(V)",
    advantages: ["Very fast", "Minimal overhead"],
    disadvantages: ["Not optimal", "Can follow dead end paths"],
    useCases: ["Quick approximations", "Prototyping routes"],
    run: (grid, start, end, onStep, options) => greedyBestFirst(grid, start, end, onStep, options),
  },
  bidirectional: {
    id: "bidirectional",
    name: "Bidirectional BFS",
    summary: "Searches from both start and end at the same time.",
    weighted: false,
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    advantages: ["Much faster on open maps", "Reduces search area"],
    disadvantages: ["Unweighted only", "More complex path reconstruction"],
    useCases: ["Large map services", "Meeting in the middle problems"],
    run: bidirectionalBfs,
  },
};

export const ALGORITHM_LIST = Object.values(ALGORITHMS);

function invoke(id, grid, start, end, onStep, options) {
  const algo = ALGORITHMS[id];
  if (!algo) throw new Error(`Unknown algorithm: ${id}`);
  if (id === "astar" || id === "greedy") {
    return algo.run(grid, start, end, onStep, options);
  }
  return algo.run(grid, start, end, onStep);
}

export function runAlgorithm(id, grid, startNode, endNode, options = {}) {
  const onStep = options.onStep ?? null;
  const result = invoke(id, grid, startNode, endNode, onStep, options);
  return {
    ...result,
    pathCost: getPathCost(result.path),
    algoId: id,
  };
}

export function runComparison(grid, startNode, endNode, options = {}) {
  return COMPARE_IDS.map(id => {
    const snapshot = cloneGridForSearch(grid);
    const start = snapshot[startNode.row][startNode.col];
    const end = snapshot[endNode.row][endNode.col];
    const t0 = performance.now();
    const result = runAlgorithm(id, snapshot, start, end, options);
    return {
      ...result,
      time: Math.round(performance.now() - t0),
    };
  });
}

export function getVisitedColor(algoId) {
  const colors = {
    bfs: "#7dd3fc",
    dfs: "#fdba74",
    dijkstra: "#93c5fd",
    astar: "#a5b4fc",
    greedy: "#f9a8d4",
    bidirectional: "#86efac",
  };
  return colors[algoId] ?? "#bae6fd";
}
