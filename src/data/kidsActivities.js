// Conteúdo da Área Infantil: uma história bíblica + um quiz por turma, trocando
// a cada dia (calculado pela data, sem precisar de backend). groupId bate com
// o id de AGE_GROUPS em constants.js ("p", "m", "g").
export const BIBLE_STORIES = [
  {
    id: "criacao", groupId: "p", emoji: "🌎", title: "Deus criou tudo",
    text: "No começo não tinha nada — só Deus. Aí Ele disse \"que haja luz\" e a luz apareceu! Depois Deus fez o céu, o mar, as montanhas, os bichinhos e as plantas. No último dia, Deus fez a pessoa mais especial de todas: você!",
    moral: "Tudo que existe, Deus fez com amor — inclusive você.",
    verse: "Gênesis 1",
  },
  {
    id: "arca", groupId: "p", emoji: "🌈", title: "A arca de Noé",
    text: "Deus pediu pro Noé construir um barco bem grande, porque ia chover muito. Noé obedeceu e colocou dois de cada bichinho dentro da arca. Choveu muitos dias, mas todo mundo dentro do barco ficou seguro. Quando parou de chover, Deus pintou um arco-íris no céu.",
    moral: "Quando a gente obedece Deus, Ele cuida da gente.",
    verse: "Gênesis 6–9",
  },
  {
    id: "natal", groupId: "p", emoji: "⭐", title: "Jesus nasceu",
    text: "Maria e José foram pra Belém, e lá nasceu o Menino Jesus, numa mangedoura, porque não tinha lugar na hospedaria. Uma estrela brilhou bem forte no céu. Uns pastorzinhos e uns homens sábios foram visitar o bebê Jesus e levaram presentes.",
    moral: "Jesus veio ao mundo com muito amor pra todo mundo.",
    verse: "Lucas 2",
  },

  {
    id: "davi-golias", groupId: "m", emoji: "🪨", title: "Davi e Golias",
    text: "Golias era um gigante que assustava o exército inteiro de Israel. Só que Davi, um menino pastor, não teve medo — ele confiava em Deus. Com só uma pedra e uma estilingue, Davi venceu o gigante! Deus deu força pra Davi, mesmo ele sendo pequeno.",
    moral: "Com Deus do nosso lado, a gente pode enfrentar até gigante.",
    verse: "1 Samuel 17",
  },
  {
    id: "daniel-leoes", groupId: "m", emoji: "🦁", title: "Daniel na cova dos leões",
    text: "Daniel orava pra Deus todos os dias, mesmo quando um rei mandou proibir. Por causa disso, jogaram Daniel numa cova cheia de leões famintos. Mas Deus mandou um anjo fechar a boca dos leões, e Daniel saiu de lá sem nenhum arranhão!",
    moral: "Deus cuida de quem é fiel a Ele, mesmo nos momentos difíceis.",
    verse: "Daniel 6",
  },
  {
    id: "tempestade", groupId: "m", emoji: "⛵", title: "Jesus acalma a tempestade",
    text: "Jesus e os discípulos estavam num barco quando veio uma tempestade forte. Os discípulos ficaram com muito medo e acordaram Jesus, que estava dormindo. Jesus se levantou e disse \"acalme-se\" pro vento e pro mar — e tudo ficou quieto na hora!",
    moral: "Jesus tem poder sobre tudo, e está sempre com a gente nas tempestades da vida.",
    verse: "Marcos 4:35-41",
  },

  {
    id: "bom-samaritano", groupId: "g", emoji: "🤝", title: "O bom samaritano",
    text: "Um homem foi ferido por assaltantes numa estrada. Duas pessoas importantes passaram e não ajudaram. Mas um samaritano, que nem era do mesmo povo, parou, cuidou dos ferimentos dele e ainda pagou uma hospedagem pra ele se recuperar.",
    moral: "Nosso próximo é qualquer pessoa que precisa de ajuda — não importa de onde ela é.",
    verse: "Lucas 10:25-37",
  },
  {
    id: "multiplicacao", groupId: "g", emoji: "🍞", title: "Jesus alimenta 5 mil pessoas",
    text: "Uma multidão enorme seguiu Jesus e ficou até tarde, com fome. Um menino ofereceu 5 pães e 2 peixinhos — quase nada pra tanta gente. Jesus abençoou a comida, e todo mundo comeu à vontade, e ainda sobrou comida em 12 cestos!",
    moral: "Quando a gente oferece o pouco que tem pra Deus, Ele multiplica.",
    verse: "João 6:1-13",
  },
  {
    id: "zaqueu", groupId: "g", emoji: "🌳", title: "Zaqueu, o coletor de impostos",
    text: "Zaqueu era baixinho e não conseguia ver Jesus por causa da multidão, então subiu numa árvore. Jesus olhou pra cima e disse que queria almoçar na casa dele — mesmo Zaqueu sendo alguém que todo mundo julgava. Zaqueu mudou de vida depois daquele encontro.",
    moral: "Jesus enxerga e ama a gente, não importa o que os outros pensam.",
    verse: "Lucas 19:1-10",
  },
];

export const BIBLE_QUIZZES = [
  { id: "criacao", question: "No que Deus criou por último?", options: ["As estrelas", "A pessoa (o ser humano)", "Os peixes"], correct: 1 },
  { id: "arca", question: "O que apareceu no céu depois da chuva parar?", options: ["Um arco-íris", "Um cometa", "Uma nuvem preta"], correct: 0 },
  { id: "natal", question: "Onde Jesus nasceu?", options: ["Num palácio", "Numa mangedoura, em Belém", "Num barco"], correct: 1 },

  { id: "davi-golias", question: "Com o que Davi venceu o gigante Golias?", options: ["Uma espada", "Uma pedra e uma estilingue", "Um exército"], correct: 1 },
  { id: "daniel-leoes", question: "Por que Daniel foi jogado na cova dos leões?", options: ["Porque roubou algo", "Porque continuou orando a Deus", "Porque fugiu do rei"], correct: 1 },
  { id: "tempestade", question: "O que Jesus fez quando a tempestade veio?", options: ["Pulou no mar", "Mandou o vento e o mar se acalmarem", "Pediu pra virar o barco"], correct: 1 },

  { id: "bom-samaritano", question: "Quem parou pra ajudar o homem ferido?", options: ["Um samaritano", "Um sacerdote", "Ninguém parou"], correct: 0 },
  { id: "multiplicacao", question: "O que o menino ofereceu a Jesus?", options: ["5 pães e 2 peixes", "Uma cesta de frutas", "Um pouco de dinheiro"], correct: 0 },
  { id: "zaqueu", question: "Onde Zaqueu subiu pra ver Jesus?", options: ["No telhado de uma casa", "Numa árvore", "Numa pedra alta"], correct: 1 },
];

// Escolhe a história/quiz do dia por turma, trocando todo dia (mesmo conteúdo
// o dia inteiro pra todo mundo, sem precisar guardar isso em lugar nenhum).
export function todaysStoryFor(groupId) {
  const stories = BIBLE_STORIES.filter(s => s.groupId === groupId);
  if (stories.length === 0) return null;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const story = stories[dayOfYear % stories.length];
  const quiz = BIBLE_QUIZZES.find(q => q.id === story.id);
  return { ...story, quiz };
}
