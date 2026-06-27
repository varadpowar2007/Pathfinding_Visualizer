import { ALGORITHM_LIST } from "../algorithms";
import { HEURISTICS } from "../algorithms/heuristics";
import { TERRAIN, TERRAIN_COLORS } from "../algorithms/helpers";
import { SCENARIO_LIST } from "../scenarios/presets";
import { MAZE_LIST } from "../mazes";

const DRAW_MODES = [
  ...Object.entries(TERRAIN).map(([id, t]) => ({
    id,
    label: t.label,
    color: TERRAIN_COLORS[id],
  })),
  { id: "start", label: "Start", color: TERRAIN_COLORS.start },
  { id: "end", label: "End", color: TERRAIN_COLORS.end },
  { id: "eraser", label: "Clear", color: "#94a3b8" },
];

export default function Controls({
  algo, setAlgo,
  mode, setMode,
  speedMs, setSpeedMs,
  heuristic, setHeuristic,
  scenario, setScenario,
  mazeType, setMazeType,
  compareMode, setCompareMode,
  showHeatmap, setShowHeatmap,
  theme, setTheme,
  isRunning,
  onVisualize, onCompare,
  onMaze, onClearPath, onClearBoard, onApplyScenario,
  onExport, onImport,
  onOpenTutorial,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebarBlock">
        <div className="rowBetween">
          <h2 className="blockTitle">Controls</h2>
          <button type="button" className="iconBtn" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
        <button type="button" className="runButton" onClick={compareMode ? onCompare : onVisualize} disabled={isRunning}>
          {isRunning ? "Running..." : compareMode ? "Run comparison" : "Run visualization"}
        </button>
        <label className="checkRow">
          <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} disabled={isRunning} />
          Compare BFS, DFS, Dijkstra, and A*
        </label>
        <div className="actionRow">
          <button type="button" className="textButton" onClick={onClearPath} disabled={isRunning}>Clear path</button>
          <button type="button" className="textButton" onClick={onClearBoard} disabled={isRunning}>Reset map</button>
          <button type="button" className="textButton" onClick={onOpenTutorial}>Tutorial</button>
        </div>
      </div>

      <div className="sidebarBlock">
        <h2 className="blockTitle">Algorithm</h2>
        <select className="selectInput" value={algo} disabled={isRunning || compareMode} onChange={e => setAlgo(e.target.value)}>
          {ALGORITHM_LIST.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <p className="blockHint">{ALGORITHM_LIST.find(a => a.id === algo)?.summary}</p>
        <p className="blockHint shortcutHint">Shortcuts: Space run, R reset, M maze, 1-4 algorithms</p>
      </div>

      {(algo === "astar" || algo === "greedy") && (
        <div className="sidebarBlock">
          <h2 className="blockTitle">A* heuristic</h2>
          <select className="selectInput" value={heuristic} onChange={e => setHeuristic(e.target.value)}>
            {Object.values(HEURISTICS).map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <p className="blockHint">Active heuristic: {HEURISTICS[heuristic]?.name}</p>
        </div>
      )}

      <div className="sidebarBlock">
        <h2 className="blockTitle">Animation speed</h2>
        <input
          type="range"
          min="1"
          max="80"
          value={speedMs}
          className="speedSlider"
          onChange={e => setSpeedMs(Number(e.target.value))}
        />
        <p className="blockHint">Delay per frame: {speedMs} ms (lower is faster)</p>
      </div>

      <div className="sidebarBlock">
        <h2 className="blockTitle">Draw tools</h2>
        <p className="blockHint">Drag start/end cells directly on the map.</p>
        <div className="toolGrid">
          {DRAW_MODES.map(m => (
            <button key={m.id} type="button" className={`toolButton ${mode === m.id ? "selected" : ""}`} onClick={() => setMode(m.id)}>
              <span className="toolDot" style={{ background: m.color }} />
              {m.label}
            </button>
          ))}
        </div>
        <label className="checkRow">
          <input type="checkbox" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} />
          Show exploration heatmap
        </label>
      </div>

      <div className="sidebarBlock">
        <h2 className="blockTitle">Map preset</h2>
        <select className="selectInput" value={scenario} disabled={isRunning} onChange={e => { setScenario(e.target.value); onApplyScenario(e.target.value); }}>
          {SCENARIO_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <p className="blockHint">{SCENARIO_LIST.find(s => s.id === scenario)?.description}</p>
      </div>

      <div className="sidebarBlock">
        <h2 className="blockTitle">Maze generator</h2>
        <select className="selectInput" value={mazeType} onChange={e => setMazeType(e.target.value)}>
          {MAZE_LIST.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <button type="button" className="secondaryBtn fullWidth" onClick={onMaze} disabled={isRunning}>Generate maze</button>
      </div>

      <div className="sidebarBlock">
        <h2 className="blockTitle">Save and load</h2>
        <div className="ioRow">
          <button type="button" className="secondaryBtn" onClick={onExport}>Export JSON</button>
          <label className="secondaryBtn fileLabel">
            Import JSON
            <input type="file" accept="application/json,.json" hidden onChange={onImport} />
          </label>
        </div>
      </div>

      <div className="sidebarBlock">
        <h2 className="blockTitle">Terrain legend</h2>
        <ul className="legendList">
          <li><span className="legendDot" style={{ background: TERRAIN_COLORS.start }} /> Start</li>
          <li><span className="legendDot" style={{ background: TERRAIN_COLORS.end }} /> End</li>
          <li><span className="legendDot" style={{ background: "#eab308" }} /> Final path</li>
          {Object.entries(TERRAIN).map(([key, t]) => {
            const suffix = t.weight === Infinity ? " blocked" : ` cost ${t.weight}`;
            return (
              <li key={key}>
                <span className="legendDot" style={{ background: TERRAIN_COLORS[key] }} />
                {t.label}{suffix}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
