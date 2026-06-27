import { useState, useRef, useCallback } from "react";
import {
  createGrid,
  resetNodeSearchState,
  gridToSerializable,
  gridFromSerializable,
  TERRAIN,
} from "../algorithms/helpers";

const DEFAULT_START = { row: 10, col: 5 };
const DEFAULT_END = { row: 10, col: 44 };
const PAINTABLE = new Set(Object.keys(TERRAIN));

export function useGrid() {
  const [grid, setGrid] = useState(() => {
    const g = createGrid();
    g[DEFAULT_START.row][DEFAULT_START.col].type = "start";
    g[DEFAULT_END.row][DEFAULT_END.col].type = "end";
    return g;
  });

  const [showHeatmap, setShowHeatmap] = useState(false);
  const startPos = useRef(DEFAULT_START);
  const endPos = useRef(DEFAULT_END);
  const mouseMode = useRef("wall");
  const isDown = useRef(false);
  const dragMarker = useRef(null);

  const placeMarker = (next, type, row, col) => {
    const posRef = type === "start" ? startPos : endPos;
    const prev = posRef.current;
    if (next[prev.row][prev.col].type === type) {
      next[prev.row][prev.col].type = "road";
    }
    next[row][col].type = type;
    posRef.current = { row, col };
  };

  const interactCell = useCallback((row, col) => {
    setGrid(prev => {
      const next = prev.map(r => r.map(n => ({ ...n })));
      const node = next[row][col];
      const m = dragMarker.current || mouseMode.current;

      if (m === "start") {
        placeMarker(next, "start", row, col);
      } else if (m === "end") {
        placeMarker(next, "end", row, col);
      } else if (m === "eraser") {
        if (node.type !== "start" && node.type !== "end") node.type = "road";
      } else if (PAINTABLE.has(m)) {
        if (node.type !== "start" && node.type !== "end") {
          node.type = node.type === m ? "road" : m;
        }
      }
      return next;
    });
  }, []);

  const beginInteraction = useCallback((row, col, nodeType) => {
    isDown.current = true;
    if (nodeType === "start" || nodeType === "end") {
      dragMarker.current = nodeType;
    } else {
      dragMarker.current = null;
    }
  }, []);

  const endInteraction = useCallback(() => {
    isDown.current = false;
    dragMarker.current = null;
  }, []);

  const clearPath = useCallback(() => {
    setGrid(prev => prev.map(r => r.map(n => {
      const copy = { ...n };
      resetNodeSearchState(copy);
      return copy;
    })));
  }, []);

  const clearBoard = useCallback(() => {
    const g = createGrid();
    g[DEFAULT_START.row][DEFAULT_START.col].type = "start";
    g[DEFAULT_END.row][DEFAULT_END.col].type = "end";
    startPos.current = DEFAULT_START;
    endPos.current = DEFAULT_END;
    setGrid(g);
  }, []);

  const loadGrid = useCallback((newGrid) => {
    setGrid(newGrid);
  }, []);

  const recordVisits = useCallback((nodes) => {
    setGrid(prev => {
      const next = prev.map(r => r.map(n => ({ ...n })));
      nodes.forEach(node => {
        next[node.row][node.col].visitCount = (next[node.row][node.col].visitCount || 0) + 1;
      });
      return next;
    });
  }, []);

  const exportMap = useCallback(() => {
    const data = gridToSerializable(grid, startPos.current, endPos.current);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pathfinding-map.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [grid]);

  const importMap = useCallback((file, onDone) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const g = gridFromSerializable(data);
        if (data.start) startPos.current = data.start;
        if (data.end) endPos.current = data.end;
        setGrid(g);
        onDone?.(true);
      } catch {
        onDone?.(false);
      }
    };
    reader.readAsText(file);
  }, []);

  const maxVisitCount = grid.flat().reduce((max, n) => Math.max(max, n.visitCount || 0), 0);

  return {
    grid, setGrid, loadGrid,
    startPos, endPos,
    mouseMode, isDown,
    interactCell, beginInteraction, endInteraction,
    clearPath, clearBoard,
    showHeatmap, setShowHeatmap, maxVisitCount,
    recordVisits, exportMap, importMap,
  };
}
