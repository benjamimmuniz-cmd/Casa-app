const KEY = "casa-app:perfil-completo-visto";

export function hasSeenProfileComplete() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markProfileCompleteSeen() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {}
}

export function isProfileComplete(user) {
  return !!(user.photo && user.profissao?.trim() && user.telefone?.trim() && user.nascimento);
}
