import React, { useContext, useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Plus, Trash2, UserCheck, X } from "lucide-react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, fmtDateBR, initials } from "../utils/helpers.js";
import MultiMemberPickerSheet from "../components/MultiMemberPickerSheet.jsx";

const CULTOS_SUGERIDOS = ["Domingo Manhã", "Domingo Noite", "Quarta-feira"];
const FUNCOES_SUGERIDAS = ["Som", "Mídia/Transmissão", "Recepção", "Kids", "Louvor", "Estacionamento"];

// Escala de voluntários: cada doc é um culto (data + nome do culto) com funções
// (Som, Kids, etc) e quem foi escalado em cada uma — reaproveita o
// MultiMemberPickerSheet do chat pra escolher várias pessoas de uma vez.
function EscalaScreen({ onBack }) {
  const me = useContext(UserContext);
  const [escalas, setEscalas] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newCulto, setNewCulto] = useState("");
  const [saving, setSaving] = useState(false);
  const [novaFuncao, setNovaFuncao] = useState("");
  const [pickerFuncao, setPickerFuncao] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "escalas"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, snap => {
      setEscalas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  const aberta = escalas.find(e => e.id === openId);
  const souEscalado = (ev) => Object.values(ev.funcoes || {}).some(list => list.some(p => p.uid === me.uid));

  const handleAdd = async () => {
    if (!newDate || !newCulto.trim() || saving) return;
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "escalas"), {
        date: newDate, culto: newCulto.trim(), funcoes: {},
        createdByUid: me.uid, createdByName: me.name, createdAt: serverTimestamp(),
      });
      setNewDate(""); setNewCulto("");
      setShowAdd(false);
      setOpenId(docRef.id);
    } catch (err) {
      console.error("ESCALA_ADD_ERR", err.code, err.message);
    }
    setSaving(false);
  };

  const addFuncao = () => {
    const nome = novaFuncao.trim();
    if (!nome || !aberta || aberta.funcoes?.[nome]) return;
    updateDoc(doc(db, "escalas", aberta.id), { [`funcoes.${nome}`]: [] })
      .catch(err => console.error("ESCALA_FUNCAO_ERR", err.code, err.message));
    setNovaFuncao("");
  };

  const removeFuncao = (funcao) => {
    const rest = { ...(aberta.funcoes || {}) };
    delete rest[funcao];
    updateDoc(doc(db, "escalas", aberta.id), { funcoes: rest })
      .catch(err => console.error("ESCALA_FUNCAO_DEL_ERR", err.code, err.message));
  };

  const assignPeople = (funcao, selected) => {
    const atual = aberta.funcoes?.[funcao] || [];
    const novos = selected.filter(u => !atual.some(p => p.uid === u.uid));
    const novaLista = [...atual, ...novos.map(u => ({ uid: u.uid, name: u.nome }))];
    updateDoc(doc(db, "escalas", aberta.id), { [`funcoes.${funcao}`]: novaLista })
      .catch(err => console.error("ESCALA_ASSIGN_ERR", err.code, err.message));
    novos.forEach(u => {
      if (u.notificacoesAtivas === false) return;
      addDoc(collection(db, "notifications"), {
        toUid: u.uid, read: false, createdAt: serverTimestamp(),
        text: `📋 Você foi escalado(a) para ${funcao} no culto de ${fmtDateBR(aberta.date)} (${aberta.culto}).`,
      }).catch(() => {});
    });
    setPickerFuncao(null);
  };

  const removePerson = (funcao, uid) => {
    const novaLista = (aberta.funcoes?.[funcao] || []).filter(p => p.uid !== uid);
    updateDoc(doc(db, "escalas", aberta.id), { [`funcoes.${funcao}`]: novaLista })
      .catch(err => console.error("ESCALA_REMOVE_ERR", err.code, err.message));
  };

  const removeEscala = async () => {
    if (!aberta) return;
    try {
      await deleteDoc(doc(db, "escalas", aberta.id));
    } catch (err) {
      console.error("ESCALA_DELETE_ERR", err.code, err.message);
    }
    setConfirmDelete(false);
    setOpenId(null);
  };

  if (aberta) {
    const funcoes = Object.entries(aberta.funcoes || {});
    return (
      <div className="flex-1 overflow-y-auto relative" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <button onClick={() => setOpenId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Escala</button>
          {aberta.createdByUid === me.uid && (
            <button onClick={() => setConfirmDelete(true)}><Trash2 size={16} color="#9E9E9E" /></button>
          )}
        </div>
        <div className="px-6 mt-1 mb-5">
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">{aberta.culto}</h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CalendarDays size={12} color="#707070" />
            <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">{fmtDateBR(aberta.date)}</span>
          </div>
        </div>

        <div className="px-6 pb-28 flex flex-col gap-3">
          {funcoes.length === 0 ? (
            <div className="rounded-2xl py-8 text-center" style={{ background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Nenhuma função adicionada ainda.</p>
            </div>
          ) : funcoes.map(([funcao, pessoas]) => (
            <div key={funcao} className="rounded-2xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center justify-between mb-2.5">
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{funcao}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPickerFuncao(funcao)} className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "#0000000F" }}>
                    <Plus size={11} color="#4D4D4D" />
                    <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[10.5px]">Escalar</span>
                  </button>
                  {aberta.createdByUid === me.uid && (
                    <button onClick={() => removeFuncao(funcao)}><X size={14} color="#9E9E9E" /></button>
                  )}
                </div>
              </div>
              {pessoas.length === 0 ? (
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11.5px]">Ninguém escalado ainda.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pessoas.map(p => (
                    <div key={p.uid} className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full" style={{ background: "#5A5A5A1E" }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: colorFor(p.name) }}>
                        <span style={{ fontFamily: "Inter", color: "#F2F2F2", fontSize: 8, fontWeight: 700 }}>{initials(p.name)}</span>
                      </div>
                      <span style={{ fontFamily: "Inter", color: "#000000" }} className="text-[11.5px]">{p.name}</span>
                      {(aberta.createdByUid === me.uid || p.uid === me.uid) && (
                        <button onClick={() => removePerson(funcao, p.uid)}><X size={11} color="#9E9E9E" /></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center gap-2 mt-1">
            <input value={novaFuncao} onChange={e => setNovaFuncao(e.target.value)} placeholder="Nome da função (ex: Som)"
              onKeyDown={e => e.key === "Enter" && addFuncao()}
              className="flex-1 px-4 py-2.5 rounded-xl outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <button onClick={addFuncao} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#000000" }}>
              <Plus size={15} color="#FFFFFF" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {FUNCOES_SUGERIDAS.filter(f => !aberta.funcoes?.[f]).map(f => (
              <button key={f} onClick={() => { setNovaFuncao(""); updateDoc(doc(db, "escalas", aberta.id), { [`funcoes.${f}`]: [] }).catch(() => {}); }}
                className="px-3 py-1.5 rounded-full text-[11px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D", border: "1px solid #D6D6D6" }}>
                + {f}
              </button>
            ))}
          </div>
        </div>

        {pickerFuncao && (
          <MultiMemberPickerSheet
            title={`Escalar para ${pickerFuncao}`}
            confirmLabel="Escalar"
            excludeUids={(aberta.funcoes?.[pickerFuncao] || []).map(p => p.uid)}
            onClose={() => setPickerFuncao(null)}
            onConfirm={(selected) => assignPeople(pickerFuncao, selected)}
          />
        )}

        {confirmDelete && (
          <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setConfirmDelete(false)}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1.5">Excluir essa escala?</p>
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-5">Não dá pra desfazer.</p>
              <div className="flex gap-2.5">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D" }}>Cancelar</button>
                <button onClick={removeEscala} className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Escala de Voluntários</h1>
        <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Quem serve em cada culto — som, mídia, recepção e mais</p>
      </div>

      <div className="px-6 pb-28 flex flex-col gap-3">
        {escalas.length === 0 ? (
          <div className="rounded-2xl py-8 text-center" style={{ background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Nenhuma escala criada ainda.</p>
          </div>
        ) : escalas.map(ev => {
          const totalPessoas = Object.values(ev.funcoes || {}).reduce((s, l) => s + l.length, 0);
          const totalFuncoes = Object.keys(ev.funcoes || {}).length;
          return (
            <button key={ev.id} onClick={() => setOpenId(ev.id)}
              className="rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
              style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[15px]">{ev.culto}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CalendarDays size={11} color="#707070" />
                    <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{fmtDateBR(ev.date)}</span>
                  </div>
                </div>
                <ChevronRight size={16} color="#9E9E9E" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{totalFuncoes} funções · {totalPessoas} escalados</span>
                {souEscalado(ev) && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "#5C6B451A" }}>
                    <UserCheck size={10} color="#5C6B45" />
                    <span style={{ fontFamily: "Inter", color: "#5C6B45", fontWeight: 600 }} className="text-[10px]">Você serve</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={() => setShowAdd(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#2B2B2B", boxShadow: "0 6px 16px rgba(43,43,43,0.4)" }}>
        <Plus size={24} color="#F2F2F2" />
      </button>

      {showAdd && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Nova escala</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Depois de criar, você adiciona as funções e escala as pessoas.</p>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input value={newCulto} onChange={e => setNewCulto(e.target.value)} placeholder="Nome do culto"
              className="w-full px-4 py-3 rounded-xl mb-2 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <div className="flex flex-wrap gap-2 mb-5">
              {CULTOS_SUGERIDOS.map(c => (
                <button key={c} onClick={() => setNewCulto(c)}
                  className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold"
                  style={{ fontFamily: "Inter", background: newCulto === c ? "#000000" : "#FFFFFF", color: newCulto === c ? "#FFFFFF" : "#4D4D4D", border: "1px solid " + (newCulto === c ? "#000000" : "#D6D6D6") }}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={handleAdd} disabled={!newDate || !newCulto.trim() || saving}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: newDate && newCulto.trim() && !saving ? "#000000" : "#E3E3E3", color: newDate && newCulto.trim() && !saving ? "#FFFFFF" : "#9E9E9E", fontFamily: "Inter" }}>
              {saving ? "Criando..." : "Criar escala"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EscalaScreen;
