const YOUTUBE_ID_PATTERNS = [
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
  /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
];

export function extractYoutubeId(url) {
  if (!url) return null;
  for (const re of YOUTUBE_ID_PATTERNS) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

export function youtubeThumbUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeEmbedUrl(videoId) {
  const params = new URLSearchParams({
    autoplay: "1", mute: "1", loop: "1", playlist: videoId,
    controls: "0", modestbranding: "1", playsinline: "1", rel: "0", enablejsapi: "1",
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

// Embed normal, com controles e sem autoplay/loop/mudo — pra video mais longo
// que a pessoa assiste de proposito (mensagens/pregacoes), diferente do Shorts.
export function youtubeWatchEmbedUrl(videoId) {
  const params = new URLSearchParams({ modestbranding: "1", playsinline: "1", rel: "0" });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
