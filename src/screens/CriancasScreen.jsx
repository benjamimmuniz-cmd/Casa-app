import React, { useContext, useEffect, useState } from "react";
import { Heart, Search, ShieldCheck, Users, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials, isStaffRole } from "../utils/helpers.js";

// Diretório de crianças: busca por nome entre TODAS as crianças cadastradas
// (de qualquer família, não só a sua), igual ao Diretório de Membros — pra
// achar rapidinho a ficha de alguém. Acesso restrito à Junta/Liderança, já
// que envolve dados sensíveis de menores (foto, restrição alimentar).
function CriancasScreen({ onBack }) {
  const me = useContext(UserContext);
  const isStaff = isStaffRole(me.role);
  const [kids, setKids] = useState(null);
  const [usersByUid, setUsersByUid] = useState({});
  const [search, setSearch] = useState("");
  const [openKid, setOpenKid] = useState(null);

  useEffect(() => {
    if (!isStaff) return;
    Promise.all([getDocs(collection(db, "kids")), getDocs(collection(db, "users"))])
      .then(([kidsSnap, usersSnap]) => {
        setKids(kidsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const map = {};
        usersSnap.docs.forEach(d => { map[d.id] = d.data(); });
        setUsersByUid(map);
      })
      .catch(err => {
        console.error("CRIANCAS_DIR_ERR", err.code, err.message);
        setKids([]);
      });
  }, [isStaff]);

  if (!isStaff) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        </div>
        <div className="px-6 mt-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#4B7D5C1E" }}>
            <ShieldCheck size={24} color="#4B7D5C" />
          </div>
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1.5">Acesso restrito</p>
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12.5px] leading-relaxed">Essa área é só pra quem tem cargo Junta ou Liderança.</p>
        </div>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = (kids || [])
    .filter(c => !q || (c.name || "").toLowerCase().includes(q))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Crianças</h1>
        <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Todas as crianças cadastradas na Casa</p>
      </div>

      <div className="px-6 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Search size={15} color="#9E9E9E" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome da criança"
            className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#000000" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} color="#9E9E9E" /></button>}
        </div>
      </div>

      <div className="px-6 pb-10">
        {kids === null ? (
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-8">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">
              {search ? "Nenhuma criança encontrada." : "Nenhuma criança cadastrada ainda."}
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] mb-3">{filtered.length} {filtered.length === 1 ? "criança" : "crianças"}</p>
            <div className="flex flex-col gap-2.5">
              {filtered.map(c => (
                <button key={c.id} onClick={() => setOpenKid(c)}
                  className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  {c.childPhoto ? (
                    <img src={c.childPhoto} alt={c.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                      <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[12px]">{initials(c.name)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{c.name}</p>
                    <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">
                      {c.age} anos · resp.: {usersByUid[c.parentUid]?.nome || "—"}
                    </p>
                  </div>
                  {c.checkinActive && (
                    <span className="flex items-center gap-1 text-[9.5px] px-2 py-1 rounded-full shrink-0" style={{ fontFamily: "Inter", background: "#2FA8A01E", color: "#2FA8A0" }}>
                      <ShieldCheck size={10} /> check-in
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {openKid && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setOpenKid(null)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center mb-5">
              {openKid.childPhoto ? (
                <img src={openKid.childPhoto} alt={openKid.name} className="w-20 h-20 rounded-full object-cover mb-3" style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }} />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: colorFor(openKid.name) }}>
                  <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[22px]">{initials(openKid.name)}</span>
                </div>
              )}
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[18px]">{openKid.name}</p>
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] mt-0.5">{openKid.age} anos</p>
            </div>
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#7C6CE81E" }}>
                  <Users size={15} color="#7C6CE8" />
                </div>
                <div>
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">Responsável</p>
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{usersByUid[openKid.parentUid]?.nome || "Não encontrado"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3" style={{ borderTop: "1px solid #F0EAD9", paddingTop: 12 }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FF7A591E" }}>
                  <Heart size={15} color="#FF7A59" />
                </div>
                <div>
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">Restrição alimentar</p>
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{openKid.diet || "Nenhuma informada"}</p>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #F0EAD9", paddingTop: 12 }}>
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">Frequência</p>
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">
                  {(openKid.attendance || []).length} {(openKid.attendance || []).length === 1 ? "presença registrada" : "presenças registradas"}
                </p>
              </div>
              {openKid.checkinActive && (
                <div style={{ borderTop: "1px solid #F0EAD9", paddingTop: 12 }}>
                  <p style={{ fontFamily: "Inter", color: "#2FA8A0", fontWeight: 600 }} className="text-[12.5px]">✓ Check-in ativo agora</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CriancasScreen;
