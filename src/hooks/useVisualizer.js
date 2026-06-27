import { useRef, useCallback, useState } from "react";
import { runAlgorithm, runComparison, ALGORITHMS } from "../algorithms";
import { resetNodeSearchState } from "../algorithms/helpers";

function delayMs(speedMs) {
  return Math.max(1, Math.round(speedMs));
}

function buildFrames(visitedInOrder, path) {
  const frames = visitedInOrder.map((node, i) => ({
    kind: "visit",
    node,
    index: i,
  }));
  path.forEach((node, i) => {
    frames.push({ kind: "path", node, index: visitedInOrder.length + i });
  });
  return frames;
}

export function useVisualizer({
  setGrid,
  startPos,
  endPos,
  setIsRunning,
  setStats,
  recordVisits,
}) {
  const animTimeouts = useRef([]);
  const lastRun = useRef(null);
  const paused = useRef(false);

  const [liveStats, setLiveStats] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [comparisonResults, setComparisonResults] = useState(null);
  const [playbackState, setPlaybackState] = useState("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [hasLastRun, setHasLastRun] = useState(false);

  const clearTimeouts = useCallback(() => {
    animTimeouts.current.forEach(clearTimeout);
    animTimeouts.current = [];
    paused.current = false;
  }, []);

  const applyFrame = useCallback((frame) => {
    setGrid(g => {
      const next = g.map(r => r.map(n => ({ ...n })));
      const cell = next[frame.node.row][frame.node.col];
      if (frame.kind === "visit") {
        next[frame.node.row][frame.node.col] = { ...cell, isVisited: true };
      } else {
        next[frame.node.row][frame.node.col] = { ...cell, isPath: true };
      }
      return next;
    });
  }, [setGrid]);

  const resetVisuals = useCallback(() => {
    setGrid(prev => prev.map(r => r.map(n => {
      const copy = { ...n };
      resetNodeSearchState(copy);
      return copy;
    })));
  }, [setGrid]);

  const applyFramesUpTo = useCallback((frames, index) => {
    resetVisuals();
    for (let i = 0; i <= index && i < frames.length; i++) {
      applyFrame(frames[i]);
    }
    setCurrentStep(index);
  }, [resetVisuals, applyFrame]);

  const scheduleAnimation = useCallback((runData, speedMs, onFinish) => {
    const { frames, visitedInOrder, statsPayload, algoId } = runData;
    clearTimeouts();
    paused.current = false;
    setPlaybackState("playing");
    setCurrentStep(0);
    resetVisuals();

    let i = 0;
    const tick = () => {
      if (paused.current) return;
      if (i >= frames.length) {
        setPlaybackState("done");
        setIsRunning(false);
        setStats(statsPayload);
        setLiveStats(null);
        onFinish?.();
        return;
      }

      applyFrame(frames[i]);
      setCurrentStep(i);
      setLiveStats({
        algoName: ALGORITHMS[algoId]?.name ?? algoId,
        explored: frames[i].kind === "visit"
          ? frames.slice(0, i + 1).filter(f => f.kind === "visit").length
          : visitedInOrder.length,
        openSetSize: 0,
        closedSetSize: frames.slice(0, i + 1).filter(f => f.kind === "visit").length,
        currentCost: statsPayload.pathCost,
        elapsed: statsPayload.time,
      });

      i++;
      const tid = setTimeout(tick, delayMs(speedMs));
      animTimeouts.current.push(tid);
    };

    tick();
  }, [clearTimeouts, resetVisuals, applyFrame, setIsRunning, setStats]);

  const prepareRun = useCallback((algoId, gridSnapshot, heuristic, onStep) => {
    const start = gridSnapshot[startPos.current.row][startPos.current.col];
    const end = gridSnapshot[endPos.current.row][endPos.current.col];
    const t0 = performance.now();

    let lastStep = null;
    const result = runAlgorithm(algoId, gridSnapshot, start, end, {
      heuristic,
      onStep: (step) => {
        lastStep = step;
        setExplanation(step.message);
        setLiveStats({
          algoName: ALGORITHMS[algoId]?.name ?? algoId,
          explored: step.closedSetSize ?? 0,
          openSetSize: step.openSetSize ?? 0,
          closedSetSize: step.closedSetSize ?? 0,
          currentCost: step.currentCost ?? 0,
          elapsed: step.elapsed ?? Math.round(performance.now() - t0),
        });
        onStep?.(step);
      },
    });

    const elapsed = Math.round(performance.now() - t0);
    const frames = buildFrames(result.visitedInOrder, result.path);
    const statsPayload = {
      explored: result.visitedInOrder.length,
      pathLen: result.path.length,
      pathCost: result.pathCost,
      time: elapsed,
      found: result.path.length > 0,
    };

    return { result, frames, statsPayload, lastStep };
  }, [startPos, endPos]);

  const visualize = useCallback((algoId, speedMs, heuristic) => {
    clearTimeouts();
    setComparisonResults(null);
    setStats(null);
    setIsRunning(true);
    setExplanation("Starting search...");
    setPlaybackState("computing");

    setGrid(prev => {
      const snapshot = prev.map(row =>
        row.map(node => {
          const copy = { ...node };
          resetNodeSearchState(copy);
          return copy;
        })
      );

      const runData = prepareRun(algoId, snapshot, heuristic);
      recordVisits?.(runData.result.visitedInOrder);
      lastRun.current = { ...runData, algoId, speedMs, heuristic };
      setTotalSteps(runData.frames.length);
      setHasLastRun(true);

      scheduleAnimation(
        { ...runData, algoId },
        speedMs,
        () => setExplanation(runData.statsPayload.found ? "Path found." : "No path found.")
      );

      return snapshot;
    });
  }, [clearTimeouts, setGrid, prepareRun, scheduleAnimation, setIsRunning, setStats, recordVisits]);

  const visualizeComparison = useCallback((speedMs, heuristic) => {
    clearTimeouts();
    setStats(null);
    setIsRunning(true);
    setExplanation("Running comparison on the same map...");
    setPlaybackState("computing");

    setGrid(prev => {
      const snapshot = prev.map(row =>
        row.map(node => {
          const copy = { ...node };
          resetNodeSearchState(copy);
          return copy;
        })
      );

      const start = snapshot[startPos.current.row][startPos.current.col];
      const end = snapshot[endPos.current.row][endPos.current.col];
      const results = runComparison(snapshot, start, end, { heuristic });

      setComparisonResults(results);
      setIsRunning(false);
      setPlaybackState("done");
      setExplanation("Comparison complete. Review the results below.");

      const best = results.find(r => r.found) ?? results[0];
      if (best) {
        lastRun.current = {
          result: best,
          frames: buildFrames(best.visitedInOrder, best.path),
          statsPayload: {
            explored: best.visitedInOrder.length,
            pathLen: best.path.length,
            pathCost: best.pathCost,
            time: best.time,
            found: best.path.length > 0,
          },
          algoId: best.algoId,
          speedMs,
          heuristic,
        };
        setTotalSteps(lastRun.current.frames.length);
        setHasLastRun(true);
        recordVisits?.(best.visitedInOrder);
        scheduleAnimation(
          { ...lastRun.current, algoId: best.algoId },
          speedMs,
          () => {}
        );
      }

      return snapshot;
    });
  }, [clearTimeouts, setGrid, startPos, endPos, scheduleAnimation, setIsRunning, recordVisits]);

  const replay = useCallback(() => {
    if (!lastRun.current) return;
    setStats(null);
    setIsRunning(true);
    scheduleAnimation(lastRun.current, lastRun.current.speedMs);
  }, [scheduleAnimation, setIsRunning, setStats]);

  const pausePlayback = useCallback(() => {
    paused.current = true;
    setPlaybackState("paused");
    clearTimeouts();
  }, [clearTimeouts]);

  const resumePlayback = useCallback(() => {
    if (!lastRun.current) return;
    paused.current = false;
    setPlaybackState("playing");
    const { frames, statsPayload, algoId, speedMs } = lastRun.current;
    let i = currentStep + 1;

    const tick = () => {
      if (paused.current) return;
      if (i >= frames.length) {
        setPlaybackState("done");
        setIsRunning(false);
        setStats(statsPayload);
        return;
      }
      applyFrame(frames[i]);
      setCurrentStep(i);
      i++;
      animTimeouts.current.push(setTimeout(tick, delayMs(speedMs)));
    };
    tick();
  }, [applyFrame, currentStep, setIsRunning, setStats]);

  const restartPlayback = useCallback(() => {
    if (!lastRun.current) return;
    replay();
  }, [replay]);

  const stepForward = useCallback(() => {
    if (!lastRun.current) return;
    clearTimeouts();
    paused.current = true;
    setPlaybackState("step");
    setIsRunning(false);
    const next = Math.min(currentStep + 1, lastRun.current.frames.length - 1);
    applyFramesUpTo(lastRun.current.frames, next);
    if (next >= lastRun.current.frames.length - 1) {
      setStats(lastRun.current.statsPayload);
    }
  }, [clearTimeouts, currentStep, applyFramesUpTo, setIsRunning, setStats]);

  const stepBackward = useCallback(() => {
    if (!lastRun.current) return;
    clearTimeouts();
    paused.current = true;
    setPlaybackState("step");
    const next = Math.max(currentStep - 1, 0);
    applyFramesUpTo(lastRun.current.frames, next);
  }, [clearTimeouts, currentStep, applyFramesUpTo]);

  const autoPlaySteps = useCallback(() => {
    if (!lastRun.current) return;
    setIsRunning(true);
    scheduleAnimation(lastRun.current, lastRun.current.speedMs);
  }, [scheduleAnimation, setIsRunning]);

  return {
    visualize,
    visualizeComparison,
    clearTimeouts,
    replay,
    pausePlayback,
    resumePlayback,
    restartPlayback,
    stepForward,
    stepBackward,
    autoPlaySteps,
    liveStats,
    explanation,
    comparisonResults,
    playbackState,
    currentStep,
    totalSteps,
    hasLastRun,
  };
}
