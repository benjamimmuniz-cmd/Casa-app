// Antes essa logo ficava embutida aqui como texto base64 (~300KB dentro do
// pacote JS, atrasando a entrada do app). Agora é um arquivo estatico normal
// em /public — o navegador baixa e guarda em cache separado, sem inflar o
// codigo que precisa ser baixado e processado antes do app aparecer.
export const LOGO_IMG = "/logo.png";
