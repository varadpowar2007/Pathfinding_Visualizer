import Node from "./Node";
import { COLS } from "../algorithms/helpers";

export default function Grid({
  grid, algo, showHeatmap, maxVisitCount,
  onPointerDown, onPointerEnter, onPointerUp,
}) {
  return (
    <div
      className="gridBoard"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      onPointerLeave={onPointerUp}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {grid.map((row, rowIdx) =>
        row.map((node, colIdx) => (
          <Node
            key={`${rowIdx}-${colIdx}`}
            node={node}
            algo={algo}
            showHeatmap={showHeatmap}
            maxVisitCount={maxVisitCount}
            onPointerDown={e => onPointerDown(e, rowIdx, colIdx, node.type)}
            onPointerEnter={() => onPointerEnter(rowIdx, colIdx)}
          />
        ))
      )}
    </div>
  );
}
