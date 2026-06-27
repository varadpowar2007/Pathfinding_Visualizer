import { getNeighbours, tracePath, getNodeWeight, MIN_TERRAIN_WEIGHT } from "./helpers";
import { getHeuristic } from "./heuristics";
import { MinHeap } from "./priorityQueue";
import { createTracer } from "./trace";

export function astar(grid, startNode, endNode, onStep, options = {}) {
  const visitedInOrder = [];
  const trace = createTracer(onStep, "A*");
  const heuristic = getHeuristic(options.heuristic ?? "manhattan");
  const openSet = new MinHeap((a, b) => a.f - b.f || a.h - b.h || a.row - b.row || a.col - b.col);
  const closedSet = new Set();

  startNode.g = 0;
  startNode.h = heuristic(startNode, endNode) * MIN_TERRAIN_WEIGHT;
  startNode.f = startNode.h;
  openSet.push(startNode);

  while (!openSet.isEmpty()) {
    const current = openSet.pop();
    const key = `${current.row},${current.col}`;
    if (closedSet.has(key)) continue;
    closedSet.add(key);

    current.isVisited = true;
    visitedInOrder.push(current);
    trace.explore(current, {
      openSetSize: openSet.size,
      closedSetSize: closedSet.size,
      currentCost: current.g,
    });

    if (current.row === endNode.row && current.col === endNode.col) {
      trace.goal(current);
      trace.done();
      return { visitedInOrder, path: tracePath(current) };
    }

    for (const neighbour of getNeighbours(current, grid)) {
      const nKey = `${neighbour.row},${neighbour.col}`;
      if (closedSet.has(nKey)) continue;

      const tentativeG = current.g + getNodeWeight(neighbour);
      if (tentativeG < neighbour.g) {
        neighbour.g = tentativeG;
        neighbour.h = heuristic(neighbour, endNode) * MIN_TERRAIN_WEIGHT;
        neighbour.f = neighbour.g + neighbour.h;
        neighbour.parent = current;
        openSet.push(neighbour);
        trace.relax(neighbour, {
          openSetSize: openSet.size,
          closedSetSize: closedSet.size,
          newCost: tentativeG,
        });
      }
    }
  }

  trace.done("No path found.");
  return { visitedInOrder, path: [] };
}
