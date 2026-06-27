import { useEffect } from "react";

export function useKeyboardShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === " ") {
        e.preventDefault();
        handlers.onRun?.();
      } else if (key === "r") {
        handlers.onReset?.();
      } else if (key === "m") {
        handlers.onMaze?.();
      } else if (key === "1") {
        handlers.onSelectAlgo?.("bfs");
      } else if (key === "2") {
        handlers.onSelectAlgo?.("dfs");
      } else if (key === "3") {
        handlers.onSelectAlgo?.("dijkstra");
      } else if (key === "4") {
        handlers.onSelectAlgo?.("astar");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers, enabled]);
}
