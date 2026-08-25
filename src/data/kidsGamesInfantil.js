// Atividades pra 3-5 anos (turma "p") — nada de ler palavras, só reconhecer
// figurinhas e números. Jogo da memória e "quantos você vê" com temas bíblicos.
export const MEMORY_SETS = [
  { id: "arca-noe", groupId: "p", title: "Bichos da Arca de Noé", emoji: "🦁", pieces: ["🦁", "🐘", "🦒", "🐒", "🦓", "🐧"] },
  { id: "criacao", groupId: "p", title: "Coisas que Deus Criou", emoji: "🌈", pieces: ["☀️", "🌙", "⭐", "🌊", "🌳", "🐦"] },
];

export const COUNTING_GAMES = [
  { id: "ovelhas", groupId: "p", emoji: "🐑", prompt: "O Bom Pastor cuida das ovelhinhas! Quantas ovelhas você vê?", count: 5, choices: [3, 5, 7] },
  { id: "peixinhos", groupId: "p", emoji: "🐟", prompt: "Jesus multiplicou os peixinhos! Quantos peixes tem aqui?", count: 4, choices: [2, 4, 6] },
  { id: "estrelinhas", groupId: "p", emoji: "⭐", prompt: "Deus fez as estrelinhas brilharem no céu! Quantas você vê?", count: 6, choices: [4, 6, 8] },
  { id: "pombinhas", groupId: "p", emoji: "🕊️", prompt: "As pombinhas voaram até a arca. Quantas pombas você vê?", count: 3, choices: [2, 3, 5] },
];
