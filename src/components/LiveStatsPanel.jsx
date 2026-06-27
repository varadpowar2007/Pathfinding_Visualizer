import { motion } from "framer-motion";

export default function LiveStatsPanel({ liveStats, isRunning }) {
  if (!isRunning || !liveStats) return null;

  const items = [
    { label: "Algorithm", value: liveStats.algoName },
    { label: "Nodes explored", value: liveStats.explored },
    { label: "Open set size", value: liveStats.openSetSize },
    { label: "Closed set size", value: liveStats.closedSetSize },
    { label: "Current cost", value: liveStats.currentCost },
    { label: "Elapsed time", value: `${liveStats.elapsed} ms` },
  ];

  return (
    <motion.div
      className="glassCard liveStats"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="cardTitle">Live statistics</h3>
      <div className="statGrid">
        {items.map(item => (
          <div key={item.label} className="statItem">
            <span className="statLabel">{item.label}</span>
            <span className="statValue">{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
