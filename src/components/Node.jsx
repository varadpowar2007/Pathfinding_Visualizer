import { memo } from "react";
import { getVisitedColor } from "../algorithms";
import { TERRAIN_COLORS, getHeatmapColor } from "../algorithms/helpers";

function cellColor(node, algoId, showHeatmap, maxVisitCount) {
  if (node.isPath) return "#eab308";
  if (node.isVisited) return getVisitedColor(algoId);
  if (showHeatmap && node.visitCount > 0) {
    return getHeatmapColor(node.visitCount, maxVisitCount) ?? TERRAIN_COLORS[node.type];
  }
  return TERRAIN_COLORS[node.type] ?? TERRAIN_COLORS.road;
}

const Node = memo(function Node({ node, algo, showHeatmap, maxVisitCount, onPointerDown, onPointerEnter }) {
  const classes = ["cell"];
  if (node.isVisited) classes.push("visited");
  if (node.isPath) classes.push("path");
  if (node.type === "start" || node.type === "end") classes.push("marker");

  return (
    <div
      className={classes.join(" ")}
      style={{ backgroundColor: cellColor(node, algo, showHeatmap, maxVisitCount) }}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
    />
  );
});

export default Node;
