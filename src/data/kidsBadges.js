// Mural de Conquistas: medalhas que cada criança cadastrada vai ganhando por
// frequência, leitura de histórias e os jogos da aba Atividades. Tudo calculado
// a partir de campos simples no próprio doc da criança (attendance, storiesRead,
// hangmanWins, versesCorrect, memoryWins, countingCorrect) — sem precisar de
// coleção nova no Firestore. Cada faixa etária tem seu próprio conjunto de
// medalhas — nomes, emojis e o que é preciso pra desbloquear mudam por idade,
// já que os jogos disponíveis (e o que motiva cada idade) são diferentes.
export function groupIdForAge(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return "p";
  if (n <= 5) return "p";
  if (n <= 8) return "m";
  return "g";
}

export const BADGES_BY_GROUP = {
  p: [
    { id: "primeira-presenca-p", emoji: "🙌", label: "Primeira Vez na Igreja", desc: "Marcou presença pela primeira vez.", of: "attendance", need: 1 },
    { id: "amigo-fiel-p", emoji: "🌟", label: "Amigo Fiel", desc: "5 presenças registradas.", of: "attendance", need: 5 },
    { id: "primeira-historia-p", emoji: "📖", label: "Ouvi uma História!", desc: "Ouviu a primeira história bíblica.", of: "stories", need: 1 },
    { id: "adora-historias-p", emoji: "🐝", label: "Adoro Histórias", desc: "Ouviu 5 histórias bíblicas.", of: "stories", need: 5 },
    { id: "sabe-tudo-p", emoji: "🧠", label: "Sei Tudo da Turma!", desc: "Ouviu todas as histórias da sua turma.", of: "stories", need: "all" },
    { id: "bom-memoria-p", emoji: "🧩", label: "Bom de Memória", desc: "Venceu o jogo da memória 3 vezes.", of: "memory", need: 3 },
    { id: "sabe-contar-p", emoji: "🔢", label: "Sei Contar!", desc: "Acertou 3 desafios de contar.", of: "counting", need: 3 },
    { id: "olho-aguia-p", emoji: "👀", label: "Olho de Águia", desc: "Achou a figurinha diferente 3 vezes.", of: "finddiff", need: 3 },
    { id: "sabe-ordem-p", emoji: "🧭", label: "Sabe a Ordem", desc: "Colocou uma história em ordem 3 vezes.", of: "sequence", need: 3 },
  ],
  m: [
    { id: "primeira-presenca-m", emoji: "🙌", label: "Primeira Presença", desc: "Marcou presença pela primeira vez.", of: "attendance", need: 1 },
    { id: "fiel-m", emoji: "🎖️", label: "Fiel", desc: "5 presenças registradas.", of: "attendance", need: 5 },
    { id: "super-fiel-m", emoji: "🏆", label: "Super Fiel", desc: "10 presenças registradas.", of: "attendance", need: 10 },
    { id: "primeira-leitura-m", emoji: "📖", label: "Primeira Leitura", desc: "Leu a primeira história bíblica.", of: "stories", need: 1 },
    { id: "leitor-aplicado-m", emoji: "🐝", label: "Leitor Aplicado", desc: "Leu 5 histórias bíblicas.", of: "stories", need: 5 },
    { id: "sabe-tudo-m", emoji: "🧠", label: "Sabe Tudo", desc: "Leu todas as histórias da sua turma.", of: "stories", need: "all" },
    { id: "mestre-forca-m", emoji: "🔤", label: "Mestre da Forca", desc: "Venceu o jogo da forca 3 vezes.", of: "hangman", need: 3 },
    { id: "guardiao-palavra-m", emoji: "📜", label: "Guardião da Palavra", desc: "Acertou 3 versículos.", of: "verses", need: 3 },
    { id: "craque-quiz-m", emoji: "🎯", label: "Craque do Quiz", desc: "Acertou 3 perguntas do quiz bíblico.", of: "quiz", need: 3 },
    { id: "sabe-ordem-m", emoji: "🧭", label: "Sabe a Ordem", desc: "Colocou uma história em ordem 3 vezes.", of: "sequence", need: 3 },
    { id: "verdade-mito-m", emoji: "🔍", label: "Verdade ou Mito", desc: "Acertou 3 vezes no Verdadeiro ou Falso.", of: "truefalse", need: 3 },
  ],
  g: [
    { id: "primeira-presenca-g", emoji: "🙌", label: "Primeira Presença", desc: "Marcou presença pela primeira vez.", of: "attendance", need: 1 },
    { id: "fiel-g", emoji: "🎖️", label: "Fiel", desc: "5 presenças registradas.", of: "attendance", need: 5 },
    { id: "guerreiro-fe-g", emoji: "🏆", label: "Guerreiro da Fé", desc: "10 presenças registradas.", of: "attendance", need: 10 },
    { id: "primeira-leitura-g", emoji: "📖", label: "Primeira Leitura", desc: "Leu a primeira história bíblica.", of: "stories", need: 1 },
    { id: "estudioso-g", emoji: "🐝", label: "Estudioso da Palavra", desc: "Leu 5 histórias bíblicas.", of: "stories", need: 5 },
    { id: "teologo-mirim-g", emoji: "🧠", label: "Teólogo Mirim", desc: "Leu todas as histórias da sua turma.", of: "stories", need: "all" },
    { id: "mestre-forca-g", emoji: "🔤", label: "Mestre da Forca", desc: "Venceu o jogo da forca 5 vezes.", of: "hangman", need: 5 },
    { id: "guardiao-palavra-g", emoji: "📜", label: "Guardião da Palavra", desc: "Acertou 5 versículos.", of: "verses", need: 5 },
    { id: "craque-quiz-g", emoji: "🎯", label: "Craque do Quiz", desc: "Acertou 5 perguntas do quiz bíblico.", of: "quiz", need: 5 },
    { id: "sabe-ordem-g", emoji: "🧭", label: "Sabe a Ordem", desc: "Colocou uma história em ordem 5 vezes.", of: "sequence", need: 5 },
    { id: "verdade-mito-g", emoji: "🔍", label: "Verdade ou Mito", desc: "Acertou 5 vezes no Verdadeiro ou Falso.", of: "truefalse", need: 5 },
  ],
};

export function badgeProgress(badge, child, totalGroupStories) {
  const value =
    badge.of === "attendance" ? (child.attendance || []).length :
    badge.of === "stories" ? (child.storiesRead || []).length :
    badge.of === "hangman" ? (child.hangmanWins || 0) :
    badge.of === "verses" ? (child.versesCorrect || 0) :
    badge.of === "memory" ? (child.memoryWins || 0) :
    badge.of === "counting" ? (child.countingCorrect || 0) :
    badge.of === "finddiff" ? (child.findDifferentWins || 0) :
    badge.of === "quiz" ? (child.quizCorrect || 0) :
    badge.of === "sequence" ? (child.sequenceWins || 0) :
    badge.of === "truefalse" ? (child.trueFalseCorrect || 0) : 0;
  const need = badge.need === "all" ? totalGroupStories : badge.need;
  return { value, need, unlocked: need > 0 && value >= need };
}
