import { ALGORITHMS } from "../algorithms";

export default function AlgorithmInfoPanel({ algoId }) {
  const algo = ALGORITHMS[algoId];
  if (!algo) return null;

  return (
    <div className="glassCard infoPanel">
      <h3 className="cardTitle">{algo.name}</h3>
      <p className="infoSummary">{algo.summary}</p>
      <dl className="infoList">
        <div><dt>Time complexity</dt><dd>{algo.timeComplexity}</dd></div>
        <div><dt>Space complexity</dt><dd>{algo.spaceComplexity}</dd></div>
        <div><dt>Advantages</dt><dd>{algo.advantages.join(". ")}.</dd></div>
        <div><dt>Disadvantages</dt><dd>{algo.disadvantages.join(". ")}.</dd></div>
        <div><dt>Best use cases</dt><dd>{algo.useCases.join(", ")}.</dd></div>
      </dl>
    </div>
  );
}
