// Busca musicas no catalogo publico da Apple (iTunes Search API) — sem chave,
// sem login, devolve previas de 30s prontas pra usar em <audio>. E o mesmo tipo
// de API que apps de preview de musica usam pra deixar buscar qualquer faixa.
// A API as vezes falha por instabilidade passageira, entao tenta ate 3 vezes
// antes de desistir de verdade.
function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function searchMusic(query) {
  const term = query.trim();
  if (!term) return [];
  const url = `https://itunes.apple.com/search?media=music&limit=25&country=BR&term=${encodeURIComponent(term)}`;

  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetchWithTimeout(url, 7000);
      if (!res.ok) throw new Error("status " + res.status);
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
    } catch (err) {
      lastErr = err;
    }
  }
  console.error("MUSIC_SEARCH_ERR", lastErr?.message);
  throw new Error("Falha na busca de música");
}
