const PREFIX = "casa-app:cartStartedAt:";
const DAY_MS = 24 * 60 * 60 * 1000;

export function getCartStartedAt(storeKey) {
  try {
    const v = localStorage.getItem(PREFIX + storeKey);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
}

export function markCartStarted(storeKey) {
  try {
    localStorage.setItem(PREFIX + storeKey, String(Date.now()));
  } catch {}
}

export function clearCartStarted(storeKey) {
  try {
    localStorage.removeItem(PREFIX + storeKey);
  } catch {}
}

export function isCartExpired(storeKey) {
  const startedAt = getCartStartedAt(storeKey);
  if (!startedAt) return false;
  return Date.now() - startedAt > DAY_MS;
}
