import { AVATAR_COLORS, CATEGORIES } from "../data/constants.js";

export function fmtDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function findById(node, id) {
  if (node.id === id) return node;
  for (const c of node.children) { const r = findById(c, id); if (r) return r; }
  return null;
}

export function updateNodeById(node, id, updates) {
  if (node.id === id) return { ...node, ...updates };
  return { ...node, children: node.children.map(c => updateNodeById(c, id, updates)) };
}

export function addChildToId(node, targetId, newChild) {
  if (node.id === targetId) return { ...node, children: [...node.children, newChild] };
  return { ...node, children: node.children.map(c => addChildToId(c, targetId, newChild)) };
}

// Remove uma pessoa (e quem estiver abaixo dela na árvore) — usado quando alguém sai do grupo.
export function removeNodeById(node, targetId) {
  return { ...node, children: node.children.filter(c => c.id !== targetId).map(c => removeNodeById(c, targetId)) };
}

export function pathToId(node, targetId, trail = []) {
  const next = [...trail, node.id];
  if (node.id === targetId) return next;
  for (const c of node.children) { const r = pathToId(c, targetId, next); if (r) return r; }
  return null;
}

export function countDescendants(node) {
  return node.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
}

export function flattenTree(node, trailNames = []) {
  let out = [];
  for (const child of node.children) {
    out.push({ node: child, trail: trailNames });
    out = out.concat(flattenTree(child, [...trailNames, child.name]));
  }
  return out;
}

export function statusOf(daysAgo) {
  if (daysAgo === null || daysAgo === undefined) return { label: "Sem contato", color: "#262626" };
  if (daysAgo <= 14) return { label: "Em dia", color: "#5A5A5A" };
  if (daysAgo <= 30) return { label: "Atenção", color: "#9E9E9E" };
  return { label: "Atrasado", color: "#262626" };
}

// Rotulo "DD/MM" de hoje — usado em listas de presenca/frequencia (infantil, GR, fundamentos).
export function todayLabel() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Converte um rotulo "DD/MM" (o mais recente de uma lista de presencas) em
// quantos dias se passaram desde entao. Assume o ano atual, e cai pro ano
// anterior se a data cair no futuro (ex: hoje é janeiro e a marca foi em dezembro).
export function daysSinceLabel(label) {
  if (!label) return null;
  const [day, month] = label.split("/").map(Number);
  if (!day || !month) return null;
  const now = new Date();
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let date = new Date(now.getFullYear(), month - 1, day);
  if (date > today0) date = new Date(now.getFullYear() - 1, month - 1, day);
  return Math.round((today0 - date) / 86400000);
}

export function computeLayout(root, levelOf) {
  const positions = {};
  let leafCounter = 0;
  let maxLevel = 0;
  function walk(node, depth) {
    const lvl = levelOf ? levelOf(node) : depth;
    maxLevel = Math.max(maxLevel, lvl);
    if (node.children.length === 0) {
      positions[node.id] = { x: leafCounter, level: lvl };
      leafCounter += 1;
      return positions[node.id].x;
    }
    const xs = node.children.map(c => walk(c, depth + 1));
    const x = xs.reduce((a, b) => a + b, 0) / xs.length;
    positions[node.id] = { x, level: lvl };
    return x;
  }
  walk(root, 0);

  // Reordena cada fileira (nível) por posição relativa, mas garante slots únicos —
  // evita que alguém promovido/rebaixado caia em cima de outra pessoa da mesma fileira.
  // Cada fileira fica centralizada em relação à fileira mais larga, pra formar um funil
  // simétrico saindo do líder (sempre no meio) em vez de tudo alinhado à esquerda.
  const rows = {};
  Object.keys(positions).forEach(id => {
    const lvl = positions[id].level;
    (rows[lvl] = rows[lvl] || []).push(id);
  });
  let maxRowSize = 1;
  Object.values(rows).forEach(ids => { maxRowSize = Math.max(maxRowSize, ids.length); });
  Object.values(rows).forEach(ids => {
    ids.sort((a, b) => positions[a].x - positions[b].x);
    const offset = (maxRowSize - ids.length) / 2;
    ids.forEach((id, i) => { positions[id].x = i + offset; });
  });

  return { positions, totalLeaves: maxRowSize, maxLevel };
}

export function collectAll(node, arr = []) {
  arr.push(node);
  node.children.forEach(c => collectAll(c, arr));
  return arr;
}

export function timeAgo(timestamp) {
  if (!timestamp?.toDate) return "agora";
  const diffMs = Date.now() - timestamp.toDate().getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d} dia${d > 1 ? "s" : ""}`;
  return timestamp.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const colorFor = (id) => AVATAR_COLORS[Math.abs([...id].reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length];

export const initials = (name) => name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

export const levelColor = (nivel) => ({
  Pastor: "#000000", Junta: "#707070", "Líderes": "#5A5A5A", "Discípulos": "#2B2B2B", Membros: "#454545",
}[nivel] || "#454545");

export const catColor = (id) => CATEGORIES.find(c => c.id === id)?.color || "#2B2B2B";

export const fmtPrice = (v) => `R$ ${v.toFixed(2).replace(".", ",")}`;

export function friendUidsOf(myUid, connections) {
  const set = new Set();
  connections.forEach(c => {
    if (c.status !== "accepted") return;
    if (c.fromUid === myUid) set.add(c.toUid);
    else if (c.toUid === myUid) set.add(c.fromUid);
  });
  return set;
}

// Só mostra posts de quem já é amigo (ou os próprios) — quem não aceitou o pedido
// ainda não pode ver as publicações um do outro.
export function visiblePosts(posts, myUid, connections) {
  const friends = friendUidsOf(myUid, connections);
  return posts.filter(p => !p.authorUid || p.authorUid === myUid || friends.has(p.authorUid));
}

