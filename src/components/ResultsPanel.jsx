import { ALGORITHMS } from "../algorithms";

export default function ResultsPanel({ stats, algo, isRunning, compareMode }) {
  if (isRunning) {
    return (
      <div className="glassCard resultsPanel resultsEmpty">
        <div className="loadingPulse" />
        <p className="resultsStatus">Running search...</p>
        <p className="blockHint">Statistics will appear here when the run completes.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glassCard resultsPanel resultsEmpty">
        <h2 className="cardTitle">Results</h2>
        <p className="blockHint">
          {compareMode
            ? "Run comparison mode to see side by side metrics for BFS, DFS, Dijkstra, and A*."
            : "Run a visualization to see path length, cost, and execution time."}
        </p>
      </div>
    );
  }

  const algoInfo = ALGORITHMS[algo];
  const rows = [
    { label: "Algorithm", value: algoInfo?.name ?? algo },
    { label: "Status", value: stats.found ? "Path found" : "No path found", error: !stats.found },
    { label: "Cells explored", value: stats.explored.toLocaleString() },
    { label: "Path length", value: stats.found ? `${stats.pathLen} steps` : "Not available" },
  ];

  if (algoInfo?.weighted && stats.found) {
    rows.push({ label: "Total route cost", value: stats.pathCost.toLocaleString() });
  }
  rows.push({ label: "Execution time", value: `${stats.time} ms` });

  return (
    <div className="glassCard resultsPanel">
      <div className="resultsHeader">
        <h2 className="cardTitle">Results</h2>
        <span className={`badge ${stats.found ? "badgeOk" : "badgeFail"}`}>
          {stats.found ? "Success" : "Failed"}
        </span>
      </div>
      <table className="resultsTable">
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <th>{row.label}</th>
              <td className={row.error ? "valueError" : ""}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
