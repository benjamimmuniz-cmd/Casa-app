// Atividades pra 6-12 anos (turmas "m" e "g") — em vez de folha de colorir, que fica
// muito infantil pra essa idade, tem jogo da forca e completar o versículo.
export const HANGMAN_WORDS = [
  { id: "davi", groupId: "m", emoji: "🪨", word: "DAVI", hint: "O menino que venceu um gigante com uma pedra e uma estilingue." },
  { id: "arca", groupId: "m", emoji: "🌈", word: "ARCA", hint: "O barco enorme que Noé construiu por ordem de Deus." },
  { id: "leao", groupId: "m", emoji: "🦁", word: "LEAO", hint: "O animal que não machucou Daniel dentro da cova." },
  { id: "pao", groupId: "m", emoji: "🍞", word: "PAO", hint: "Jesus multiplicou isso e peixes pra alimentar uma multidão." },
  { id: "estrela", groupId: "m", emoji: "⭐", word: "ESTRELA", hint: "Guiou os sábios até o lugar onde Jesus nasceu." },
  { id: "trombeta", groupId: "m", emoji: "🎺", word: "TROMBETA", hint: "Instrumento tocado pelos sacerdotes quando os muros de Jericó caíram." },
  { id: "ressurreicao", groupId: "g", emoji: "🌅", word: "RESSURREICAO", hint: "Jesus venceu a morte e voltou à vida no terceiro dia." },
  { id: "samaritano", groupId: "g", emoji: "🤝", word: "SAMARITANO", hint: "O estrangeiro da parábola que parou pra ajudar o homem ferido." },
  { id: "pentecostes", groupId: "g", emoji: "🕊️", word: "PENTECOSTES", hint: "O dia em que o Espírito Santo desceu sobre os discípulos." },
  { id: "armadura", groupId: "g", emoji: "🛡️", word: "ARMADURA", hint: "Paulo comparou a fé cristã a isso, usada numa batalha." },
  { id: "sabedoria", groupId: "g", emoji: "🧠", word: "SABEDORIA", hint: "O que Salomão pediu a Deus, em vez de riquezas." },
  { id: "prodigo", groupId: "g", emoji: "🏠", word: "PRODIGO", hint: "O filho que voltou pra casa e foi recebido com uma festa." },
];

export const VERSE_FILLS = [
  { id: "salmos23", groupId: "m", reference: "Salmos 23:1", before: "O Senhor é o meu", blank: "pastor", after: ", nada me faltará.", options: ["pastor", "amigo", "rei"] },
  { id: "joao316", groupId: "m", reference: "João 3:16", before: "Porque Deus amou o mundo de tal maneira que deu o seu Filho", blank: "unigênito", after: ", para que todo aquele que nele crê não pereça.", options: ["unigênito", "primeiro", "maior"] },
  { id: "filipenses413", groupId: "m", reference: "Filipenses 4:13", before: "Tudo posso naquele que me", blank: "fortalece", after: ".", options: ["fortalece", "observa", "conhece"] },
  { id: "proverbios35", groupId: "m", reference: "Provérbios 3:5", before: "Confie no Senhor de todo o seu", blank: "coração", after: " e não se apoie apenas no seu próprio entendimento.", options: ["coração", "dinheiro", "tempo"] },
  { id: "romanos828", groupId: "g", reference: "Romanos 8:28", before: "Sabemos que Deus age em todas as coisas para o", blank: "bem", after: " daqueles que o amam.", options: ["bem", "lucro", "futuro"] },
  { id: "mateus633", groupId: "g", reference: "Mateus 6:33", before: "Buscai primeiro o Reino de Deus e a sua", blank: "justiça", after: ", e todas essas coisas vos serão acrescentadas.", options: ["justiça", "riqueza", "fama"] },
  { id: "galatas522", groupId: "g", reference: "Gálatas 5:22", before: "Mas o fruto do Espírito é: amor, alegria,", blank: "paz", after: ", paciência, amabilidade e bondade.", options: ["paz", "poder", "glória"] },
  { id: "efesios610", groupId: "g", reference: "Efésios 6:10", before: "Fortalecei-vos no Senhor e na força do seu", blank: "poder", after: ".", options: ["poder", "exército", "dinheiro"] },
];
