// Busca musicas no catalogo publico da Apple (iTunes Search API) — sem chave,
// sem login, devolve previas de 30s prontas pra usar em <audio>. E o mesmo tipo
// de API que apps de preview de musica usam pra deixar buscar qualquer faixa.
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function searchMusic(query) {
  const term = query.trim();
  if (!term) return [];
  const url = `https://itunes.apple.com/search?media=music&limit=25&country=BR&term=${encodeURIComponent(term)}`;
  // A API da Apple as vezes falha por instabilidade passageira — tenta de novo
  // uma vez antes de desistir, pra não mostrar erro por causa de um soluço.
  let res;
  try {
    res = await fetchWithTimeout(url, 8000);
    if (!res.ok) throw new Error("status " + res.status);
  } catch {
    res = await fetchWithTimeout(url, 8000);
  }
  if (!res.ok) throw new Error("Falha na busca de música");
  const data = await res.json();
  return (data.results || [])
    .filter(r => r.previewUrl)
    .map(r => ({
      id: String(r.trackId),
      title: r.trackName,
      artist: r.artistName,
      source: "Prévia 30s",
      url: r.previewUrl,
      artwork: r.artworkUrl60,
    }));
}
