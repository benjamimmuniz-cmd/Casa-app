const KEY = "casa-app:aniversario-casa-visto";

// Quantos anos completos a pessoa tem de Casa hoje — null se hoje não for a
// data em que ela se cadastrou, ou se ainda não completou 1 ano.
export function membershipAnniversaryYears(createdAt) {
  if (!createdAt?.toDate) return null;
  const created = createdAt.toDate();
  const hoje = new Date();
  const hojeMD = `${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  const createdMD = `${String(created.getMonth() + 1).padStart(2, "0")}-${String(created.getDate()).padStart(2, "0")}`;
  if (hojeMD !== createdMD) return null;
  const years = hoje.getFullYear() - created.getFullYear();
  return years >= 1 ? years : null;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function hasSeenAnniversaryToday() {
  try {
    return localStorage.getItem(KEY) === todayKey();
  } catch {
    return true;
  }
}

export function markAnniversarySeenToday() {
  try {
    localStorage.setItem(KEY, todayKey());
  } catch {}
}
