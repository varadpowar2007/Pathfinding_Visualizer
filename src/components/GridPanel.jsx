import Grid from "./Grid";
import { ROWS, COLS } from "../algorithms/helpers";

export default function GridPanel({
  grid, algo, showHeatmap, maxVisitCount,
  onPointerDown, onPointerEnter, onPointerUp,
}) {
  return (
    <div className="glassCard mapPanel">
      <div className="mapPanelHeader">
        <h2 className="cardTitle">Map</h2>
        <span className="mapMeta">{ROWS} rows, {COLS} columns</span>
      </div>
      <Grid
        grid={grid}
        algo={algo}
        showHeatmap={showHeatmap}
        maxVisitCount={maxVisitCount}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
