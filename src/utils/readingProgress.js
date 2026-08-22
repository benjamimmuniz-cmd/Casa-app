const KEY = "casa-app:reading-progress";

const DEFAULT_PLAN_PROGRESS = { currentDay: 1, completedDays: 0 };

function normalizePlanProgress(raw) {
  return {
    currentDay: Number(raw?.currentDay) || 1,
    completedDays: Number(raw?.completedDays) || 0,
  };
}

export function loadReadingProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return { activePlan: "canonico", canonico: { ...DEFAULT_PLAN_PROGRESS }, cronologico: { ...DEFAULT_PLAN_PROGRESS } };
    }
    const parsed = JSON.parse(raw);
    // formato antigo: progresso unico, sem separar por plano
    if (parsed.currentDay !== undefined && !parsed.canonico) {
      return {
        activePlan: "canonico",
        canonico: normalizePlanProgress(parsed),
        cronologico: { ...DEFAULT_PLAN_PROGRESS },
      };
    }
    return {
      activePlan: parsed.activePlan === "cronologico" ? "cronologico" : "canonico",
      canonico: normalizePlanProgress(parsed.canonico),
      cronologico: normalizePlanProgress(parsed.cronologico),
    };
  } catch {
    return { activePlan: "canonico", canonico: { ...DEFAULT_PLAN_PROGRESS }, cronologico: { ...DEFAULT_PLAN_PROGRESS } };
  }
}

export function saveReadingProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {}
}
