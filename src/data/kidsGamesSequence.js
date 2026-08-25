// Mais dois jogos, um pra cada estilo. "Coloque em Ordem" existe pras três
// faixas (pros pequenos é só emoji, sem texto pra ler; pros maiores tem uma
// legenda curta). "Verdadeiro ou Falso" é só pra 6-12 anos, que já leem.
export const SEQUENCE_SETS = [
  { id: "seq-arca-p", groupId: "p", title: "A História da Arca", steps: [
    { emoji: "🌧️", label: "Choveu muito" },
    { emoji: "🛶", label: "A arca flutuou" },
    { emoji: "🌈", label: "Apareceu o arco-íris" },
  ] },
  { id: "seq-natal-p", groupId: "p", title: "O Nascimento de Jesus", steps: [
    { emoji: "⭐", label: "A estrela apareceu" },
    { emoji: "🚶", label: "Os sábios viajaram" },
    { emoji: "👶", label: "Encontraram o bebê Jesus" },
  ] },
  { id: "seq-davi-m", groupId: "m", title: "Davi e Golias", steps: [
    { emoji: "🐑", label: "Davi cuidava das ovelhas" },
    { emoji: "🪨", label: "Davi pegou uma pedra na estilingue" },
    { emoji: "🏆", label: "Davi venceu o gigante" },
  ] },
  { id: "seq-jonas-m", groupId: "m", title: "Jonas e o Grande Peixe", steps: [
    { emoji: "⛵", label: "Jonas fugiu de barco" },
    { emoji: "🐳", label: "Um peixe grande o engoliu" },
    { emoji: "🏖️", label: "O peixe o cuspiu na praia" },
  ] },
  { id: "seq-pascoa-g", groupId: "g", title: "A Páscoa de Jesus", steps: [
    { emoji: "🍞", label: "A última ceia com os discípulos" },
    { emoji: "✝️", label: "Jesus morreu na cruz" },
    { emoji: "🌅", label: "Jesus ressuscitou no terceiro dia" },
  ] },
  { id: "seq-pentecostes-g", groupId: "g", title: "Pentecostes", steps: [
    { emoji: "🕊️", label: "Jesus subiu ao céu" },
    { emoji: "🙏", label: "Os discípulos oraram juntos" },
    { emoji: "🔥", label: "O Espírito Santo desceu sobre eles" },
  ] },
];

export const TRUE_FALSE_QUESTIONS = [
  { id: "tf-arca", groupId: "m", statement: "Noé construiu um barco enorme chamado arca.", answer: true },
  { id: "tf-davi-espada", groupId: "m", statement: "Davi enfrentou o gigante Golias com uma espada.", answer: false },
  { id: "tf-belem", groupId: "m", statement: "Jesus nasceu na cidade de Belém.", answer: true },
  { id: "tf-jonas-leao", groupId: "m", statement: "Jonas foi engolido por um leão.", answer: false },
  { id: "tf-doze", groupId: "g", statement: "Jesus escolheu 12 discípulos.", answer: true },
  { id: "tf-paulo-saulo", groupId: "g", statement: "O apóstolo Paulo se chamava Saulo antes de se converter.", answer: true },
  { id: "tf-pentecostes-natal", groupId: "g", statement: "O Espírito Santo desceu sobre os discípulos no Natal.", answer: false },
  { id: "tf-ressurreicao", groupId: "g", statement: "Jesus ressuscitou no terceiro dia depois de morrer.", answer: true },
];
