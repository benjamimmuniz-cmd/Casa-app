// "Online" e uma aproximacao por atividade recente, nao deteccao real de
// conexao — o app manda um "heartbeat" (lastActive) a cada 45s enquanto
// aberto, entao aqui so confere se o ultimo heartbeat foi ha pouco tempo.
const ONLINE_THRESHOLD_MS = 90 * 1000;

export function isOnline(lastActive) {
  const ms = lastActive?.toMillis?.();
  if (!ms) return false;
  return Date.now() - ms < ONLINE_THRESHOLD_MS;
}
