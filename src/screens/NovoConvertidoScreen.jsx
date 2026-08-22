import React, { useContext, useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronRight, UserCheck, X } from "lucide-react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials, fmtDateBR, collectAll } from "../utils/helpers.js";
import MemberPickerSheet from "../components/MemberPickerSheet.jsx";
import Avatar from "../components/Avatar.jsx";

const CULTOS_SUGERIDOS = ["Domingo Manhã", "Domingo Noite", "Quarta-feira"];

// Cadastro de novo convertido: um membro da igreja registra a pessoa que acabou
// de se converter e escolhe, entre quem já tem conta no app, quem vai
// acompanhá-la como discipulador — pra ninguém ficar sem acompanhamento.
// A aba "Cadastrados" cruza o nome de cada um com as árvores de GR/Fundamentos
// (por nome, já que esses grupos não usam conta de app) pra mostrar se a
// pessoa já entrou nalgum grupo de estudo.
function NovoConvertidoScreen({ onBack }) {
  const me = useContext(UserContext);
  const [tab, setTab] = useState("cadastrar"); // cadastrar | cadastrados | painel
  const [lista, setLista] = useState([]);
  const [grGroups, setGrGroups] = useState([]);
  const [fundamentosGroups, setFundamentosGroups] = useState([]);
  const [form, setForm] = useState({ nome: "", telefone: "", nascimento: "", notes: "", culto: "" });
  const [discipulador, setDiscipulador] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "novosConvertidos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setLista(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubGr = onSnapshot(collection(db, "grGroups"), snap => {
      setGrGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    const unsubFund = onSnapshot(collection(db, "fundamentosGroups"), snap => {
      setFundamentosGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => { unsubGr(); unsubFund(); };
  }, []);

  const grupoDe = useMemo(() => {
    const norm = (s) => (s || "").trim().toLowerCase();
    return (nome) => {
      const alvo = norm(nome);
      if (!alvo) return null;
      for (const g of grGroups) {
        if (collectAll(g.leader).some(p => norm(p.name) === alvo)) return { tipo: "GR", nomeGrupo: g.name };
      }
      for (const g of fundamentosGroups) {
        if (collectAll(g.leader).some(p => norm(p.name) === alvo)) return { tipo: "Fundamentos", nomeGrupo: g.name };
      }
      return null;
    };
  }, [grGroups, fundamentosGroups]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const aberto = lista.find(c => c.id === openId);

  const porMes = useMemo(() => {
    const counts = new Map();
    let minDate = null;
    lista.forEach(c => {
      const dt = c.createdAt?.toDate?.();
      if (!dt) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      counts.set(key, (counts.get(key) || 0) + 1);
      if (!minDate || dt < minDate) minDate = dt;
    });
    if (!minDate) return [];
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const months = [];
    let cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      const label = cursor.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
      months.push({ key, label, count: counts.get(key) || 0 });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return months;
  }, [lista]);

  const porCulto = useMemo(() => {
    const map = new Map();
    lista.forEach(c => {
      const key = c.culto?.trim() || "Não informado";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [lista]);

  const handleSubmit = async () => {
    setError("");
    if (!form.nome.trim()) { setError("Digite o nome do novo convertido."); return; }
    if (!discipulador) { setError("Escolha um discipulador pra acompanhar a pessoa."); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, "novosConvertidos"), {
        nome: form.nome.trim(), telefone: form.telefone.trim(), nascimento: form.nascimento || "", notes: form.notes.trim(), culto: form.culto.trim(),
        discipuladorUid: discipulador.uid, discipuladorNome: discipulador.nome || "Membro", discipuladorPhoto: discipulador.photo || null,
        registradoPorUid: me.uid, registradoPorNome: me.name,
        createdAt: serverTimestamp(),
      });
      setForm({ nome: "", telefone: "", nascimento: "", notes: "", culto: "" });
      setDiscipulador(null);
    } catch (err) {
      setError("Não consegui salvar agora. Tenta de novo.");
      console.error("NOVOCONVERTIDO_ADD_ERR", err.code, err.message);
    }
    setSaving(false);
  };

  if (aberto) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Novo Convertido</button>
        </div>
        <div className="flex flex-col items-center px-6 mt-3 mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: colorFor(aberto.nome) }}>
            <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[22px]">{initials(aberto.nome)}</span>
          </div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[19px]">{aberto.nome}</h1>
          {aberto.nascimento && <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12.5px] mt-1">{fmtDateBR(aberto.nascimento)}</p>}
        </div>
        <div className="px-6 mb-5">
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            {aberto.telefone && (
              <div>
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">Telefone</p>
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{aberto.telefone}</p>
              </div>
            )}
            {aberto.culto && (
              <div style={{ borderTop: "1px solid #F0EAD9", paddingTop: 12 }}>
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">Culto</p>
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{aberto.culto}</p>
              </div>
            )}
            {aberto.notes && (
              <div style={{ borderTop: "1px solid #F0EAD9", paddingTop: 12 }}>
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">Observações</p>
                <p style={{ fontFamily: "Inter", color: "#000000" }} className="text-[13px] leading-relaxed">{aberto.notes}</p>
              </div>
            )}
            <div style={{ borderTop: "1px solid #F0EAD9", paddingTop: 12 }}>
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px] mb-2">Discipulador responsável</p>
              <div className="flex items-center gap-2.5">
                <Avatar name={aberto.discipuladorNome} uid={aberto.discipuladorUid} photo={aberto.discipuladorPhoto} size={34} fontSize={11} />
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{aberto.discipuladorNome}</p>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #F0EAD9", paddingTop: 12 }}>
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px] mb-1">Grupo de estudo</p>
              {(() => {
                const g = grupoDe(aberto.nome);
                return g ? (
                  <p style={{ fontFamily: "Inter", color: "#4B7D5C", fontWeight: 600 }} className="text-[13px]">{g.tipo} · {g.nomeGrupo}</p>
                ) : (
                  <p style={{ fontFamily: "Inter", color: "#B25B4A" }} className="text-[13px]">Ainda não entrou em nenhum grupo</p>
                );
              })()}
            </div>
            {aberto.registradoPorNome && (
              <p style={{ fontFamily: "Inter", color: "#B0A18A", borderTop: "1px solid #F0EAD9", paddingTop: 12 }} className="text-[10.5px]">
                Cadastrado por {aberto.registradoPorNome}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Novo Convertido</h1>
        <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Cadastre e escolha quem vai discipular</p>
      </div>

      <div className="flex gap-2 px-6 mb-5">
        <button onClick={() => setTab("cadastrar")} className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: tab === "cadastrar" ? "#000000" : "#FFFFFF", color: tab === "cadastrar" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Cadastrar
        </button>
        <button onClick={() => setTab("cadastrados")} className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: tab === "cadastrados" ? "#000000" : "#FFFFFF", color: tab === "cadastrados" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Cadastrados ({lista.length})
        </button>
        <button onClick={() => setTab("painel")} className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: tab === "painel" ? "#000000" : "#FFFFFF", color: tab === "painel" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Painel
        </button>
      </div>

      {tab === "cadastrar" && (
      <div className="px-6 mb-6">
        <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Nome</label>
        <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome do novo convertido"
          className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
          style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

        <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Telefone / WhatsApp <span style={{ color: "#9E9E9E" }}>(opcional)</span></label>
        <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 90000-0000"
          className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
          style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

        <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Data de nascimento <span style={{ color: "#9E9E9E" }}>(opcional)</span></label>
        <input type="date" value={form.nascimento} onChange={e => set("nascimento", e.target.value)}
          className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
          style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

        <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Observações <span style={{ color: "#9E9E9E" }}>(opcional)</span></label>
        <input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Ex: pediu oração no altar..."
          className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
          style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

        <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Culto <span style={{ color: "#9E9E9E" }}>(opcional)</span></label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {CULTOS_SUGERIDOS.map(c => (
            <button key={c} type="button" onClick={() => set("culto", c)}
              className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold"
              style={{ fontFamily: "Inter", background: form.culto === c ? "#000000" : "#FFFFFF", color: form.culto === c ? "#FFFFFF" : "#4D4D4D", border: "1px solid " + (form.culto === c ? "#000000" : "#D6D6D6") }}>
              {c}
            </button>
          ))}
        </div>
        <input value={form.culto} onChange={e => set("culto", e.target.value)} placeholder="Ou digite: Ex: Culto de jovens"
          className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
          style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

        <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Discipulador responsável</label>
        {discipulador ? (
          <button onClick={() => setShowPicker(true)} className="w-full flex items-center gap-3 p-3 rounded-xl mb-4 text-left"
            style={{ background: "#FFFFFF", border: "1px solid #D6D6D6" }}>
            <Avatar name={discipulador.nome} uid={discipulador.uid} photo={discipulador.photo} size={32} fontSize={11} />
            <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] flex-1">{discipulador.nome}</p>
            <button onClick={(e) => { e.stopPropagation(); setDiscipulador(null); }}><X size={14} color="#9E9E9E" /></button>
          </button>
        ) : (
          <button onClick={() => setShowPicker(true)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl mb-4 text-left" style={{ background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#4B7D5C1E" }}>
              <UserCheck size={16} color="#4B7D5C" />
            </div>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[13px]">Escolher entre quem tem conta no app</p>
          </button>
        )}

        {error && <p style={{ fontFamily: "Inter", color: "#B25B4A" }} className="text-[12px] mb-4 text-center">{error}</p>}

        <button onClick={handleSubmit} disabled={saving}
          className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
          style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
          {saving ? "Salvando..." : "Cadastrar"}
        </button>
      </div>
      )}

      {tab === "cadastrados" && (
      <div className="px-6 pb-10">
        {lista.length === 0 ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Ninguém cadastrado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {lista.map(c => {
              const g = grupoDe(c.nome);
              return (
                <button key={c.id} onClick={() => setOpenId(c.id)}
                  className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.nome) }}>
                    <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[12px]">{initials(c.nome)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{c.nome}</p>
                    <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px]">discipulador: {c.discipuladorNome}</p>
                  </div>
                  <span className="text-[9.5px] px-2 py-1 rounded-full shrink-0 text-center"
                    style={{ fontFamily: "Inter", background: g ? "#4B7D5C1E" : "#B25B4A1E", color: g ? "#4B7D5C" : "#B25B4A", maxWidth: 90 }}>
                    {g ? g.tipo : "sem grupo"}
                  </span>
                  <ChevronRight size={16} color="#B5AC9C" />
                </button>
              );
            })}
          </div>
        )}
      </div>
      )}

      {tab === "painel" && (
      <div className="px-6 pb-10">
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: "#000000" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
            <BarChart3 size={19} color="#FFFFFF" />
          </div>
          <div>
            <p style={{ fontFamily: "Fraunces", color: "#FFFFFF", fontWeight: 600 }} className="text-[20px] leading-none">{lista.length}</p>
            <p style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.7)" }} className="text-[11px] mt-1">{lista.length === 1 ? "novo convertido no total" : "novos convertidos no total"}</p>
          </div>
        </div>

        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] font-semibold mb-3">Convertidos por mês</p>
        {porMes.length === 0 ? (
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] mb-6">Nada cadastrado ainda.</p>
        ) : (() => {
          const max = Math.max(1, ...porMes.map(m => m.count));
          const barW = 26, step = 50, padTop = 22, padBottom = 22, plotH = 120;
          const w = Math.max(porMes.length * step + 20, 280);
          const h = padTop + plotH + padBottom;
          const x = (i) => 10 + i * step + step / 2;
          const y = (count) => padTop + plotH - (count / max) * plotH;
          const linePoints = porMes.map((m, i) => `${x(i)},${y(m.count)}`).join(" ");
          return (
            <div className="rounded-2xl p-4 mb-6" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#4B7D5C" }} />
                  <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[10.5px]">Convertidos no mês</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#26482F" }} />
                  <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[10.5px]">Tendência</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <svg width={w} height={h} style={{ minWidth: w }}>
                  {[0, 0.5, 1].map(f => (
                    <line key={f} x1={0} x2={w} y1={padTop + plotH * f} y2={padTop + plotH * f} stroke="#F0EAD9" strokeWidth={1} />
                  ))}
                  {porMes.map((m, i) => (
                    <rect key={m.key} x={x(i) - barW / 2} y={y(m.count)} width={barW} height={Math.max(2, padTop + plotH - y(m.count))} rx={4} fill="#4B7D5C" opacity={0.85} />
                  ))}
                  <polyline points={linePoints} fill="none" stroke="#26482F" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  {porMes.map((m, i) => (
                    <circle key={m.key} cx={x(i)} cy={y(m.count)} r={3.5} fill="#26482F" />
                  ))}
                  {porMes.map((m, i) => (
                    <text key={m.key} x={x(i)} y={h - 4} textAnchor="middle" fontSize={9.5} fontFamily="Inter" fill="#9E9E9E">{m.label}</text>
                  ))}
                  {porMes.map((m, i) => (
                    <text key={m.key} x={x(i)} y={y(m.count) - 8} textAnchor="middle" fontSize={10} fontFamily="IBM Plex Mono" fontWeight={600} fill="#26482F">{m.count}</text>
                  ))}
                </svg>
              </div>
            </div>
          );
        })()}

        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] font-semibold mb-3">Convertidos por culto</p>
        {porCulto.length === 0 ? (
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] mb-6">Nada cadastrado ainda.</p>
        ) : (
          <div className="rounded-2xl p-4 mb-6 flex flex-col gap-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            {porCulto.map(([culto, count]) => {
              const max = porCulto[0][1];
              return (
                <div key={culto}>
                  <div className="flex items-center justify-between mb-1">
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px]">{culto}</p>
                    <p style={{ fontFamily: "IBM Plex Mono", color: "#707070" }} className="text-[11px]">{count}</p>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: "#F2F2F2" }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: "#4B7D5C" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      )}

      {showPicker && (
        <MemberPickerSheet title="Escolher discipulador" onClose={() => setShowPicker(false)}
          onPick={(u) => { setDiscipulador(u); setShowPicker(false); }} />
      )}
    </div>
  );
}

export default NovoConvertidoScreen;
