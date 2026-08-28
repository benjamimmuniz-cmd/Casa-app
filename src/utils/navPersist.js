// Guarda em qual tela a pessoa estava, pra continuar lá depois de recarregar
// a pagina em vez de voltar pro Inicio. Alguns tiles precisam de um contexto
// extra que nao da pra persistir (ex: perfil de qual pessoa) — esses ficam
// de fora e caem no tab normal.
const KEY = "casa-app:nav";
const RESTRICTED_TILES = new Set(["profile"]);

export function loadNav() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.openTile && RESTRICTED_TILES.has(parsed.openTile)) {
      return { tab: parsed.tab || "inicio", openTile: null };
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveNav(tab, openTile) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ tab, openTile }));
  } catch {}
}
