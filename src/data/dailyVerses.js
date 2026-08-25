// Versículo do dia: um por dia, o mesmo pra todo mundo, sem precisar de banco —
// escolhido de forma determinística pelo dia do ano (dayOfYear % tamanho da lista).
export const DAILY_VERSES = [
  { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { text: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmos 23:1" },
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", ref: "João 3:16" },
  { text: "Confie no Senhor de todo o seu coração e não se apoie apenas no seu próprio entendimento.", ref: "Provérbios 3:5" },
  { text: "Sabemos que Deus age em todas as coisas para o bem daqueles que o amam.", ref: "Romanos 8:28" },
  { text: "Buscai primeiro o Reino de Deus e a sua justiça, e todas essas coisas vos serão acrescentadas.", ref: "Mateus 6:33" },
  { text: "Mas o fruto do Espírito é: amor, alegria, paz, paciência, amabilidade e bondade.", ref: "Gálatas 5:22" },
  { text: "Fortalecei-vos no Senhor e na força do seu poder.", ref: "Efésios 6:10" },
  { text: "Entrega o teu caminho ao Senhor; confia nele, e o mais ele fará.", ref: "Salmos 37:5" },
  { text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", ref: "Isaías 41:10" },
  { text: "O Senhor é a minha luz e a minha salvação; a quem temerei?", ref: "Salmos 27:1" },
  { text: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.", ref: "1 Pedro 5:7" },
  { text: "Alegrem-se sempre no Senhor. Novamente direi: alegrem-se!", ref: "Filipenses 4:4" },
  { text: "Porque eu bem sei os pensamentos que penso a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.", ref: "Jeremias 29:11" },
  { text: "Este é o dia que o Senhor fez; regozijemo-nos e alegremo-nos nele.", ref: "Salmos 118:24" },
  { text: "Amados, amemo-nos uns aos outros, porque o amor procede de Deus.", ref: "1 João 4:7" },
  { text: "Ainda que eu ande pelo vale da sombra da morte, não temerei mal algum, porque tu estás comigo.", ref: "Salmos 23:4" },
  { text: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.", ref: "Mateus 11:28" },
  { text: "O amor é paciente, é bondoso; não inveja, não se vangloria, não se orgulha.", ref: "1 Coríntios 13:4" },
  { text: "Grande é a tua fidelidade, Senhor; ela se renova a cada manhã.", ref: "Lamentações 3:22-23" },
  { text: "Sede fortes e corajosos; não temais, nem vos atemorizeis, porque o Senhor teu Deus é contigo.", ref: "Josué 1:9" },
  { text: "Ele dá força ao cansado e multiplica o vigor ao que não tem nenhuma força.", ref: "Isaías 40:29" },
  { text: "Provai e vede que o Senhor é bom; bem-aventurado o homem que nele confia.", ref: "Salmos 34:8" },
  { text: "Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias.", ref: "Isaías 40:31" },
  { text: "Se Deus é por nós, quem será contra nós?", ref: "Romanos 8:31" },
  { text: "A paz vos deixo, a minha paz vos dou; não vo-la dou como o mundo a dá.", ref: "João 14:27" },
  { text: "Não andeis ansiosos por coisa alguma; em tudo, porém, sejam conhecidas, diante de Deus, as vossas petições.", ref: "Filipenses 4:6" },
  { text: "Deleita-te também no Senhor, e ele te concederá os desejos do teu coração.", ref: "Salmos 37:4" },
  { text: "Porque para Deus nada é impossível.", ref: "Lucas 1:37" },
  { text: "Bem-aventurados os limpos de coração, porque eles verão a Deus.", ref: "Mateus 5:8" },
];

export function verseOfTheDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}
