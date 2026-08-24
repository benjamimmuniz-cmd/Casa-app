// Mural de Conquistas: medalhas que cada criança cadastrada vai ganhando por
// frequência, leitura de histórias e os jogos da aba Atividades. Tudo calculado
// a partir de campos simples no próprio doc da criança (attendance, storiesRead,
// hangmanWins, versesCorrect) — sem precisar de coleção nova no Firestore.
export function groupIdForAge(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return "p";
  if (n <= 5) return "p";
  if (n <= 8) return "m";
  return "g";
}

export const BADGES = [
  { id: "primeira-presenca", emoji: "🙌", label: "Primeira Presença", desc: "Marcou presença pela primeira vez.", of: "attendance", need: 1 },
  { id: "fiel", emoji: "🎖️", label: "Fiel", desc: "5 presenças registradas.", of: "attendance", need: 5 },
  { id: "super-fiel", emoji: "🏆", label: "Super Fiel", desc: "10 presenças registradas.", of: "attendance", need: 10 },
  { id: "primeira-leitura", emoji: "📖", label: "Primeira Leitura", desc: "Leu a primeira história bíblica.", of: "stories", need: 1 },
  { id: "leitor-aplicado", emoji: "🐝", label: "Leitor Aplicado", desc: "Leu 5 histórias bíblicas.", of: "stories", need: 5 },
  { id: "sabe-tudo", emoji: "🧠", label: "Sabe Tudo", desc: "Leu todas as histórias da sua turma.", of: "stories", need: "all" },
  { id: "mestre-forca", emoji: "🔤", label: "Mestre da Forca", desc: "Venceu o jogo da forca 3 vezes.", of: "hangman", need: 3 },
  { id: "guardiao-palavra", emoji: "📜", label: "Guardião da Palavra", desc: "Acertou 3 versículos.", of: "verses", need: 3 },
];

export function badgeProgress(badge, child, totalGroupStories) {
  const value =
    badge.of === "attendance" ? (child.attendance || []).length :
    badge.of === "stories" ? (child.storiesRead || []).length :
    badge.of === "hangman" ? (child.hangmanWins || 0) :
    badge.of === "verses" ? (child.versesCorrect || 0) : 0;
  const need = badge.need === "all" ? totalGroupStories : badge.need;
  return { value, need, unlocked: need > 0 && value >= need };
}
