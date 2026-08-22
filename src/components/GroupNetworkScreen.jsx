import React, { useContext, useState } from "react";
import { Check, ChevronRight, Copy, Link2, Trash2, X } from "lucide-react";
import { addChildToId, collectAll, colorFor, countDescendants, daysSinceLabel, findById, initials, labelFromISO, removeNodeById, statusOf, todayISO, updateNodeById } from "../utils/helpers.js";
import { UserContext } from "../context/contexts.js";
import VisualTree from "./VisualTree.jsx";
import PhotoPickerField from "./PhotoPickerField.jsx";

// Tela reutilizavel: lista de grupos (GR, Fundamentos, Ministerios...), cada um com
// lider + arvore de membros e link de convite. Usada por GRScreen e FundamentosScreen.
function GroupNetworkScreen({ onBack, title, itemLabel, itemPlaceholder, linkPrefix, icon: Icon, palette, groups, addGroup, updateGroupTree, deleteGroup }) {
  const me = useContext(UserContext);
  const [openId, setOpenId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", desc: "", photo: null });
  const [profileId, setProfileId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("arvore"); // arvore | membros | frequencia | historico
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);
  const [historyDate, setHistoryDate] = useState(null);
  const [attendanceISO, setAttendanceISO] = useState(todayISO());

  const group = groups.find(g => g.id === openId);
  const profile = group && profileId ? findById(group.leader, profileId) : null;

  const updateTree = (id, updater) => {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    updateGroupTree(id, updater(g.leader));
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const color = palette[groups.length % palette.length];
    const code = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    addGroup({
      name: form.name.trim(), desc: form.desc.trim() || `Novo ${itemLabel.toLowerCase()}`, color, code, photo: form.photo,
      leader: { id: "l" + Date.now(), name: me.name || "Você", role: "Líder", daysAgo: 0, attendance: [], notes: "", phone: "", children: [] },
    });
    setForm({ name: "", desc: "", photo: null });
    setShowAdd(false);
  };

  const removeMember = () => {
    if (!group || !profile || profile.id === group.leader.id) return;
    updateTree(group.id, leader => removeNodeById(leader, profile.id));
    setConfirmRemove(false);
    setProfileId(null);
  };

  const toggleAttendanceForSelectedDate = (memberId, currentAttendance) => {
    if (!group) return;
    const label = labelFromISO(attendanceISO);
    const already = (currentAttendance || []).includes(label);
    const next = already ? (currentAttendance || []).filter(d => d !== label) : [...(currentAttendance || []), label];
    updateTree(group.id, leader => updateNodeById(leader, memberId, { attendance: next }));
  };

  const handleDeleteGroup = () => {
    if (!group) return;
    deleteGroup(group.id);
    setConfirmDeleteGroup(false);
    setOpenId(null);
  };

  const copyLink = (code) => {
    setCopied(code);
    setTimeout(() => setCopied(false), 1500);
  };

  if (group) {
    return (
      <div className="flex-1 overflow-y-auto relative" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <button onClick={() => { setOpenId(null); setTab("arvore"); }} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← {title}</button>
          <button onClick={() => setConfirmDeleteGroup(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#B33B3B1A" }}>
            <Trash2 size={14} color="#B33B3B" />
          </button>
        </div>
        <div className="px-6 mt-2 mb-1 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: group.color + "22" }}>
            {group.photo ? <img src={group.photo} alt="" className="w-full h-full object-cover" /> : <Icon size={19} color={group.color} />}
          </div>
          <div>
            <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[18px] leading-tight">{group.name}</h1>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] mt-0.5">{group.desc}</p>
          </div>
        </div>

        <div className="mx-6 mt-5 mb-5 rounded-2xl p-4 flex items-center justify-between" style={{ background: "#000000" }}>
          <div className="flex items-center gap-2 min-w-0">
            <Link2 size={15} color="#FFFFFF" />
            <span style={{ fontFamily: "IBM Plex Mono", color: "#FFFFFF" }} className="text-[11px] truncate">igreja.app/{linkPrefix}/{group.code}</span>
          </div>
          <button onClick={() => copyLink(group.code)} className="shrink-0 ml-2 flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: "rgba(242,242,242,0.1)" }}>
            <Copy size={12} color="#F2F2F2" />
            <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[10px]">{copied === group.code ? "Copiado!" : "Copiar"}</span>
          </button>
        </div>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] px-6 mb-5 -mt-2">
          Envie este link — quem entrar aparece automaticamente na árvore abaixo.
        </p>

        <div className="px-6 mb-5 flex gap-2">
          <button onClick={() => setTab("arvore")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: tab === "arvore" ? "#000000" : "#FFFFFF", color: tab === "arvore" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Árvore
          </button>
          <button onClick={() => setTab("membros")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: tab === "membros" ? "#000000" : "#FFFFFF", color: tab === "membros" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Membros
          </button>
          <button onClick={() => setTab("frequencia")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: tab === "frequencia" ? "#000000" : "#FFFFFF", color: tab === "frequencia" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Frequência
          </button>
          <button onClick={() => setTab("historico")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: tab === "historico" ? "#000000" : "#FFFFFF", color: tab === "historico" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Histórico
          </button>
        </div>

        {tab === "arvore" ? (
          <div className="px-6 pb-28">
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">Árvore do {itemLabel.toLowerCase()}</p>
            <div className="rounded-3xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <VisualTree tree={group.leader} openProfile={(id) => { setConfirmRemove(false); setProfileId(id); }} />
            </div>
          </div>
        ) : tab === "membros" ? (
          <div className="px-6 pb-28">
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">
              {collectAll(group.leader).length} pessoas
            </p>
            <div className="flex flex-col gap-2.5">
              {collectAll(group.leader).map(p => {
                const isLeader = p.id === group.leader.id;
                const lastAttendance = (p.attendance || [])[(p.attendance || []).length - 1];
                const st = statusOf(daysSinceLabel(lastAttendance));
                return (
                  <button key={p.id} onClick={() => { setConfirmRemove(false); setProfileId(p.id); }}
                    className="flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                    style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: isLeader ? group.color : group.color + "22" }}>
                        <span style={{ fontFamily: "Fraunces", fontWeight: 600, color: isLeader ? "#F2F2F2" : group.color }} className="text-[12px]">
                          {initials(p.name)}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: st.color, border: "2px solid #F2F2F2" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">
                        {p.name} {isLeader && <span style={{ color: group.color, fontFamily: "IBM Plex Mono", fontSize: 10 }}>· líder</span>}
                      </p>
                      <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">{p.role}</p>
                    </div>
                    <ChevronRight size={15} color="#9E9E9E" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : tab === "frequencia" ? (
          <div className="px-6 pb-28">
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-1">Marcar presença de uma reunião</p>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] mb-3">Escolha a data — pode ser hoje ou uma reunião passada que ficou sem marcar</p>
            <input type="date" value={attendanceISO} max={todayISO()} onChange={e => setAttendanceISO(e.target.value || todayISO())}
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-2">
              Quem veio em {labelFromISO(attendanceISO)}{attendanceISO === todayISO() ? " (hoje)" : ""}
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {collectAll(group.leader).map(p => {
                const presentThisDay = (p.attendance || []).includes(labelFromISO(attendanceISO));
                return (
                  <button key={p.id} onClick={() => toggleAttendanceForSelectedDate(p.id, p.attendance)}
                    className="flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                    style={{ background: presentThisDay ? group.color + "1A" : "#FFFFFF", border: presentThisDay ? `1px solid ${group.color}` : "1px solid transparent", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(p.id) }}>
                      <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[11px]">{initials(p.name)}</span>
                    </div>
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] flex-1 truncate">{p.name}</p>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: presentThisDay ? group.color : "#F2F2F2", border: presentThisDay ? "none" : "1px solid #D6D6D6" }}>
                      {presentThisDay && <Check size={13} color="#FFFFFF" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">Quem está faltando</p>
            <div className="flex flex-col gap-2.5">
              {collectAll(group.leader)
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
        ) : (
          <div className="px-6 pb-28">
            {(() => {
              const membros = collectAll(group.leader);
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
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: group.color + "1E" }}>
                            <span style={{ fontFamily: "IBM Plex Mono", color: group.color, fontWeight: 600 }} className="text-[12px]">{d}</span>
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
        )}

        {historyDate && (() => {
          const membros = collectAll(group.leader);
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

        <button onClick={() => setShowAddMember(true)}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: group.color, boxShadow: `0 6px 16px ${group.color}66` }}>
          <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
        </button>

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
                updateTree(group.id, (leader) => addChildToId(leader, leader.id, { id: newId, name: memberName.trim(), role: "Membro", daysAgo: null, attendance: [], notes: "", phone: "", children: [] }));
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
                Faz parte de {group.name}, entrou pelo link de convite.
              </p>
              {profile.id !== group.leader.id && (
                confirmRemove ? (
                  <div className="rounded-2xl p-3.5" style={{ background: "#B33B3B1A" }}>
                    <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[12px] mb-3">Remover {profile.name} do {itemLabel.toLowerCase()}? Quem estiver abaixo dela na árvore também sai.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmRemove(false)} className="flex-1 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D" }}>Cancelar</button>
                      <button onClick={removeMember} className="flex-1 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>Remover</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmRemove(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[12.5px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#B33B3B", border: "1px solid #D6D6D6" }}>
                    <Trash2 size={14} /> Remover da {itemLabel === "Turma" ? "turma" : "árvore"} — pessoa que saiu
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {confirmDeleteGroup && (
          <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setConfirmDeleteGroup(false)}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-2">Excluir {itemLabel.toLowerCase()}?</p>
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-5">
                Isso apaga {group.name} e todas as {collectAll(group.leader).length} pessoas dele(a) permanentemente. Não dá pra desfazer.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDeleteGroup(false)} className="flex-1 py-3 rounded-full text-[13px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D" }}>Cancelar</button>
                <button onClick={handleDeleteGroup} className="flex-1 py-3 rounded-full text-[13px] font-semibold" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#0000000F", color: "#616161" }}>
          {groups.length} {groups.length === 1 ? itemLabel.toLowerCase() : itemLabel.toLowerCase() + "s"}
        </span>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">{title}</h1>
      </div>

      <div className="px-6 pb-28 flex flex-col gap-3">
        {groups.map(g => {
          const count = countDescendants(g.leader) + 1;
          const preview = collectAll(g.leader).slice(0, 4);
          return (
            <div key={g.id} onClick={() => setOpenId(g.id)}
              className="rounded-2xl p-4 text-left active:scale-[0.98] transition-transform cursor-pointer"
              style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: g.color + "22" }}>
                  {g.photo ? <img src={g.photo} alt="" className="w-full h-full object-cover" /> : <Icon size={16} color={g.color} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[14px] truncate">{g.name}</p>
                  <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">{g.desc}</p>
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
                  <span style={{ fontFamily: "IBM Plex Mono", color: "#4D4D4D" }} className="text-[10px] truncate">igreja.app/{linkPrefix}/{g.code}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); copyLink(g.code); }}
                  className="shrink-0 ml-2 flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "#000000" }}>
                  <Copy size={10} color="#FFFFFF" />
                  <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[9px]">{copied === g.code ? "Copiado!" : "Convidar"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => setShowAdd(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#2B2B2B", boxShadow: "0 6px 16px rgba(43,43,43,0.4)" }}>
        <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
      </button>

      {showAdd && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Novo {itemLabel.toLowerCase()}</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Você vira o líder e ganha um link de convite</p>
            <PhotoPickerField photo={form.photo} onChange={p => setForm({ ...form, photo: p })} label="Foto do grupo (opcional)" />
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={itemPlaceholder}
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Descrição curta"
              className="w-full px-4 py-3 rounded-xl mb-5 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <button onClick={handleAdd}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              Criar {itemLabel.toLowerCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupNetworkScreen;
