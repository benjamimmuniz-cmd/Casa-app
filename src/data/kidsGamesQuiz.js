// Mais um jogo pra cada faixa etária. Pra 3-5 anos (turma "p"): achar a
// figurinha diferente no meio das iguais. Pra 6-12 anos (turmas "m" e "g"):
// quiz bíblico de múltipla escolha, testando o que já aprenderam nas histórias.
export const FIND_DIFFERENT_SETS = [
  { id: "ovelha-perdida", groupId: "p", title: "A Ovelha Perdida", same: "🐑", different: "🐐", prompt: "O pastor procurou a ovelhinha perdida! Ache o bichinho diferente." },
  { id: "peixes-de-pedro", groupId: "p", title: "Os Peixes de Pedro", same: "🐟", different: "🦀", prompt: "Pedro pescou muitos peixinhos! Ache o bichinho diferente entre eles." },
  { id: "estrela-belem", groupId: "p", title: "A Estrela de Belém", same: "⭐", different: "🌙", prompt: "Os sábios seguiram uma estrela até Jesus. Ache a diferente no céu!" },
];

export const QUIZ_QUESTIONS = [
  { id: "quiz-jonas", groupId: "m", question: "Quantos dias Jonas ficou dentro do peixe grande?", options: ["1 dia", "3 dias", "7 dias"], answer: "3 dias" },
  { id: "quiz-davi-goliath", groupId: "m", question: "Com o que Davi venceu o gigante Golias?", options: ["Uma espada", "Uma estilingue", "Um arco e flecha"], answer: "Uma estilingue" },
  { id: "quiz-arca-noe", groupId: "m", question: "Quantos dias e noites choveu no dilúvio de Noé?", options: ["10", "40", "100"], answer: "40" },
  { id: "quiz-jerico", groupId: "m", question: "O que aconteceu com os muros de Jericó quando o povo tocou as trombetas?", options: ["Ficaram mais altos", "Caíram", "Ficaram coloridos"], answer: "Caíram" },
  { id: "quiz-jesus-nasceu", groupId: "g", question: "Em que cidade Jesus nasceu?", options: ["Nazaré", "Jerusalém", "Belém"], answer: "Belém" },
  { id: "quiz-doze-disc", groupId: "g", question: "Quantos discípulos Jesus escolheu?", options: ["7", "10", "12"], answer: "12" },
  { id: "quiz-paulo-nome", groupId: "g", question: "Qual era o nome do apóstolo Paulo antes de se converter?", options: ["Silas", "Saulo", "Barnabé"], answer: "Saulo" },
  { id: "quiz-pentecostes", groupId: "g", question: "O que desceu sobre os discípulos no dia de Pentecostes?", options: ["O Espírito Santo", "Uma estrela", "Um anjo"], answer: "O Espírito Santo" },
];
