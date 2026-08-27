// Descobre se ha uma versao mais nova do app publicada, comparando o arquivo
// JS principal que essa aba carregou com o que o servidor esta servindo agora
// (lido do index.html). Sem service worker, essa e a forma mais simples de
// saber que precisa recarregar pra pegar uma atualizacao.
function currentBundleFile() {
  try {
    return new URL(import.meta.url).pathname.split("/").pop();
  } catch {
    return null;
  }
}

export async function checkForNewVersion() {
  const current = currentBundleFile();
  if (!current) return false;
  try {
    const res = await fetch("/", { cache: "no-store" });
    const html = await res.text();
    const match = html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/);
    const latest = match?.[1];
    return !!latest && latest !== current;
  } catch {
    return false;
  }
}
