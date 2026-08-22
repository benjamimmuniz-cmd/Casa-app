// Busca musicas no catalogo publico da Apple (iTunes Search API) — sem chave,
// sem login, devolve previas de 30s prontas pra usar em <audio>. E o mesmo tipo
// de API que apps de preview de musica usam pra deixar buscar qualquer faixa.
export async function searchMusic(query) {
  const term = query.trim();
  if (!term) return [];
  const res = await fetch(`https://itunes.apple.com/search?media=music&limit=25&term=${encodeURIComponent(term)}`);
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
