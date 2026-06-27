import { ALGORITHMS } from "../algorithms";
import PerformanceCharts from "./PerformanceCharts";

export default function ComparisonPanel({ results }) {
  if (!results?.length) return null;

  return (
    <div className="glassCard comparisonPanel">
      <h3 className="cardTitle">Algorithm comparison</h3>
      <div className="tableWrap">
        <table className="dataTable">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Status</th>
              <th>Nodes</th>
              <th>Path</th>
              <th>Cost</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.algoId}>
                <td>{ALGORITHMS[r.algoId]?.name ?? r.algoId}</td>
                <td>{r.path.length > 0 ? "Found" : "None"}</td>
                <td>{r.visitedInOrder.length}</td>
                <td>{r.path.length > 0 ? `${r.path.length} steps` : "N/A"}</td>
                <td>{ALGORITHMS[r.algoId]?.weighted && r.path.length ? r.pathCost : "N/A"}</td>
                <td>{r.time} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PerformanceCharts results={results} />
    </div>
  );
}
