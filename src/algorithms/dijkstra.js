import { getNeighbours, tracePath, getNodeWeight } from "./helpers";
import { MinHeap } from "./priorityQueue";
import { createTracer } from "./trace";

export function dijkstra(grid, startNode, endNode, onStep) {
  const visitedInOrder = [];
  const trace = createTracer(onStep, "Dijkstra");
  const heap = new MinHeap((a, b) => a.distance - b.distance || a.row - b.row || a.col - b.col);
  const settled = new Set();

  startNode.distance = 0;
  heap.push(startNode);

  while (!heap.isEmpty()) {
    const current = heap.pop();
    const key = `${current.row},${current.col}`;
    if (settled.has(key)) continue;
    settled.add(key);

    if (current.distance === Infinity) break;

    current.isVisited = true;
    visitedInOrder.push(current);
    trace.explore(current, {
      openSetSize: heap.size,
      closedSetSize: settled.size,
      currentCost: current.distance,
    });

    if (current.row === endNode.row && current.col === endNode.col) {
      trace.goal(current);
      trace.done();
      return { visitedInOrder, path: tracePath(current) };
    }

    for (const neighbour of getNeighbours(current, grid)) {
      const nKey = `${neighbour.row},${neighbour.col}`;
      if (settled.has(nKey)) continue;

      const newDist = current.distance + getNodeWeight(neighbour);
      if (newDist < neighbour.distance) {
        neighbour.distance = newDist;
        neighbour.parent = current;
        heap.push(neighbour);
        trace.relax(neighbour, {
          openSetSize: heap.size,
          closedSetSize: settled.size,
          newCost: newDist,
        });
      }
    }
  }

  trace.done("No path found.");
  return { visitedInOrder, path: [] };
}
