export const HEURISTICS = {
  manhattan: {
    id: "manhattan",
    name: "Manhattan",
    fn: (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col),
  },
  euclidean: {
    id: "euclidean",
    name: "Euclidean",
    fn: (a, b) => Math.hypot(a.row - b.row, a.col - b.col),
  },
  diagonal: {
    id: "diagonal",
    name: "Diagonal (Octile)",
    fn: (a, b) => {
      const dr = Math.abs(a.row - b.row);
      const dc = Math.abs(a.col - b.col);
      return dr + dc + (Math.SQRT2 - 2) * Math.min(dr, dc);
    },
  },
  chebyshev: {
    id: "chebyshev",
    name: "Chebyshev",
    fn: (a, b) => Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col)),
  },
};

export function getHeuristic(name) {
  return HEURISTICS[name]?.fn ?? HEURISTICS.manhattan.fn;
}
