import { ALGORITHMS } from "../algorithms";

function BarChart({ title, data, unit = "" }) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="chartBlock">
      <h4 className="chartTitle">{title}</h4>
      {data.map(d => (
        <div key={d.label} className="chartRow">
          <span className="chartLabel">{d.label}</span>
          <div className="chartTrack">
            <div className="chartFill" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="chartValue">{d.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function PerformanceCharts({ results }) {
  if (!results?.length) return null;

  const labels = results.map(r => ALGORITHMS[r.algoId]?.name ?? r.algoId);

  return (
    <div className="chartsGrid">
      <BarChart
        title="Execution time"
        unit=" ms"
        data={results.map((r, i) => ({ label: labels[i], value: r.time }))}
      />
      <BarChart
        title="Nodes explored"
        data={results.map((r, i) => ({ label: labels[i], value: r.visitedInOrder.length }))}
      />
      <BarChart
        title="Path length"
        data={results.map((r, i) => ({ label: labels[i], value: r.path.length }))}
      />
      <BarChart
        title="Total cost"
        data={results.map((r, i) => ({ label: labels[i], value: r.pathCost || 0 }))}
      />
    </div>
  );
}
