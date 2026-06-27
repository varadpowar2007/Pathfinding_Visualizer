import { ALGORITHMS } from "../algorithms";
import { TERRAIN } from "../algorithms/helpers";

export function recommendAlgorithm(grid) {
  let weightedCells = 0;
  let blockedCells = 0;
  let openCells = 0;
  let totalPassable = 0;

  grid.flat().forEach(node => {
    if (node.type === "start" || node.type === "end") return;
    const t = TERRAIN[node.type];
    if (!t) return;
    if (!t.passable) blockedCells++;
    else {
      totalPassable++;
      if (t.weight > 1) weightedCells++;
      else openCells++;
    }
  });

  const hasWeights = weightedCells > totalPassable * 0.15;
  const denseObstacles = blockedCells > grid.length * grid[0].length * 0.25;

  if (hasWeights && denseObstacles) {
    return {
      id: "astar",
      name: ALGORITHMS.astar.name,
      reason: "This map has weighted terrain and many obstacles. A* should find the optimal route while exploring fewer cells than Dijkstra.",
    };
  }

  if (hasWeights) {
    return {
      id: "dijkstra",
      name: ALGORITHMS.dijkstra.name,
      reason: "Weighted terrain is present. Dijkstra guarantees the lowest total movement cost across different surfaces.",
    };
  }

  if (denseObstacles) {
    return {
      id: "astar",
      name: ALGORITHMS.astar.name,
      reason: "Many obstacles create a complex search space. A* uses a goal estimate to navigate efficiently on unweighted cells.",
    };
  }

  if (openCells > totalPassable * 0.7) {
    return {
      id: "bfs",
      name: ALGORITHMS.bfs.name,
      reason: "Mostly open terrain with uniform cost. BFS finds the shortest path by steps with simple, predictable behavior.",
    };
  }

  return {
    id: "astar",
    name: ALGORITHMS.astar.name,
    reason: "A balanced default for mixed maps. It combines cost awareness with heuristic guidance for solid performance.",
  };
}
