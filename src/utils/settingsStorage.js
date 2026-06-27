const STORAGE_KEY = "pfv_settings";

const defaults = {
  theme: "light",
  heuristic: "manhattan",
  speedMs: 12,
  showHeatmap: false,
  tutorialDone: false,
  compareMode: false,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(partial) {
  const next = { ...loadSettings(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export { defaults as DEFAULT_SETTINGS };
