import React, { useState, useEffect, useContext, createContext } from "react";
import {
  ChevronRight,
  Copy,
  Link2,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import { collection, addDoc, doc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { addChildToId, collectAll, colorFor, countDescendants, findById, getMonthGrid, initials, removeNodeById, statusOf } from "../utils/helpers.js";
import { MINISTRY_COLORS } from "../data/constants.js";
import VisualTree from "../components/VisualTree.jsx";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function MinisteriosScreen({ onBack }) {
  const me = useContext(UserContext);
  const [ministries, setMinistries] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", desc: "" });
  const [profileId, setProfileId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [minTab, setMinTab] = useState("arvore"); // arvore | escala
  const [escalaDay, setEscalaDay] = useState(() => new Date().getDate());
  const [showAddEscala, setShowAddEscala] = useState(false);
  const [escalaForm, setEscalaForm] = useState({ name: "", role: "" });
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "ministries"), snap => {
      setMinistries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  const ministry = ministries.find(m => m.id === openId);
  const profile = ministry && profileId ? findById(ministry.leader, profileId) : null;

  const updateMinistryTree = (id, updater) => {
    const m = ministries.find(x => x.id === id);
    if (!m) return;
    updateDoc(doc(db, "ministries", id), { leader: updater(m.leader) })
      .catch(err => console.error("MIN_UPDATE_ERR", err.code, err.message));
  };

  const removeMember = () => {
    if (!ministry || !profile || profile.id === ministry.leader.id) return;
    updateMinistryTree(ministry.id, leader => removeNodeById(leader, profile.id));
    setConfirmRemove(false);
    setProfileId(null);
  };

  const addEscalado = () => {
    if (!escalaForm.name.trim() || !ministry) return;
    updateDoc(doc(db, "ministries", ministry.id), {
      escalas: [...(ministry.escalas || []), { id: "esc" + Date.now(), day: escalaDay, name: escalaForm.name.trim(), role: escalaForm.role.trim() || "Escalado" }],
    }).catch(err => console.error("ESCALA_ADD_ERR", err.code, err.message));
    setEscalaForm({ name: "", role: "" });
    setShowAddEscala(false);
  };

  const removeEscalado = (escId) => {
    if (!ministry) return;
    updateDoc(doc(db, "ministries", ministry.id), {
      escalas: (ministry.escalas || []).filter(e => e.id !== escId),
    }).catch(err => console.error("ESCALA_REMOVE_ERR", err.code, err.message));
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const color = MINISTRY_COLORS[ministries.length % MINISTRY_COLORS.length];
    const code = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    addDoc(collection(db, "ministries"), {
      name: form.name.trim(), desc: form.desc.trim() || "Novo ministério", color, code,
      leader: { id: "l" + Date.now(), name: me.name || "Você", role: "Líder do ministério", daysAgo: 0, notes: "", phone: "", children: [] },
      escalas: [], createdAt: serverTimestamp(),
    }).catch(err => console.error("MIN_ADD_ERR", err.code, err.message));
    setForm({ name: "", desc: "" });
    setShowAdd(false);
  };

  const copyLink = (code) => {
    setCopied(code);
    setTimeout(() => setCopied(false), 1500);
  };

  if (ministry) {
    return (
      <div className="flex-1 relative flex flex-col min-h-0" style={{ background: "#F2F2F2" }}>
        <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Ministérios</button>
        </div>
        <div className="px-6 mt-2 mb-1 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ministry.color + "22" }}>
            <Sparkles size={19} color={ministry.color} />
          </div>
          <div>
            <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[18px] leading-tight">{ministry.name}</h1>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] mt-0.5">{ministry.desc}</p>
          </div>
        </div>

        <div className="mx-6 mt-5 mb-5 rounded-2xl p-4 flex items-center justify-between" style={{ background: "#000000" }}>
          <div className="flex items-center gap-2 min-w-0">
            <Link2 size={15} color="#FFFFFF" />
            <span style={{ fontFamily: "IBM Plex Mono", color: "#FFFFFF" }} className="text-[11px] truncate">igreja.app/entrar/{ministry.code}</span>
          </div>
          <button onClick={() => copyLink(ministry.code)} className="shrink-0 ml-2 flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: "rgba(242,242,242,0.1)" }}>
            <Copy size={12} color="#F2F2F2" />
            <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[10px]">{copied === ministry.code ? "Copiado!" : "Copiar"}</span>
          </button>
        </div>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] px-6 mb-5 -mt-2">
          Envie este link — quem entrar aparece automaticamente na árvore abaixo.
        </p>

        <div className="px-6 mb-5 flex gap-2">
          <button onClick={() => setMinTab("arvore")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: minTab === "arvore" ? "#000000" : "#FFFFFF", color: minTab === "arvore" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Árvore
          </button>
          <button onClick={() => setMinTab("escala")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: minTab === "escala" ? "#000000" : "#FFFFFF", color: minTab === "escala" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Escala
          </button>
          <button onClick={() => setMinTab("membros")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: minTab === "membros" ? "#000000" : "#FFFFFF", color: minTab === "membros" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Membros
          </button>
        </div>

        {minTab === "arvore" ? (
          <div className="px-6 pb-28">
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">Árvore do ministério</p>
            <div className="rounded-3xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <VisualTree tree={ministry.leader} openProfile={(id) => { setConfirmRemove(false); setProfileId(id); }} />
            </div>
          </div>
        ) : minTab === "membros" ? (
          <div className="px-6 pb-28">
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">
              {collectAll(ministry.leader).length} pessoas no ministério
            </p>
            <div className="flex flex-col gap-2.5">
              {collectAll(ministry.leader).map(p => {
                const isLeader = p.id === ministry.leader.id;
                const st = statusOf(p.daysAgo);
                return (
                  <button key={p.id} onClick={() => { setConfirmRemove(false); setProfileId(p.id); }}
                    className="flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                    style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: isLeader ? ministry.color : ministry.color + "22" }}>
                        <span style={{ fontFamily: "Fraunces", fontWeight: 600, color: isLeader ? "#F2F2F2" : ministry.color }} className="text-[12px]">
                          {initials(p.name)}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: st.color, border: "2px solid #F2F2F2" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">
                        {p.name} {isLeader && <span style={{ color: ministry.color, fontFamily: "IBM Plex Mono", fontSize: 10 }}>· líder</span>}
                      </p>
                      <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">{p.role}</p>
                    </div>
                    <ChevronRight size={15} color="#9E9E9E" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-6 pb-28">
            {(() => {
              const hoje = new Date();
              const anoAtual = hoje.getFullYear(), mesAtual = hoje.getMonth();
              const weeks = getMonthGrid(anoAtual, mesAtual);
              const escalas = ministry.escalas || [];
              const escaladoDays = new Set(escalas.map(e => e.day));
              const dayEscalas = escalas.filter(e => e.day === escalaDay);
              return (
                <>
                  <div className="rounded-3xl p-4 mb-5" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] mb-3">{MESES[mesAtual]} {anoAtual}</p>
                    <div className="grid grid-cols-7 mb-2">
                      {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                        <span key={i} style={{ fontFamily: "IBM Plex Mono", color: "#9E9E9E" }} className="text-[10px] text-center">{d}</span>
                      ))}
                    </div>
                    {weeks.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-7 mb-1">
                        {week.map((d, di) => {
                          if (!d) return <div key={di} />;
                          const isSelected = d === escalaDay;
                          const hasEsc = escaladoDays.has(d);
                          return (
                            <button key={di} onClick={() => setEscalaDay(d)} className="flex flex-col items-center py-1">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: isSelected ? ministry.color : "transparent" }}>
                                <span style={{ fontFamily: "Inter", color: isSelected ? "#F2F2F2" : "#000000", fontSize: 12 }}>{d}</span>
                              </div>
                              <div className="h-1.5 mt-0.5">
                                {hasEsc && <div className="w-1 h-1 rounded-full" style={{ background: isSelected ? "#F2F2F2" : ministry.color }} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">Escalados em {escalaDay} de {MESES[mesAtual].toLowerCase()}</p>
                  {dayEscalas.length === 0 ? (
                    <div className="rounded-2xl py-8 text-center" style={{ background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
                      <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Ninguém escalado neste dia ainda.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {dayEscalas.map(e => (
                        <div key={e.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(e.id) }}>
                            <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[11px]">{initials(e.name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{e.name}</p>
                            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">{e.role}</p>
                          </div>
                          <button onClick={() => removeEscalado(e.id)}><X size={15} color="#9E9E9E" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
        </div>

        <button onClick={() => minTab === "escala" ? setShowAddEscala(true) : setShowAddMember(true)}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: ministry.color, boxShadow: `0 6px 16px ${ministry.color}66` }}>
          <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
        </button>

        {showAddEscala && (
          <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAddEscala(false)}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Escalar para o dia {escalaDay}</p>
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Toque num nome ou digite outro</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {collectAll(ministry.leader).map(p => (
                  <button key={p.id} onClick={() => setEscalaForm({ ...escalaForm, name: p.name })}
                    className="px-3 py-1.5 rounded-full text-[11px]"
                    style={{
                      fontFamily: "Inter",
                      background: escalaForm.name === p.name ? ministry.color : "#FFFFFF",
                      color: escalaForm.name === p.name ? "#F2F2F2" : "#4D4D4D",
                      border: `1px solid ${escalaForm.name === p.name ? ministry.color : "#D6D6D6"}`,
                    }}>
                    {p.name}
                  </button>
                ))}
              </div>
              <input value={escalaForm.name} onChange={e => setEscalaForm({ ...escalaForm, name: e.target.value })} placeholder="Nome"
                className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
              <input value={escalaForm.role} onChange={e => setEscalaForm({ ...escalaForm, role: e.target.value })} placeholder="Função nesse dia (ex: Vocal, Ator principal)"
                className="w-full px-4 py-3 rounded-xl mb-5 outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
              <button onClick={addEscalado}
                className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
                style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
                Escalar
              </button>
            </div>
          </div>
        )}

        {showAddMember && (
          <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAddMember(false)}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-4">Adicionar membro</p>
              <input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="Nome do membro"
                className="w-full px-4 py-3 rounded-xl mb-5 outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
              <button onClick={() => {
                if (!memberName.trim()) return;
                const newId = "m" + Date.now();
                updateMinistryTree(ministry.id, (leader) => addChildToId(leader, leader.id, { id: newId, name: memberName.trim(), role: "Membro", daysAgo: null, notes: "", phone: "", children: [] }));
                setMemberName(""); setShowAddMember(false);
                setProfileId(newId);
              }}
                className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
                style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
                Adicionar
              </button>
            </div>
          </div>
        )}

        {profile && (
          <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setProfileId(null)}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: colorFor(profile.id) }}>
                    <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[13px]">{initials(profile.name)}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[15px]">{profile.name}</p>
                    <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{profile.role}</p>
                  </div>
                </div>
                <button onClick={() => setProfileId(null)}><X size={18} color="#9E9E9E" /></button>
              </div>
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] mb-4">
                Membro do ministério de {ministry.name.replace("Ministério de ", "")}, entrou pelo link de convite.
              </p>
              {profile.id !== ministry.leader.id && (
                confirmRemove ? (
                  <div className="rounded-2xl p-3.5" style={{ background: "#B33B3B1A" }}>
                    <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[12px] mb-3">Remover {profile.name} do ministério? Quem estiver abaixo dela na árvore também sai.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmRemove(false)} className="flex-1 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D" }}>Cancelar</button>
                      <button onClick={removeMember} className="flex-1 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>Remover</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmRemove(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[12.5px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#B33B3B", border: "1px solid #D6D6D6" }}>
                    <Trash2 size={14} /> Remover do ministério — pessoa que saiu
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col min-h-0" style={{ background: "#F2F2F2" }}>
      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#0000000F", color: "#616161" }}>
          {ministries.length} ministérios
        </span>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Ministérios</h1>
      </div>

      <div className="px-6 pb-28 flex flex-col gap-3">
        {ministries.map(m => {
          const count = countDescendants(m.leader) + 1;
          const preview = collectAll(m.leader).slice(0, 4);
          return (
            <div key={m.id} onClick={() => setOpenId(m.id)}
              className="rounded-2xl p-4 text-left active:scale-[0.98] transition-transform cursor-pointer"
              style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: m.color + "22" }}>
                  <Sparkles size={16} color={m.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[14px] truncate">{m.name}</p>
                  <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">{m.desc}</p>
                </div>
                <ChevronRight size={16} color="#9E9E9E" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex -space-x-2">
                  {preview.map(p => (
                    <div key={p.id} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: colorFor(p.id), border: "2px solid #FFFFFF" }}>
                      <span style={{ fontFamily: "Inter", color: "#F2F2F2", fontSize: 8, fontWeight: 700 }}>{initials(p.name)}</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{count} pessoas</span>
              </div>
              <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#F2F2F2" }}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Link2 size={12} color="#9E9E9E" />
                  <span style={{ fontFamily: "IBM Plex Mono", color: "#4D4D4D" }} className="text-[10px] truncate">igreja.app/entrar/{m.code}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); copyLink(m.code); }}
                  className="shrink-0 ml-2 flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "#000000" }}>
                  <Copy size={10} color="#FFFFFF" />
                  <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[9px]">{copied === m.code ? "Copiado!" : "Convidar"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      <button onClick={() => setShowAdd(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#2B2B2B", boxShadow: "0 6px 16px rgba(43,43,43,0.4)" }}>
        <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
      </button>

      {showAdd && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Novo ministério</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Você vira o líder e ganha um link de convite</p>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Ministério de Teatro"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Descrição curta"
              className="w-full px-4 py-3 rounded-xl mb-5 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <button onClick={handleAdd}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              Criar ministério
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MinisteriosScreen;
