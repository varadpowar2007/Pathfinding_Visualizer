export default function AIRecommendation({ recommendation, onApply }) {
  if (!recommendation) return null;

  return (
    <div className="glassCard recommendPanel">
      <h3 className="cardTitle">Recommended algorithm</h3>
      <p className="recommendName">{recommendation.name}</p>
      <p className="blockHint">{recommendation.reason}</p>
      <button type="button" className="secondaryBtn" onClick={() => onApply(recommendation.id)}>
        Use {recommendation.name}
      </button>
    </div>
  );
}
