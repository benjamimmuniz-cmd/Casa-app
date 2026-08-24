const KEY = "casa-app:text-large";

export function loadTextLarge() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function saveTextLarge(large) {
  try {
    localStorage.setItem(KEY, large ? "1" : "0");
  } catch {}
}
