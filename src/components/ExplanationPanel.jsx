import { motion, AnimatePresence } from "framer-motion";

export default function ExplanationPanel({ message, isRunning }) {
  return (
    <AnimatePresence mode="wait">
      {(message || isRunning) && (
        <motion.div
          key={message}
          className="glassCard explanationPanel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h3 className="cardTitle">Algorithm log</h3>
          <p className="explanationText">{message || "Preparing search..."}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
