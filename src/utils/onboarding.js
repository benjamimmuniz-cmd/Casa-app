const KEY = "casa-app:viu-tour";

export function hasSeenTour() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markTourSeen() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {}
}
