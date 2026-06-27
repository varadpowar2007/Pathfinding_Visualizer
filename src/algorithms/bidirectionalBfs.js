import { getNeighbours } from "./helpers";
import { createTracer } from "./trace";

function reconstructPath(meetNode, forwardParent, backwardParent) {
  const path = [meetNode];
  let node = meetNode;

  while (forwardParent.has(`${node.row},${node.col}`)) {
    node = forwardParent.get(`${node.row},${node.col}`);
    path.unshift(node);
  }

  node = meetNode;
  while (backwardParent.has(`${node.row},${node.col}`)) {
    node = backwardParent.get(`${node.row},${node.col}`);
    path.push(node);
  }

  return path;
}

export function bidirectionalBfs(grid, startNode, endNode, onStep) {
  const visitedInOrder = [];
  const trace = createTracer(onStep, "Bidirectional BFS");
  const forwardQueue = [startNode];
  const backwardQueue = [endNode];
  const forwardVisited = new Map([[`${startNode.row},${startNode.col}`, startNode]]);
  const backwardVisited = new Map([[`${endNode.row},${endNode.col}`, endNode]]);
  const forwardParent = new Map();
  const backwardParent = new Map();

  while (forwardQueue.length > 0 && backwardQueue.length > 0) {
    const forwardCurrent = forwardQueue.shift();
    forwardCurrent.isVisited = true;
    visitedInOrder.push(forwardCurrent);
    trace.explore(forwardCurrent, {
      openSetSize: forwardQueue.length + backwardQueue.length,
      closedSetSize: visitedInOrder.length,
      currentCost: forwardCurrent.distance,
    });

    for (const neighbour of getNeighbours(forwardCurrent, grid)) {
      const key = `${neighbour.row},${neighbour.col}`;
      if (forwardVisited.has(key)) continue;
      forwardVisited.set(key, neighbour);
      forwardParent.set(key, forwardCurrent);
      neighbour.parent = forwardCurrent;

      if (backwardVisited.has(key)) {
        trace.goal(neighbour);
        trace.done();
        return {
          visitedInOrder,
          path: reconstructPath(neighbour, forwardParent, backwardParent),
        };
      }
      forwardQueue.push(neighbour);
    }

    const backwardCurrent = backwardQueue.shift();
    backwardCurrent.isVisited = true;
    visitedInOrder.push(backwardCurrent);

    for (const neighbour of getNeighbours(backwardCurrent, grid)) {
      const key = `${neighbour.row},${neighbour.col}`;
      if (backwardVisited.has(key)) continue;
      backwardVisited.set(key, neighbour);
      backwardParent.set(key, backwardCurrent);

      if (forwardVisited.has(key)) {
        neighbour.parent = forwardVisited.get(key);
        trace.goal(neighbour);
        trace.done();
        return {
          visitedInOrder,
          path: reconstructPath(neighbour, forwardParent, backwardParent),
        };
      }
      backwardQueue.push(neighbour);
    }
  }

  trace.done("No path found.");
  return { visitedInOrder, path: [] };
}
