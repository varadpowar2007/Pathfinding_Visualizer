import { getNeighbours, tracePath } from "./helpers";
import { createTracer } from "./trace";

export function bfs(grid, startNode, endNode, onStep) {
  const visitedInOrder = [];
  const trace = createTracer(onStep, "BFS");
  const queue = [startNode];
  startNode.distance = 0;
  const visited = new Set([`${startNode.row},${startNode.col}`]);

  while (queue.length > 0) {
    const current = queue.shift();
    current.isVisited = true;
    visitedInOrder.push(current);
    trace.explore(current, {
      openSetSize: queue.length,
      closedSetSize: visitedInOrder.length,
      currentCost: current.distance,
    });

    if (current.row === endNode.row && current.col === endNode.col) {
      trace.goal(current);
      trace.done();
      return { visitedInOrder, path: tracePath(current) };
    }

    for (const neighbour of getNeighbours(current, grid)) {
      const key = `${neighbour.row},${neighbour.col}`;
      if (visited.has(key)) continue;
      visited.add(key);
      neighbour.distance = current.distance + 1;
      neighbour.parent = current;
      queue.push(neighbour);
      trace.relax(neighbour, {
        openSetSize: queue.length,
        closedSetSize: visitedInOrder.length,
        newCost: neighbour.distance,
      });
    }
  }

  trace.done("No path found.");
  return { visitedInOrder, path: [] };
}
