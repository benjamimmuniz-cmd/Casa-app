// Guarda o uid de quem convidou, lido da URL ("?convite=uid") antes do login,
// pra usar no cadastro assim que a pessoa convidada criar a conta.
const KEY = "casa-app:invited-by";

export function storeInviteCode(uid) {
  try { localStorage.setItem(KEY, uid); } catch {}
}

export function getInviteCode() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function clearInviteCode() {
  try { localStorage.removeItem(KEY); } catch {}
}
