// Carrega sob demanda o texto da "Traducao Brasileira da Biblia" (1917, dominio publico),
// um livro (capitulo) por vez, a partir de src/data/bible/*.json.

const bookModules = import.meta.glob("./bible/*.json");

function slugify(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/\s+/g, "-");
}

export async function loadChapter(book, chapter) {
  const path = `./bible/${slugify(book)}.json`;
  const importer = bookModules[path];
  if (!importer) return null;
  const mod = await importer();
  const data = mod.default || mod;
  return data[String(chapter)] || null;
}
