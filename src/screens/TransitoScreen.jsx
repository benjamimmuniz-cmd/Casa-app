import React, { useContext, useEffect, useState } from "react";
import { Car, Search, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import Avatar from "../components/Avatar.jsx";

// Trânsito: lista todos os membros com carro cadastrado e sua placa, pra
// achar rapidinho o dono quando precisar no estacionamento — busca todo mundo
// uma vez só (nao fica um listener ligado o tempo todo, pra nao pesar no
// Firestore), igual a tela de Aniversariantes.
function TransitoScreen({ onBack }) {
  const me = useContext(UserContext);
  const [members, setMembers] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      setMembers(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.possuiCarro));
    }).catch(err => {
      console.error("TRANSITO_ERR", err.code, err.message);
      setMembers([]);
    });
  }, []);

  const filtered = (members || [])
    .filter(u => {
      const q = search.trim().toUpperCase();
      if (!q) return true;
      return (u.nome || "").toUpperCase().includes(q) || (u.placa || "").toUpperCase().includes(q);
    })
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Trânsito</h1>
        <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Carros cadastrados e seus responsáveis</p>
      </div>

      <div className="px-6 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Search size={15} color="#9E9E9E" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou placa"
            className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#000000" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} color="#9E9E9E" /></button>}
        </div>
      </div>

      <div className="px-6 pb-10">
        {members === null ? (
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">
              {search ? "Nenhum carro encontrado com essa busca." : "Ninguém cadastrou um carro ainda."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map(u => (
              <div key={u.uid} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Avatar name={u.nome} uid={u.uid} size={40} fontSize={12} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">
                    {u.nome} {u.uid === me.uid && <span style={{ color: "#9E9E9E", fontWeight: 400 }}>(você)</span>}
                  </p>
                  {!u.placa && (
                    <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px]">Placa não informada</p>
                  )}
                </div>
                {u.placa && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0" style={{ background: "#3B6D8A1E" }}>
                    <Car size={12} color="#3B6D8A" />
                    <span style={{ fontFamily: "IBM Plex Mono", color: "#3B6D8A", fontWeight: 700 }} className="text-[12px]">{u.placa}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransitoScreen;
