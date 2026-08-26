const KEY = "casa-app:aniversario-visto";

// Compara só mês e dia (o "nascimento" guarda o ano também, mas o que
// importa aqui é se hoje bate com o dia de aniversário da pessoa).
export function isTodayBirthday(nascimentoISO) {
  if (!nascimentoISO) return false;
  const hoje = new Date();
  const hojeMD = `${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  const nascMD = nascimentoISO.slice(5, 10);
  return hojeMD === nascMD;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function hasSeenBirthdayToday() {
  try {
    return localStorage.getItem(KEY) === todayKey();
  } catch {
    return true;
  }
}

export function markBirthdaySeenToday() {
  try {
    localStorage.setItem(KEY, todayKey());
  } catch {}
}
