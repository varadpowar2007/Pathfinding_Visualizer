export function createTracer(onStep, algoName) {
  const t0 = performance.now();

  return {
    explore(node, meta = {}) {
      onStep?.({
        type: "explore",
        node,
        algoName,
        message: `Exploring cell (${node.row}, ${node.col})...`,
        openSetSize: meta.openSetSize ?? 0,
        closedSetSize: meta.closedSetSize ?? 0,
        currentCost: meta.currentCost ?? 0,
        elapsed: Math.round(performance.now() - t0),
      });
    },
    relax(neighbour, meta = {}) {
      onStep?.({
        type: "relax",
        node: neighbour,
        algoName,
        message: `Updating neighbour (${neighbour.row}, ${neighbour.col}) with cost ${meta.newCost ?? "?"}`,
        openSetSize: meta.openSetSize ?? 0,
        closedSetSize: meta.closedSetSize ?? 0,
        currentCost: meta.newCost ?? 0,
        elapsed: Math.round(performance.now() - t0),
      });
    },
    goal(node) {
      onStep?.({
        type: "goal",
        node,
        algoName,
        message: "Goal reached. Reconstructing shortest path...",
        elapsed: Math.round(performance.now() - t0),
      });
    },
    done(message = "Search complete.") {
      onStep?.({
        type: "done",
        algoName,
        message,
        elapsed: Math.round(performance.now() - t0),
      });
    },
  };
}
