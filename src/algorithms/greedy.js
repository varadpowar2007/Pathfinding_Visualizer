import { getNeighbours, tracePath } from "./helpers";
import { getHeuristic } from "./heuristics";
import { MinHeap } from "./priorityQueue";
import { createTracer } from "./trace";

export function greedyBestFirst(grid, startNode, endNode, onStep, options = {}) {
  const visitedInOrder = [];
  const trace = createTracer(onStep, "Greedy");
  const heuristic = getHeuristic(options.heuristic ?? "manhattan");
  const openSet = new MinHeap((a, b) => a.h - b.h || a.row - b.row || a.col - b.col);
  const closedSet = new Set();

  startNode.h = heuristic(startNode, endNode);
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
      currentCost: current.h,
    });

    if (current.row === endNode.row && current.col === endNode.col) {
      trace.goal(current);
      trace.done();
      return { visitedInOrder, path: tracePath(current) };
    }

    for (const neighbour of getNeighbours(current, grid)) {
      const nKey = `${neighbour.row},${neighbour.col}`;
      if (closedSet.has(nKey)) continue;
      neighbour.h = heuristic(neighbour, endNode);
      neighbour.parent = current;
      openSet.push(neighbour);
      trace.relax(neighbour, {
        openSetSize: openSet.size,
        closedSetSize: closedSet.size,
        newCost: neighbour.h,
      });
    }
  }

  trace.done("No path found.");
  return { visitedInOrder, path: [] };
}
