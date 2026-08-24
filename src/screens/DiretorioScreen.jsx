import React, { useContext, useEffect, useState } from "react";
import { ChevronRight, Search, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { ProfileNavContext, UserContext } from "../context/contexts.js";
import Avatar from "../components/Avatar.jsx";

// Diretório de Membros: lista todo mundo com conta na igreja, buscável por
// nome, pra achar o contato ou profissão de alguém sem precisar já ser amigo
// dela — busca uma vez só (nao fica um listener ligado o tempo todo).
function DiretorioScreen({ onBack }) {
  const me = useContext(UserContext);
  const { openProfile } = useContext(ProfileNavContext);
  const [members, setMembers] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      setMembers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    }).catch(err => {
      console.error("DIRETORIO_ERR", err.code, err.message);
      setMembers([]);
    });
  }, []);

  const filtered = (members || [])
    .filter(u => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (u.nome || "").toLowerCase().includes(q) || (u.profissao || "").toLowerCase().includes(q);
    })
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Diretório de Membros</h1>
        <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Todo mundo cadastrado na Casa</p>
      </div>

      <div className="px-6 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Search size={15} color="#9E9E9E" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou profissão"
            className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#000000" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} color="#9E9E9E" /></button>}
        </div>
      </div>

      <div className="px-6 pb-10">
        {members === null ? (
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Nenhum membro encontrado.</p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] mb-3">{filtered.length} {filtered.length === 1 ? "membro" : "membros"}</p>
            <div className="flex flex-col gap-2.5">
              {filtered.map(u => (
                <button key={u.uid} onClick={() => openProfile(u.uid)}
                  className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <Avatar name={u.nome} uid={u.uid} size={40} fontSize={12} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">
                      {u.nome || "Sem nome"} {u.uid === me.uid && <span style={{ color: "#9E9E9E", fontWeight: 400 }}>(você)</span>}
                    </p>
                    <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">{u.profissao || "—"}</p>
                  </div>
                  <ChevronRight size={16} color="#D8CBB4" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DiretorioScreen;
