import { getNeighbours, tracePath } from "./helpers";
import { createTracer } from "./trace";

export function dfs(grid, startNode, endNode, onStep) {
  const visitedInOrder = [];
  const trace = createTracer(onStep, "DFS");
  startNode.distance = 0;
  const stack = [startNode];
  const seen = new Set([`${startNode.row},${startNode.col}`]);

  while (stack.length > 0) {
    const current = stack.pop();

    if (current.isVisited) continue;

    current.isVisited = true;
    visitedInOrder.push(current);
    trace.explore(current, {
      openSetSize: stack.length,
      closedSetSize: visitedInOrder.length,
      currentCost: current.distance,
    });

    if (current.row === endNode.row && current.col === endNode.col) {
      trace.goal(current);
      trace.done();
      return { visitedInOrder, path: tracePath(current) };
    }

    for (const neighbour of getNeighbours(current, grid)) {
      const nKey = `${neighbour.row},${neighbour.col}`;
      if (seen.has(nKey)) continue;
      seen.add(nKey);
      neighbour.parent = current;
      neighbour.distance = (current.distance === Infinity ? 0 : current.distance) + 1;
      stack.push(neighbour);
      trace.relax(neighbour, {
        openSetSize: stack.length,
        closedSetSize: visitedInOrder.length,
        newCost: neighbour.distance,
      });
    }
  }

  trace.done("No path found.");
  return { visitedInOrder, path: [] };
}
