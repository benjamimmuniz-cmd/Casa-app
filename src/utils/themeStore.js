const KEY = "casa-app:theme";

export function loadTheme() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
}
