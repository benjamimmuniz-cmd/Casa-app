import React, { useState, useEffect, useContext, createContext } from "react";
import {
  Check,
  ChevronRight,
  Pencil,
  Phone,
  Search,
  Trash2,
  X
} from "lucide-react";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { addChildToId, collectAll, colorFor, countDescendants, daysSinceLabel, findById, flattenTree, initials, labelFromISO, levelColor, pathToId, removeNodeById, statusOf, todayISO, updateNodeById } from "../utils/helpers.js";
import { LEVELS } from "../data/constants.js";
import TreeRow from "../components/TreeRow.jsx";
import VisualTree from "../components/VisualTree.jsx";
import PhotoPickerField from "../components/PhotoPickerField.jsx";

const TREE_DOC = doc(db, "discipuladoTree", "main");

function DiscipuladoScreen({ onBack }) {
  const me = useContext(UserContext);
  const [tree, setTree] = useState(null);
  const [viewMode, setViewMode] = useState("lista");
  const [expanded, setExpanded] = useState(new Set());
  const [search, setSearch] = useState("");
  const [profileId, setProfileId] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [showAddFor, setShowAddFor] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", nivel: "Líderes", photo: null });
  const [editingRoot, setEditingRoot] = useState(false);
  const [rootDraft, setRootDraft] = useState({ name: "", role: "" });
  const [attendanceISO, setAttendanceISO] = useState(todayISO());
  const [historyDate, setHistoryDate] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(TREE_DOC, snap => {
      if (snap.exists()) {
        setTree(snap.data().tree);
      } else {
        const root = { id: "you", name: me.name || "Você", role: me.profissao || "Membro", nivel: "Pastor", phone: "", daysAgo: 0, attendance: [], notes: "", children: [] };
        setDoc(TREE_DOC, { tree: root }).catch(err => console.error("TREE_INIT_ERR", err.code, err.message));
      }
    }, () => {});
    return () => unsub();
  }, []);

  const mutateTree = (updater) => {
    setTree(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      updateDoc(TREE_DOC, { tree: next }).catch(err => console.error("TREE_SAVE_ERR", err.code, err.message));
      return next;
    });
  };

  const toggleExpand = (id) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const openProfile = (id) => {
    const n = findById(tree, id);
    setNotesDraft(n?.notes || "");
    setConfirmRemove(false);
    setProfileId(id);
  };
  const profile = profileId && tree ? findById(tree, profileId) : null;

  const markContactToday = () => mutateTree(prev => updateNodeById(prev, profileId, { daysAgo: 0 }));
  const saveNotes = () => mutateTree(prev => updateNodeById(prev, profileId, { notes: notesDraft }));
  const revealInTree = () => {
    const p = pathToId(tree, profileId);
    if (p) setExpanded(prev => new Set([...prev, ...p]));
    setProfileId(null);
  };
  const openRootEdit = () => {
    setRootDraft({ name: tree.name, role: tree.role });
    setEditingRoot(true);
  };
  const saveRootEdit = () => {
    if (!rootDraft.name.trim()) return;
    mutateTree(prev => ({ ...prev, name: rootDraft.name.trim(), role: rootDraft.role.trim() || "Membro" }));
    setEditingRoot(false);
  };

  const toggleAttendanceForSelectedDate = (memberId, currentAttendance) => {
    const label = labelFromISO(attendanceISO);
    const already = (currentAttendance || []).includes(label);
    const next = already ? (currentAttendance || []).filter(d => d !== label) : [...(currentAttendance || []), label];
    mutateTree(prev => updateNodeById(prev, memberId, { attendance: next }));
  };

  const removeMember = () => {
    if (!profile || !tree || profile.id === tree.id) return;
    mutateTree(prev => removeNodeById(prev, profile.id));
    setConfirmRemove(false);
    setProfileId(null);
  };

  const openAddFor = (parentId) => {
    const parent = findById(tree, parentId);
    const parentIdx = parent ? LEVELS.indexOf(parent.nivel) : -1;
    const suggested = LEVELS[Math.min(parentIdx + 1, LEVELS.length - 1)] || LEVELS[1];
    setForm({ name: "", role: "", nivel: suggested, photo: null });
    setShowAddFor(parentId);
  };

  const handleAdd = () => {
    if (!form.name.trim() || !showAddFor) return;
    const newChild = { id: "n" + Date.now(), name: form.name.trim(), role: form.role.trim() || form.nivel, nivel: form.nivel, phone: "", daysAgo: null, attendance: [], notes: "", photo: form.photo, children: [] };
    mutateTree(prev => addChildToId(prev, showAddFor, newChild));
    setExpanded(prev => new Set([...prev, showAddFor]));
    setForm({ name: "", role: "", nivel: "Líderes", photo: null });
    setShowAddFor(null);
    setNotesDraft("");
    setProfileId(newChild.id);
  };

  if (!tree) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#F2F2F2" }}>
        <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[13px]">Carregando...</p>
      </div>
    );
  }

  const searchResults = search.trim()
    ? flattenTree(tree, ["Você"]).filter(r => r.node.name.toLowerCase().includes(search.trim().toLowerCase()))
    : null;

  return (
    <div className="flex-1 relative flex flex-col min-h-0" style={{ background: "#F2F2F2" }}>
      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#0000000F", color: "#616161" }}>
          {countDescendants(tree) + 1} na rede
        </span>
      </div>

      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Discipulado</h1>
      </div>

      <div className="px-6 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Search size={15} color="#9E9E9E" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar alguém na rede"
            className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#000000" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} color="#9E9E9E" /></button>}
        </div>
      </div>

      <div className="px-6 mb-4 flex gap-2">
        <button onClick={() => setViewMode("lista")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: viewMode === "lista" ? "#000000" : "#FFFFFF", color: viewMode === "lista" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Lista
        </button>
        <button onClick={() => setViewMode("arvore")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: viewMode === "arvore" ? "#000000" : "#FFFFFF", color: viewMode === "arvore" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Árvore
        </button>
        <button onClick={() => setViewMode("frequencia")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: viewMode === "frequencia" ? "#000000" : "#FFFFFF", color: viewMode === "frequencia" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Frequência
        </button>
        <button onClick={() => setViewMode("historico")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: viewMode === "historico" ? "#000000" : "#FFFFFF", color: viewMode === "historico" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Histórico
        </button>
      </div>

      {viewMode === "arvore" ? (
        <div className="px-6 pb-28">
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">Arraste para os lados e toque em alguém</p>
          <div className="rounded-3xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <VisualTree tree={tree} openProfile={openProfile} levelOf={n => Math.max(0, LEVELS.indexOf(n.nivel))} rowLabels={LEVELS} />
          </div>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] mt-4 mb-2">Classificação</p>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {LEVELS.map(l => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: levelColor(l) }} />
                <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[10px]">{l}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] mb-2">Status de contato</p>
          <div className="flex items-center gap-4 flex-wrap">
            {[["Em dia", "#5A5A5A"], ["Atenção", "#9E9E9E"], ["Atrasado / sem contato", "#262626"]].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[10px]">{l}</span>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === "frequencia" ? (
        <div className="px-6 pb-28">
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-1">Marcar presença de uma reunião</p>
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] mb-3">Escolha a data — pode ser hoje ou uma reunião passada</p>
          <input type="date" value={attendanceISO} max={todayISO()} onChange={e => setAttendanceISO(e.target.value || todayISO())}
            className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-2">
            Quem veio em {labelFromISO(attendanceISO)}{attendanceISO === todayISO() ? " (hoje)" : ""}
          </p>
          <div className="flex flex-col gap-2 mb-6">
            {collectAll(tree).map(p => {
              const presentThisDay = (p.attendance || []).includes(labelFromISO(attendanceISO));
              return (
                <button key={p.id} onClick={() => toggleAttendanceForSelectedDate(p.id, p.attendance)}
                  className="flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                  style={{ background: presentThisDay ? "#0000000F" : "#FFFFFF", border: presentThisDay ? "1px solid #000000" : "1px solid transparent", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(p.id) }}>
                    <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[11px]">{initials(p.name)}</span>
                  </div>
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] flex-1 truncate">{p.name}</p>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: presentThisDay ? "#000000" : "#F2F2F2", border: presentThisDay ? "none" : "1px solid #D6D6D6" }}>
                    {presentThisDay && <Check size={13} color="#FFFFFF" />}
                  </div>
                </button>
              );
            })}
          </div>

          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">Quem está faltando</p>
          <div className="flex flex-col gap-2.5">
            {collectAll(tree)
              .map(p => ({ p, days: daysSinceLabel((p.attendance || [])[(p.attendance || []).length - 1]) }))
              .sort((a, b) => (b.days ?? 9999) - (a.days ?? 9999))
              .map(({ p, days }) => {
                const st = statusOf(days);
                const total = (p.attendance || []).length;
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(p.id) }}>
                      <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[11px]">{initials(p.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{p.name}</p>
                      <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px]">
                        {total} {total === 1 ? "presença" : "presenças"} · {days === null ? "nunca veio" : days === 0 ? "veio hoje" : `há ${days} dia${days > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full shrink-0" style={{ fontFamily: "Inter", background: st.color + "1E", color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      ) : viewMode === "historico" ? (
        <div className="px-6 pb-28">
          {(() => {
            const membros = collectAll(tree);
            const datesSet = new Set();
            membros.forEach(p => (p.attendance || []).forEach(d => datesSet.add(d)));
            const dates = [...datesSet].sort((a, b) => daysSinceLabel(a) - daysSinceLabel(b));
            if (dates.length === 0) {
              return (
                <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Nenhuma reunião registrada ainda — marque presença na aba Frequência.</p>
                </div>
              );
            }
            return (
              <>
                <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">{dates.length} {dates.length === 1 ? "reunião registrada" : "reuniões registradas"}</p>
                <div className="flex flex-col gap-2.5">
                  {dates.map(d => {
                    const foram = membros.filter(p => (p.attendance || []).includes(d));
                    return (
                      <button key={d} onClick={() => setHistoryDate(d)}
                        className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                        style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
                          <span style={{ fontFamily: "IBM Plex Mono", color: "#000000", fontWeight: 600 }} className="text-[12px]">{d}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{foram.length} foram · {membros.length - foram.length} faltaram</p>
                          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px]">de {membros.length} pessoas</p>
                        </div>
                        <ChevronRight size={15} color="#9E9E9E" />
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      ) : searchResults ? (
        <div className="px-6 pb-28">
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">{searchResults.length} resultado(s)</p>
          <div className="flex flex-col gap-2">
            {searchResults.map(({ node, trail }) => (
              <button key={node.id} onClick={() => openProfile(node.id)}
                className="flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(node.id) + "22" }}>
                  <span style={{ fontFamily: "Fraunces", color: colorFor(node.id), fontWeight: 600 }} className="text-[11px]">{initials(node.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10px] truncate">{trail.join(" › ")}</p>
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{node.name}</p>
                </div>
                <ChevronRight size={15} color="#9E9E9E" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mx-6 rounded-3xl p-5 mb-5 flex items-center gap-4" style={{ background: "#000000" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(tree.id) }}>
              <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[16px]">{initials(tree.name)}</span>
            </div>
            <div className="flex-1">
              {editingRoot ? (
                <div className="flex flex-col gap-2">
                  <input autoFocus value={rootDraft.name} onChange={e => setRootDraft({ ...rootDraft, name: e.target.value })} placeholder="Seu nome"
                    className="px-3 py-1.5 rounded-lg outline-none text-[13px]"
                    style={{ fontFamily: "Fraunces", fontWeight: 600, background: "rgba(242,242,242,0.12)", color: "#FFFFFF" }} />
                  <input value={rootDraft.role} onChange={e => setRootDraft({ ...rootDraft, role: e.target.value })} placeholder="Sua função (ex: Pastor titular)"
                    onKeyDown={e => e.key === "Enter" && saveRootEdit()}
                    className="px-3 py-1.5 rounded-lg outline-none text-[11px]"
                    style={{ fontFamily: "Inter", background: "rgba(242,242,242,0.12)", color: "#FFFFFF" }} />
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setEditingRoot(false)} className="px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ fontFamily: "Inter", background: "rgba(242,242,242,0.12)", color: "#FFFFFF" }}>Cancelar</button>
                    <button onClick={saveRootEdit} className="px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#000000" }}>Salvar</button>
                  </div>
                </div>
              ) : (
                <button onClick={openRootEdit} className="text-left">
                  <p style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[16px] flex items-center gap-1.5">
                    {tree.name} <span style={{ color: "#FFFFFF", fontFamily: "Inter", fontSize: 11 }}>(você)</span> <Pencil size={11} color="rgba(242,242,242,0.6)" />
                  </p>
                  <p style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[11px] mt-0.5">{tree.role}</p>
                  <div className="flex gap-3 mt-2">
                    <span style={{ fontFamily: "IBM Plex Mono", color: "rgba(242,242,242,0.6)" }} className="text-[10px]">{tree.children.length} diretos</span>
                    <span style={{ fontFamily: "IBM Plex Mono", color: "rgba(242,242,242,0.6)" }} className="text-[10px]">{countDescendants(tree)} na rede toda</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="px-6 pb-28">
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-2">Sua árvore</p>
            <div className="flex flex-col">
              {tree.children.map(child => (
                <TreeRow key={child.id} node={child} depth={0} expanded={expanded} toggleExpand={toggleExpand} openProfile={openProfile} openAddModal={openAddFor} />
              ))}
            </div>
          </div>
        </>
      )}
      </div>

      <button onClick={() => openAddFor(tree.id)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#2B2B2B", boxShadow: "0 6px 16px rgba(43,43,43,0.4)" }}>
        <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
      </button>

      {showAddFor && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAddFor(null)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Adicionar discípulo</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">
              Sob a responsabilidade de {findById(tree, showAddFor)?.id === "you" ? "você" : findById(tree, showAddFor)?.name}
            </p>
            <PhotoPickerField photo={form.photo} onChange={p => setForm({ ...form, photo: p })} />
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome completo"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Função ou ministério (ex: Líder de célula)"
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] mb-2">Nível na hierarquia</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setForm({ ...form, nivel: l })}
                  className="px-3 py-1.5 rounded-full text-[11px]"
                  style={{
                    fontFamily: "Inter",
                    background: form.nivel === l ? levelColor(l) : "#FFFFFF",
                    color: form.nivel === l ? "#F2F2F2" : "#4D4D4D",
                    border: `1px solid ${form.nivel === l ? levelColor(l) : "#D6D6D6"}`,
                  }}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={handleAdd}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              Adicionar à árvore
            </button>
          </div>
        </div>
      )}

      {profile && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setProfileId(null)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[90%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ background: colorFor(profile.id) }}>
                  {profile.photo ? <img src={profile.photo} alt="" className="w-full h-full object-cover" /> : <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[14px]">{initials(profile.name)}</span>}
                </div>
                <div>
                  <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px]">{profile.name}</p>
                  <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{profile.role}</p>
                </div>
              </div>
              <button onClick={() => setProfileId(null)}><X size={18} color="#9E9E9E" /></button>
            </div>

            {profile.id !== tree.id && (() => {
              const idx = Math.max(0, LEVELS.indexOf(profile.nivel));
              const canPromote = idx > 0;
              return (
                <div className="flex items-center justify-between rounded-2xl p-3 mb-3" style={{ background: levelColor(profile.nivel) + "1A" }}>
                  <div>
                    <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[10px]">Classificação atual</p>
                    <span className="text-[11px] px-2 py-0.5 rounded-full inline-block mt-1" style={{ fontFamily: "IBM Plex Mono", background: levelColor(profile.nivel) + "22", color: levelColor(profile.nivel) }}>
                      {profile.nivel || "Membros"}
                    </span>
                  </div>
                  {canPromote ? (
                    <button onClick={() => mutateTree(prev => updateNodeById(prev, profile.id, { nivel: LEVELS[idx - 1] }))}
                      className="px-3 py-2 rounded-full text-[11px] font-semibold" style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                      ↑ Promover para {LEVELS[idx - 1]}
                    </button>
                  ) : (
                    <span style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10px]">Nível mais alto</span>
                  )}
                </div>
              );
            })()}

            <div className="flex items-center justify-between rounded-2xl p-3 mb-3" style={{ background: statusOf(profile.daysAgo).color + "1A" }}>
              <div>
                <p style={{ fontFamily: "Inter", color: statusOf(profile.daysAgo).color, fontWeight: 600 }} className="text-[12px]">{statusOf(profile.daysAgo).label}</p>
                <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] mt-0.5">
                  {profile.daysAgo === null ? "Nunca contatado" : profile.daysAgo === 0 ? "Contato hoje" : `Último contato há ${profile.daysAgo} dias`}
                </p>
              </div>
              <button onClick={markContactToday}
                className="px-3 py-2 rounded-full text-[11px] font-semibold" style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                Marcar contato hoje
              </button>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-2 px-1 mb-4">
                <Phone size={13} color="#707070" />
                <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">{profile.phone}</span>
              </div>
            )}

            {profile.id !== tree.id && (
              <>
                <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-1">Classificação na árvore</p>
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10px] mb-2">Mudou de função? Atualize aqui e a posição dela na árvore muda também.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => mutateTree(prev => updateNodeById(prev, profile.id, { nivel: l }))}
                      className="px-3 py-1.5 rounded-full text-[11px]"
                      style={{
                        fontFamily: "Inter",
                        background: profile.nivel === l ? levelColor(l) : "#FFFFFF",
                        color: profile.nivel === l ? "#F2F2F2" : "#4D4D4D",
                        border: `1px solid ${profile.nivel === l ? levelColor(l) : "#D6D6D6"}`,
                      }}>
                      {l}
                    </button>
                  ))}
                </div>
              </>
            )}

            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-2">Anotações</p>
            <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} onBlur={saveNotes} rows={3}
              placeholder="Ex: pedido de oração, contexto familiar, próximos passos..."
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px] resize-none"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <div className="flex gap-3 mb-3">
              <button onClick={() => { openAddFor(profile.id); setProfileId(null); }}
                className="flex-1 py-3 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#000000", border: "1px solid #D6D6D6" }}>
                + Discípulo aqui
              </button>
              <button onClick={revealInTree}
                className="flex-1 py-3 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                {profile.children.length > 0 ? "Ver na árvore" : "Fechar"}
              </button>
            </div>

            {profile.id !== tree.id && (
              confirmRemove ? (
                <div className="rounded-2xl p-3.5" style={{ background: "#B33B3B1A" }}>
                  <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[12px] mb-3">Remover {profile.name} da árvore? Quem estiver abaixo dela também sai.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmRemove(false)} className="flex-1 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D" }}>Cancelar</button>
                    <button onClick={removeMember} className="flex-1 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>Remover</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmRemove(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[12.5px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#B33B3B", border: "1px solid #D6D6D6" }}>
                  <Trash2 size={14} /> Remover da árvore — pessoa que saiu
                </button>
              )
            )}
          </div>
        </div>
      )}

      {historyDate && (() => {
        const membros = collectAll(tree);
        const foram = membros.filter(p => (p.attendance || []).includes(historyDate));
        const faltaram = membros.filter(p => !(p.attendance || []).includes(historyDate));
        return (
          <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setHistoryDate(null)}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2", maxHeight: "80%", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px]">Reunião de {historyDate}</p>
                <button onClick={() => setHistoryDate(null)}><X size={18} color="#9E9E9E" /></button>
              </div>
              <div className="overflow-y-auto">
                <p style={{ fontFamily: "Inter", color: "#4B7D5C" }} className="text-[11px] font-semibold uppercase tracking-wide mb-2">Foram ({foram.length})</p>
                <div className="flex flex-col gap-1.5 mb-4">
                  {foram.length === 0 ? (
                    <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px] mb-2">Ninguém marcado.</p>
                  ) : foram.map(p => (
                    <div key={p.id} className="flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: "#FFFFFF" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(p.id) }}>
                        <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[9.5px]">{initials(p.name)}</span>
                      </div>
                      <p style={{ fontFamily: "Inter", color: "#000000" }} className="text-[12.5px] flex-1 truncate">{p.name}</p>
                      <Check size={14} color="#4B7D5C" />
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "Inter", color: "#B25B4A" }} className="text-[11px] font-semibold uppercase tracking-wide mb-2">Faltaram ({faltaram.length})</p>
                <div className="flex flex-col gap-1.5">
                  {faltaram.length === 0 ? (
                    <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Ninguém — todo mundo veio!</p>
                  ) : faltaram.map(p => (
                    <div key={p.id} className="flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: "#FFFFFF" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(p.id), opacity: 0.5 }}>
                        <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[9.5px]">{initials(p.name)}</span>
                      </div>
                      <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12.5px] flex-1 truncate">{p.name}</p>
                      <X size={14} color="#B25B4A" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default DiscipuladoScreen;
