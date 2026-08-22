// Gera um id de conversa determinístico e único pra cada par de pessoas,
// não importa quem inicia — sempre o mesmo id nos dois lados.
export function getChatId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}
