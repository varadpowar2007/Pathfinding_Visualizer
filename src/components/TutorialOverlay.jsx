import { motion } from "framer-motion";

const STEPS = [
  { title: "Place start node", text: "Select Start in the toolbar, or drag the green cell on the grid." },
  { title: "Place end node", text: "Select End in the toolbar, or drag the red destination cell." },
  { title: "Draw obstacles", text: "Pick a terrain tool and click or drag on the map to paint cells." },
  { title: "Choose algorithm", text: "Select an algorithm from the dropdown or use keys 1 to 4." },
  { title: "Run visualization", text: "Press Run Visualization or hit Space to start the search." },
];

export default function TutorialOverlay({ open, step, onNext, onSkip, onFinish }) {
  if (!open) return null;
  const current = STEPS[step];

  return (
    <div className="tutorialOverlay">
      <motion.div
        className="tutorialCard glassCard"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <p className="stepLabel">Tutorial {step + 1} / {STEPS.length}</p>
        <h3 className="cardTitle">{current.title}</h3>
        <p className="blockHint">{current.text}</p>
        <div className="playbackRow">
          <button type="button" className="textButton" onClick={onSkip}>Skip</button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="runButton" onClick={onNext}>Next</button>
          ) : (
            <button type="button" className="runButton" onClick={onFinish}>Finish</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
