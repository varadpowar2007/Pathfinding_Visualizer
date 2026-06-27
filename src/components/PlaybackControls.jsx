export default function PlaybackControls({
  hasLastRun,
  playbackState,
  currentStep,
  totalSteps,
  onReplay,
  onPause,
  onResume,
  onRestart,
  onStepForward,
  onStepBack,
  onAutoPlay,
}) {
  if (!hasLastRun) return null;

  return (
    <div className="glassCard playbackPanel">
      <h3 className="cardTitle">Path replay and steps</h3>
      <p className="blockHint">Step {currentStep + 1} of {totalSteps || 1}</p>
      <div className="playbackRow">
        <button type="button" className="secondaryBtn" onClick={onStepBack}>Previous</button>
        <button type="button" className="secondaryBtn" onClick={onStepForward}>Next step</button>
        <button type="button" className="secondaryBtn" onClick={onAutoPlay}>Auto play</button>
        <button type="button" className="secondaryBtn" onClick={onReplay}>Replay</button>
        {playbackState === "paused" ? (
          <button type="button" className="secondaryBtn" onClick={onResume}>Resume</button>
        ) : (
          <button type="button" className="secondaryBtn" onClick={onPause}>Pause</button>
        )}
        <button type="button" className="secondaryBtn" onClick={onRestart}>Restart</button>
      </div>
    </div>
  );
}
