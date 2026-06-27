import { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";
import {
  ROWS, COLS,
  createGrid, cloneGridForSearch,
  TERRAIN_COLORS, TERRAIN,
  getPathCost,
} from "./algorithms/helpers";
import {
  ALGORITHMS, ALGORITHM_LIST,
  runAlgorithm, runComparison,
  getVisitedColor,
} from "./algorithms/index";
import { HEURISTICS } from "./algorithms/heuristics";

// ── Constants ────────────────────────────────────────────────
const DEFAULT_START = { row: 10, col: 5 };
const DEFAULT_END   = { row: 10, col: 44 };

const DRAW_MODES = [
  { id: "wall",  label: "Wall",  color: TERRAIN_COLORS.wall  },
  { id: "start", label: "Start", color: TERRAIN_COLORS.start },
  { id: "end",   label: "End",   color: TERRAIN_COLORS.end   },
];

// ── Cell color — priority order matters ─────────────────────
function cellColor(node, visitedColor) {
  // 1. Path (highest priority — always show yellow)
  if (node.isPath)           return "#f59e0b";
  // 2. Visited (show algo-specific color)
  if (node.isVisited)        return visitedColor || "#4f3fbf";
  // 3. Special types
  if (node.type === "start") return TERRAIN_COLORS.start;
  if (node.type === "end")   return TERRAIN_COLORS.end;
  if (node.type === "wall")  return TERRAIN_COLORS.wall;
  // 4. Terrain colors
  return TERRAIN_COLORS[node.type] || TERRAIN_COLORS.road;
}

// ── Maze generator ───────────────────────────────────────────
function generateMazeGrid(startR, startC, endR, endC) {
  const g = createGrid().map(r => r.map(n => ({ ...n, type: "wall" })));

  function carve(r, c) {
    const dirs = [[0,2],[2,0],[0,-2],[-2,0]].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr > 0 && nr < ROWS-1 && nc > 0 && nc < COLS-1 && g[nr][nc].type === "wall") {
        g[r + dr/2][c + dc/2].type = "road";
        g[nr][nc].type = "road";
        carve(nr, nc);
      }
    }
  }

  // Start carving from odd cell near start
  const sr = startR % 2 === 0 ? Math.min(startR + 1, ROWS - 2) : startR;
  const sc = startC % 2 === 0 ? Math.min(startC + 1, COLS - 2) : startC;
  g[sr][sc].type = "road";
  carve(sr, sc);

  // FIX 2: Force-open cells around end node so it's always reachable
  const neighbors = [
    [endR - 1, endC], [endR + 1, endC],
    [endR, endC - 1], [endR, endC + 1],
  ];
  for (const [nr, nc] of neighbors) {
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      g[nr][nc].type = "road";
      break; // open just one is enough
    }
  }
  // Also force-open one cell near start
  for (const [dr, dc] of [[0,1],[1,0],[0,-1],[-1,0]]) {
    const nr = startR + dr, nc = startC + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      g[nr][nc].type = "road";
      break;
    }
  }

  g[startR][startC].type = "start";
  g[endR][endC].type = "end";
  return g;
}

// ── Canvas Grid ──────────────────────────────────────────────
function GridCanvas({ grid, visitedColor, onMouseDown, onMouseEnter, onMouseUp }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cw = canvas.width  / COLS;
    const ch = canvas.height / ROWS;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const n = grid[r][c];
        ctx.fillStyle = cellColor(n, visitedColor);
        ctx.fillRect(c * cw + 0.5, r * ch + 0.5, cw - 0.5, ch - 0.5);
      }
    }
  }, [grid, visitedColor]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
      draw();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  function getCell(clientX, clientY) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scX = canvas.width  / rect.width;
    const scY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scX;
    const y = (clientY - rect.top)  * scY;
    const c = Math.floor(x / (canvas.width  / COLS));
    const r = Math.floor(y / (canvas.height / ROWS));
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    return { r, c };
  }

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", borderRadius: 10, overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", cursor: "crosshair", width: "100%", height: "100%" }}
        onMouseDown={e  => { const p = getCell(e.clientX, e.clientY); if (p) onMouseDown(p.r, p.c); }}
        onMouseMove={e  => { const p = getCell(e.clientX, e.clientY); if (p) onMouseEnter(p.r, p.c); }}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; const p = getCell(t.clientX, t.clientY); if (p) onMouseDown(p.r, p.c); }}
        onTouchMove={e  => { e.preventDefault(); const t = e.touches[0]; const p = getCell(t.clientX, t.clientY); if (p) onMouseEnter(p.r, p.c); }}
        onTouchEnd={onMouseUp}
      />
    </div>
  );
}

// ── Comparison Table ─────────────────────────────────────────
function CompareTable({ results }) {
  if (!results || results.length === 0) return (
    <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "8px 0" }}>
      Run with Compare mode ON to see results here.
    </div>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {["Algorithm", "Explored", "Path", "Cost", "Time", "Result"].map(h => (
              <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)", fontSize: 11 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "6px 10px", color: "var(--text-primary)", fontWeight: 500 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: getVisitedColor(r.algoId), marginRight: 6 }}/>
                {ALGORITHMS[r.algoId]?.name || r.algoId}
              </td>
              <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{r.visitedInOrder?.length ?? "—"}</td>
              <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{r.path?.length > 0 ? r.path.length + " cells" : "—"}</td>
              <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{r.pathCost ?? "—"}</td>
              <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{r.time}ms</td>
              <td style={{ padding: "6px 10px" }}>
                {r.path?.length > 0
                  ? <span style={{ color: "#34d399", fontWeight: 600 }}>✓ Found</span>
                  : <span style={{ color: "#f87171", fontWeight: 600 }}>✗ None</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const initGrid = useCallback(() => {
    const g = createGrid();
    g[DEFAULT_START.row][DEFAULT_START.col].type = "start";
    g[DEFAULT_END.row][DEFAULT_END.col].type = "end";
    return g;
  }, []);

  const [grid, setGrid]             = useState(initGrid);
  const [algo, setAlgo]             = useState("dijkstra");
  const [heuristic, setHeuristic]   = useState("manhattan");
  const [drawMode, setDrawMode]     = useState("wall");
  const [speed, setSpeed]           = useState(15);
  const [isRunning, setIsRunning]   = useState(false);
  const [status, setStatus]         = useState("idle");
  const [stats, setStats]           = useState(null);
  const [compareMode, setCompareMode]     = useState(false);
  const [compareResults, setCompareResults] = useState([]);
  const [algoOpen, setAlgoOpen]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visitedColor, setVisitedColor] = useState("#4f3fbf");

  const startPos = useRef(DEFAULT_START);
  const endPos   = useRef(DEFAULT_END);
  const isDown   = useRef(false);
  const timeouts = useRef([]);

  function clearTimeouts() {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }

  // ── Mouse handlers ───────────────────────────────────────
  const handleMouseDown = useCallback((r, c) => {
    if (isRunning) return;
    isDown.current = true;
    interact(r, c);
  }, [isRunning, drawMode]);

  const handleMouseEnter = useCallback((r, c) => {
    if (!isDown.current || isRunning) return;
    interact(r, c);
  }, [isRunning, drawMode]);

  const handleMouseUp = useCallback(() => { isDown.current = false; }, []);

  function interact(r, c) {
    setGrid(prev => {
      const next = prev.map(row => row.map(n => ({ ...n })));
      const node = next[r][c];
      if (drawMode === "wall") {
        if (node.type === "start" || node.type === "end") return prev;
        node.type = node.type === "wall" ? "road" : "wall";
      } else if (drawMode === "start") {
        next[startPos.current.row][startPos.current.col].type = "road";
        node.type = "start";
        startPos.current = { row: r, col: c };
      } else if (drawMode === "end") {
        next[endPos.current.row][endPos.current.col].type = "road";
        node.type = "end";
        endPos.current = { row: r, col: c };
      }
      return next;
    });
  }

  // ── Clear helpers ────────────────────────────────────────
  function clearPath() {
    clearTimeouts();
    setIsRunning(false);
    setStatus("idle");
    setStats(null);
    setCompareResults([]);
    setGrid(prev => prev.map(r => r.map(n => ({
      ...n,
      isVisited: false, isPath: false,
      distance: Infinity, g: Infinity, f: Infinity, h: 0,
      parent: null,
    }))));
  }

  function clearBoard() {
    clearTimeouts();
    setIsRunning(false);
    setStatus("idle");
    setStats(null);
    setCompareResults([]);
    startPos.current = DEFAULT_START;
    endPos.current   = DEFAULT_END;
    setGrid(initGrid());
  }

  // ── Maze ────────────────────────────────────────────────
  function doMaze() {
    if (isRunning) return;
    clearTimeouts();
    setStats(null);
    setStatus("idle");
    setCompareResults([]);
    setGrid(generateMazeGrid(
      startPos.current.row, startPos.current.col,
      endPos.current.row,   endPos.current.col,
    ));
  }

  // ── Animate results ──────────────────────────────────────
  function animateResult(visitedInOrder, path, elapsed, found, color) {
    const delay = speed;
    setVisitedColor(color);

    visitedInOrder.forEach((node, i) => {
      const tid = setTimeout(() => {
        setGrid(g => {
          const next = g.map(r => [...r]);
          next[node.row] = [...next[node.row]];
          next[node.row][node.col] = { ...next[node.row][node.col], isVisited: true };
          return next;
        });
      }, i * delay);
      timeouts.current.push(tid);
    });

    const pathStart = visitedInOrder.length * delay;
    path.forEach((node, i) => {
      const tid = setTimeout(() => {
        setGrid(g => {
          const next = g.map(r => [...r]);
          next[node.row] = [...next[node.row]];
          next[node.row][node.col] = { ...next[node.row][node.col], isPath: true };
          return next;
        });
      }, pathStart + i * 28);
      timeouts.current.push(tid);
    });

    const finTid = setTimeout(() => {
      setIsRunning(false);
      setStatus(found ? "success" : "error");
      setStats({
        explored: visitedInOrder.length,
        pathLen:  path.length,
        pathCost: getPathCost(path),
        time:     elapsed,
        found,
      });
    }, pathStart + path.length * 28 + 100);
    timeouts.current.push(finTid);
  }

  // ── Visualize ────────────────────────────────────────────
  function visualize() {
    if (isRunning) return;
    clearPath();

    setGrid(prev => {
      const snap  = cloneGridForSearch(prev);
      const start = snap[startPos.current.row][startPos.current.col];
      const end   = snap[endPos.current.row][endPos.current.col];

      setIsRunning(true);
      setStatus("running");

      if (compareMode) {
        // FIX 3: Real compare mode using runComparison
        const t0 = performance.now();
        const results = runComparison(snap, start, end, { heuristic });
        const elapsed = Math.round(performance.now() - t0);
        setCompareResults(results);
        setDrawerOpen(true);

        // Animate the currently selected algo's result
        const myResult = results.find(r => r.algoId === algo) || results[0];
        if (myResult) {
          const color = getVisitedColor(myResult.algoId);
          animateResult(
            myResult.visitedInOrder || [],
            myResult.path || [],
            myResult.time ?? elapsed,
            (myResult.path?.length || 0) > 0,
            color,
          );
        } else {
          setIsRunning(false);
          setStatus("idle");
        }
      } else {
        // Single algorithm run — FIX 4: use runAlgorithm from index.js
        const t0 = performance.now();
        const result = runAlgorithm(algo, snap, start, end, { heuristic });
        const elapsed = Math.round(performance.now() - t0);
        const color = getVisitedColor(algo);
        animateResult(
          result.visitedInOrder || [],
          result.path || [],
          elapsed,
          (result.path?.length || 0) > 0,
          color,
        );
      }

      return snap;
    });
  }

  // ── Keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return;
      if (e.code === "Space"  && !isRunning) { e.preventDefault(); visualize(); }
      if (e.code === "KeyR"   && !isRunning) clearPath();
      if (e.code === "KeyM"   && !isRunning) doMaze();
      if (e.code === "Escape" &&  isRunning) { clearTimeouts(); setIsRunning(false); setStatus("idle"); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRunning, algo, speed, heuristic, compareMode]);

  useEffect(() => () => clearTimeouts(), []);

  const currentAlgo = ALGORITHMS[algo];
  const showHeuristic = algo === "astar" || algo === "greedy";

  const statusConfig = {
    idle:    { label: "Ready",        cls: "idle"    },
    running: { label: "Running…",     cls: "running" },
    success: { label: "Path found ✓", cls: "success" },
    error:   { label: "No path ✗",    cls: "error"   },
  };
  const sc = statusConfig[status] || statusConfig.idle;

  return (
    <div className="pv-app">

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className="pv-sidebar">

        {/* Logo */}
        <div className="pv-logo">
          <div className="pv-logo-icon">⬡</div>
          <div>
            <div className="pv-logo-text">Pathfinder</div>
            <div className="pv-logo-sub">DSA Visualizer</div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="pv-section">
          <button
            className={`pv-btn-run${isRunning ? " running" : ""}`}
            onClick={visualize}
            disabled={isRunning}
          >
            {isRunning
              ? <><span className="pv-badge-dot pulse" style={{ background:"#fff", width:8, height:8, borderRadius:"50%" }}/> Running…</>
              : <><span>▶</span> Run Visualization</>
            }
          </button>

          <div className="pv-btn-row">
            <button className="pv-btn-secondary" onClick={doMaze}      disabled={isRunning}>⊞ Maze</button>
            <button className="pv-btn-secondary" onClick={clearPath}   disabled={isRunning}>↺ Reset</button>
            <button className="pv-btn-secondary danger" onClick={clearBoard} disabled={isRunning}>⊗ Clear</button>
          </div>

          <div style={{ marginTop: 8, fontSize: 10, color: "var(--text-muted)" }}>
            <span className="pv-kbd">Space</span> Run &nbsp;
            <span className="pv-kbd">R</span> Reset &nbsp;
            <span className="pv-kbd">M</span> Maze &nbsp;
            <span className="pv-kbd">Esc</span> Stop
          </div>
        </div>

        {/* Algorithm selector */}
        <div className="pv-section">
          <div className="pv-section-label">Algorithm</div>
          <select
            className="pv-select"
            value={algo}
            onChange={e => { if (!isRunning) { setAlgo(e.target.value); clearPath(); }}}
          >
            {ALGORITHM_LIST.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          {currentAlgo && (
            <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
              {currentAlgo.summary}
            </div>
          )}
        </div>

        {/* Heuristic — only for A* and Greedy */}
        {showHeuristic && (
          <div className="pv-section">
            <div className="pv-section-label">Heuristic</div>
            <select
              className="pv-select"
              value={heuristic}
              onChange={e => setHeuristic(e.target.value)}
            >
              {Object.values(HEURISTICS).map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Draw mode */}
        <div className="pv-section">
          <div className="pv-section-label">Draw mode</div>
          <div className="pv-mode-grid">
            {DRAW_MODES.map(m => (
              <button
                key={m.id}
                className={`pv-mode-btn${drawMode === m.id ? " active" : ""}`}
                onClick={() => setDrawMode(m.id)}
              >
                <div className="pv-mode-dot" style={{ background: m.color }} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="pv-section">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 6 }}>
            <div className="pv-section-label" style={{ margin:0 }}>Speed</div>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
              {speed <= 5 ? "Fast" : speed <= 25 ? "Medium" : "Slow"}
            </span>
          </div>
          <input
            type="range" min={2} max={80} value={speed}
            className="pv-slider"
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <div className="pv-slider-labels"><span>Fast</span><span>Slow</span></div>
        </div>

      

        {/* About algorithm — collapsible */}
        <div className="pv-accordion-header" onClick={() => setAlgoOpen(v => !v)}>
          <span className="pv-accordion-title">About {currentAlgo?.name}</span>
          <span className={`pv-accordion-arrow${algoOpen ? " open" : ""}`}>▼</span>
        </div>
        <div className={`pv-accordion-body${algoOpen ? " open" : ""}`}>
          {currentAlgo && (
            <div className="pv-section" style={{ borderBottom: "none" }}>
              {[
                ["Time",       currentAlgo.timeComplexity],
                ["Space",      currentAlgo.spaceComplexity],
                ["Weighted",   currentAlgo.weighted ? "Yes" : "No"],
                ["Pros",       currentAlgo.advantages?.join(", ")],
                ["Cons",       currentAlgo.disadvantages?.join(", ")],
                ["Used in",    currentAlgo.useCases?.join(", ")],
              ].map(([k, v]) => (
                <div className="pv-algo-info-row" key={k}>
                  <span className="pv-algo-info-key">{k}</span>
                  <span className="pv-algo-info-val">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </aside>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <main className="pv-main">

        {/* Topbar */}
        <div className="pv-topbar">
          <div className="pv-topbar-left">
            <div className={`pv-topbar-badge ${sc.cls}`}>
              <div className={`pv-badge-dot${status === "running" ? " pulse" : ""}`} />
              {sc.label}
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {ROWS} × {COLS} · {currentAlgo?.name}
            </span>
          </div>

          {stats ? (
            <div className="pv-stats">
              {[
                ["Explored", stats.explored],
                ["Path",     stats.found ? `${stats.pathLen} cells` : "—"],
                ["Cost",     stats.found ? stats.pathCost : "—"],
                ["Time",     `${stats.time}ms`],
              ].map(([l, v]) => (
                <div className="pv-stat-chip" key={l}>
                  <span className="pv-stat-label">{l}</span>
                  <span className="pv-stat-value">{v}</span>
                </div>
              ))}
            </div>
          ) : (
            !isRunning && (
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Draw walls · Press <span className="pv-kbd">Space</span> to run
              </span>
            )
          )}
        </div>

        {/* Grid */}
        <div className="pv-grid-wrap">
          <div className="pv-grid" style={{ height: "100%" }}>
            <GridCanvas
              grid={grid}
              visitedColor={visitedColor}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseUp={handleMouseUp}
            />
          </div>
        </div>

        {/* Drawer trigger */}
        <div className="pv-drawer-trigger" onClick={() => setDrawerOpen(v => !v)}>
          <span>{drawerOpen ? "▼" : "▲"}</span>
          <span>Statistics &amp; Logs</span>
          {compareResults.length > 0 && (
            <span style={{ color: "var(--accent)", fontSize: 10 }}>● {compareResults.length} algorithms compared</span>
          )}
          {stats && !compareMode && (
            <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
              {stats.explored} nodes · {stats.found ? stats.pathLen + " path" : "no path"}
            </span>
          )}
        </div>

        {/* Bottom drawer */}
        <div className={`pv-drawer${drawerOpen ? " open" : ""}`}>
          <div className="pv-drawer-inner" style={{ flexDirection: "column", gap: 12 }}>

            {/* Comparison table */}
            {compareMode ? (
              <div className="pv-drawer-card" style={{ flex: "none" }}>
                <div className="pv-drawer-card-title">Algorithm Comparison</div>
                <CompareTable results={compareResults} />
              </div>
            ) : (
              /* Single run summary */
              <div style={{ display:"flex", gap:12 }}>
                <div className="pv-drawer-card" style={{ flex: 1 }}>
                  <div className="pv-drawer-card-title">Run Summary</div>
                  {stats ? (
                    <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                      {[
                        ["Algorithm",  currentAlgo?.name || algo],
                        ["Explored",   stats.explored + " nodes"],
                        ["Path",       stats.found ? stats.pathLen + " cells" : "No path found"],
                        ["Cost",       stats.found ? stats.pathCost : "—"],
                        ["Time",       stats.time + " ms"],
                        ["Result",     stats.found ? "✅ Found" : "❌ No path"],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>{l}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Run a visualization to see results here.
                    </div>
                  )}
                </div>

                <div className="pv-drawer-card" style={{ minWidth: 180 }}>
                  <div className="pv-drawer-card-title">Legend</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {[
                      [TERRAIN_COLORS.start, "Start"],
                      [TERRAIN_COLORS.end,   "End"],
                      [TERRAIN_COLORS.wall,  "Wall"],
                      [visitedColor,         "Visited"],
                      ["#f59e0b",            "Shortest path"],
                      [TERRAIN_COLORS.road,  "Road"],
                    ].map(([color, label]) => (
                      <div key={label} style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:10, height:10, background:color, borderRadius:2, flexShrink:0, border:"0.5px solid rgba(255,255,255,0.1)" }}/>
                        <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
