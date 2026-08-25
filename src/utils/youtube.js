const YOUTUBE_ID_PATTERNS = [
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
  /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
  /youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
];

// Links de compartilhamento (do app do YouTube, WhatsApp etc.) costumam vir com
// parametros de rastreio antes do "v=" (tipo ?si=...&v=...) ou com o dominio
// m.youtube.com — a regex simples exige "v=" logo depois de "watch?", e perde
// esses casos. Por isso tenta parsear como URL de verdade primeiro (funciona
// com "v" em qualquer posicao e qualquer subdominio), e só cai pras regex
// antigas se o texto colado nao for uma URL valida.
export function extractYoutubeId(url) {
  if (!url) return null;
  const trimmed = url.trim();
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProtocol);
    const host = u.hostname.replace(/^m\./, "").replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      if (id.length >= 6) return id;
    } else if (host === "youtube.com" || host === "music.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        if (id && id.length >= 6) return id;
      }
      const pathMatch = u.pathname.match(/^\/(?:shorts|live|embed)\/([a-zA-Z0-9_-]{6,})/);
      if (pathMatch) return pathMatch[1];
    }
  } catch {
    // não era uma URL válida — tenta as regex abaixo como último recurso
  }
  for (const re of YOUTUBE_ID_PATTERNS) {
    const m = trimmed.match(re);
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
