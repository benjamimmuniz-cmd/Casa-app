import React, { useContext, useEffect, useState } from "react";
import { Cake, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import Avatar from "../components/Avatar.jsx";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Aniversariantes: busca todos os membros com conta (mesma coleção "users")
// uma vez só (nao fica um listener ligado o tempo todo, pra nao pesar no
// Firestore) e separa por mes de nascimento.
function AniversariantesScreen({ onBack }) {
  const me = useContext(UserContext);
  const [members, setMembers] = useState(null);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      setMembers(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.nascimento));
    }).catch(err => {
      console.error("ANIVERSARIANTES_ERR", err.code, err.message);
      setMembers([]);
    });
  }, []);

  const doMes = (members || [])
    .map(u => {
      const [, month, day] = u.nascimento.split("-").map(Number);
      return { ...u, month: month - 1, day };
    })
    .filter(u => u.month === viewMonth)
    .sort((a, b) => a.day - b.day);

  const isHoje = (u) => viewMonth === today.getMonth() && u.day === today.getDate();

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Aniversariantes</h1>
        <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Quem faz aniversário este mês na Casa</p>
      </div>

      <div className="mx-6 mb-5 rounded-2xl p-3 flex items-center justify-between" style={{ background: "#000000" }}>
        <button onClick={() => setViewMonth(m => (m + 11) % 12)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
          <ChevronLeft size={16} color="#FFFFFF" />
        </button>
        <div className="flex items-center gap-2">
          <Cake size={16} color="#FFFFFF" />
          <p style={{ fontFamily: "Fraunces", color: "#FFFFFF", fontWeight: 600 }} className="text-[15px]">{MESES[viewMonth]}</p>
        </div>
        <button onClick={() => setViewMonth(m => (m + 1) % 12)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
          <ChevronRight size={16} color="#FFFFFF" />
        </button>
      </div>

      <div className="px-6 pb-10">
        {members === null ? (
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-8">Carregando...</p>
        ) : doMes.length === 0 ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Ninguém faz aniversário em {MESES[viewMonth].toLowerCase()}.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {doMes.map(u => {
              const hoje = isHoje(u);
              return (
                <div key={u.uid} className="flex items-center gap-3 rounded-2xl p-3"
                  style={{ background: hoje ? "#F3D18A33" : "#FFFFFF", border: hoje ? "1px solid #D9A441" : "none", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <Avatar name={u.nome} uid={u.uid} size={40} fontSize={12} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">
                      {u.nome} {u.uid === me.uid && <span style={{ color: "#9E9E9E", fontWeight: 400 }}>(você)</span>}
                    </p>
                    <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px]">dia {String(u.day).padStart(2, "0")}</p>
                  </div>
                  {hoje && (
                    <span className="flex items-center gap-1 text-[10.5px] px-2.5 py-1.5 rounded-full shrink-0" style={{ fontFamily: "Inter", background: "#D9A441", color: "#FFFFFF" }}>
                      <PartyPopper size={11} /> Hoje!
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AniversariantesScreen;
