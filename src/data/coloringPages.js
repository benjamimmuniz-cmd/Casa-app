// Desenhos originais (linha simples, estilo livro de colorir) inspirados em
// símbolos e cenas bíblicas clássicas — pra colorir direto no app, sem baixar
// nada. Cada "shape" é uma região clicável: shapes que dividem o mesmo `id`
// pintam juntas. `paint` diz se a cor entra no fill (área) ou no stroke (traço),
// usado nas faixas do arco-íris, que são arcos abertos, não áreas fechadas.
export const COLORING_PAGES = [
  {
    id: "peixe", title: "Peixe", emoji: "🐟", groupIds: ["p", "m", "g"], viewBox: "0 0 300 300",
    shapes: [
      { id: "corpo", tag: "path", props: { d: "M40,150 Q120,80 220,150 Q120,220 40,150 Z" } },
      { id: "cauda", tag: "path", props: { d: "M220,150 L268,112 L226,150 L268,188 Z" } },
      { id: "_detalhe", tag: "circle", locked: true, props: { cx: 88, cy: 145, r: 7, fill: "#2B2B2B" } },
    ],
  },
  {
    id: "coracao", title: "Coração", emoji: "❤️", groupIds: ["p", "m", "g"], viewBox: "0 0 300 300",
    shapes: [
      { id: "coracao", tag: "path", props: { d: "M150,235 C150,235 55,168 55,113 C55,80 82,58 110,58 C132,58 148,74 150,98 C152,74 168,58 190,58 C218,58 245,80 245,113 C245,168 150,235 150,235 Z" } },
      { id: "_cruz1", tag: "rect", locked: true, props: { x: 143, y: 95, width: 14, height: 60, rx: 3, fill: "#2B2B2B" } },
      { id: "_cruz2", tag: "rect", locked: true, props: { x: 122, y: 112, width: 56, height: 14, rx: 3, fill: "#2B2B2B" } },
    ],
  },
  {
    id: "pomba", title: "Pombinha da paz", emoji: "🕊️", groupIds: ["p", "m"], viewBox: "0 0 300 300",
    shapes: [
      { id: "corpo", tag: "ellipse", props: { cx: 165, cy: 165, rx: 62, ry: 38 } },
      { id: "asa", tag: "ellipse", props: { cx: 175, cy: 148, rx: 42, ry: 20, transform: "rotate(-24 175 148)" } },
      { id: "cabeca", tag: "circle", props: { cx: 95, cy: 128, r: 26 } },
      { id: "_bico", tag: "path", locked: true, props: { d: "M70,128 L48,120 L70,140 Z", fill: "#2B2B2B" } },
      { id: "_olho", tag: "circle", locked: true, props: { cx: 90, cy: 120, r: 4, fill: "#2B2B2B" } },
      { id: "folhas", tag: "ellipse", props: { cx: 210, cy: 215, rx: 14, ry: 7, transform: "rotate(30 210 215)" } },
      { id: "folhas", tag: "ellipse", props: { cx: 228, cy: 205, rx: 14, ry: 7, transform: "rotate(10 228 205)" } },
      { id: "folhas", tag: "ellipse", props: { cx: 195, cy: 228, rx: 14, ry: 7, transform: "rotate(55 195 228)" } },
      { id: "_ramo", tag: "path", locked: true, props: { d: "M175,195 Q205,205 225,200", fill: "none", stroke: "#2B2B2B", "stroke-width": 4 } },
    ],
  },
  {
    id: "arca", title: "Arca de Noé", emoji: "🚢", groupIds: ["p", "m"], viewBox: "0 0 300 300",
    shapes: [
      { id: "casco", tag: "path", props: { d: "M35,175 L265,175 C265,175 245,215 150,215 C55,215 35,175 35,175 Z" } },
      { id: "cabine", tag: "rect", props: { x: 108, y: 118, width: 84, height: 57, rx: 8 } },
      { id: "telhado", tag: "path", props: { d: "M98,118 L150,85 L202,118 Z" } },
      { id: "janela", tag: "circle", props: { cx: 150, cy: 146, r: 15 } },
      { id: "agua", tag: "path", props: { d: "M10,218 Q45,200 80,218 T150,218 T220,218 T290,218 L290,248 L10,248 Z" } },
    ],
  },
  {
    id: "estrela", title: "Estrela de Belém", emoji: "⭐", groupIds: ["m", "g"], viewBox: "0 0 300 300",
    shapes: [
      { id: "parede", tag: "rect", props: { x: 70, y: 150, width: 160, height: 90 } },
      { id: "telhado", tag: "polygon", props: { points: "55,150 150,80 245,150" } },
      { id: "manjedoura", tag: "rect", props: { x: 128, y: 205, width: 44, height: 22, rx: 4 } },
      { id: "estrela", tag: "polygon", props: { points: "150,15 157.6,34.5 178.5,35.7 162.4,49 167.6,69.3 150,58 132.4,69.3 137.6,49 121.5,35.7 142.4,34.5" } },
    ],
  },
  {
    id: "arcoiris", title: "Arco-íris da promessa", emoji: "🌈", groupIds: ["p", "m", "g"], viewBox: "0 0 300 300",
    shapes: [
      { id: "banda1", tag: "path", paint: "stroke", props: { d: "M32,232 A118,118 0 0 1 268,232", fill: "none", "stroke-width": 22 } },
      { id: "banda2", tag: "path", paint: "stroke", props: { d: "M54,232 A96,96 0 0 1 246,232", fill: "none", "stroke-width": 22 } },
      { id: "banda3", tag: "path", paint: "stroke", props: { d: "M76,232 A74,74 0 0 1 224,232", fill: "none", "stroke-width": 22 } },
      { id: "sol", tag: "circle", props: { cx: 246, cy: 70, r: 26 } },
      { id: "nuvem", tag: "ellipse", props: { cx: 55, cy: 90, rx: 26, ry: 17 } },
      { id: "nuvem", tag: "ellipse", props: { cx: 78, cy: 82, rx: 22, ry: 20 } },
      { id: "nuvem", tag: "ellipse", props: { cx: 32, cy: 85, rx: 18, ry: 14 } },
    ],
  },
];
