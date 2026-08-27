// Filtro simples de palavras/termos pornográficos — bloqueia publicação de
// texto (posts, comentários, mensagens, legendas) que contenha esses termos.
// Não analisa imagens/vídeos, só texto.
const BLOCKED_TERMS = [
  "pornô", "porno", "pornografia", "pornográfico", "pornográfica",
  "xvideos", "xnxx", "xhamster", "redtube", "pornhub", "youporn", "brazzers", "onlyfans",
  "buceta", "boceta", "xoxota", "xota", "piroca", "pinto duro", "pau duro",
  "pica", "rola dura", "cacete", "caralho",
  "punheta", "punhetando", "siririca", "masturba",
  "nudes", "peladinha", "peladinho", "manda nude",
  "sexo explicito", "sexo explícito", "video pornô", "vídeo pornô", "filme pornô",
  "puta", "putaria", "vadia", "safada demais", "safado demais",
  "gozada", "gozar gostoso", "trepar", "transar gostoso",
  "chupar pau", "boquete", "sexo oral explicito", "sexo oral explícito",
];

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function containsBlockedContent(text) {
  if (!text) return false;
  const normalized = normalize(text);
  return BLOCKED_TERMS.some(term => normalized.includes(normalize(term)));
}

export const BLOCKED_CONTENT_MESSAGE = "Esse texto contém palavras não permitidas e não pode ser publicado.";
