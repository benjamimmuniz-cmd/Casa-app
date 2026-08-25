import React, { useContext, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials, isStaffRole } from "../utils/helpers.js";

// Tela de check-in/check-out de segurança da Área Infantil — separada da tela
// Infantil pra ficar de acesso rápido no menu, como pedido. Mostra todas as
// crianças com check-in ativo (de qualquer família, não só a sua) e confirma
// a saída comparando o código gerado na hora do check-in.
function CheckinScreen({ onBack }) {
  const me = useContext(UserContext);
  const isStaff = isStaffRole(me.role);
  const [checkinList, setCheckinList] = useState(null);
  const [checkinSearch, setCheckinSearch] = useState("");
  const [confirmCheckoutFor, setConfirmCheckoutFor] = useState(null);

  const loadCheckinList = () => {
    setCheckinList(prev => prev === null ? null : prev);
    getDocs(collection(db, "kids")).then(snap => {
      setCheckinList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).catch(err => {
      console.error("KID_CHECKIN_LIST_ERR", err.code, err.message);
      setCheckinList([]);
    });
  };

  useEffect(() => {
    if (isStaff) loadCheckinList();
  }, [isStaff]);

  const confirmCheckout = (childId) => {
    updateDoc(doc(db, "kids", childId), { checkinActive: false, checkinCode: null })
      .then(() => {
        setCheckinList(prev => prev ? prev.map(c => c.id === childId ? { ...c, checkinActive: false, checkinCode: null } : c) : prev);
      })
      .catch(err => console.error("KID_CHECKOUT_ERR", err.code, err.message));
    setConfirmCheckoutFor(null);
  };

  if (!isStaff) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Início</button>
        </div>
        <div className="px-6 mt-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#2FA8A01E" }}>
            <ShieldCheck size={24} color="#2FA8A0" />
          </div>
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[16px] mb-1.5">Acesso restrito</p>
          <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12.5px] leading-relaxed">Essa área é só pra quem tem cargo Junta ou Liderança. Peça pra alguém da liderança liberar seu cargo no Painel de cadastros.</p>
        </div>
      </div>
    );
  }

  const q = checkinSearch.trim().toLowerCase();
  const filtered = (checkinList || []).filter(c => !q || (c.name || "").toLowerCase().includes(q));
  const aguardando = filtered.filter(c => c.checkinActive).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  const semCheckin = filtered.filter(c => !c.checkinActive).sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[22px]">Check-in</h1>
        <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12px] mt-1">Confirme a saída comparando o código com quem for buscar</p>
      </div>

      <div className="px-6 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
          <ShieldCheck size={15} color="#9A8B76" />
          <input value={checkinSearch} onChange={e => setCheckinSearch(e.target.value)} placeholder="Buscar criança por nome"
            className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#3A2E22" }} />
          <button onClick={loadCheckinList} style={{ fontFamily: "Inter", color: "#2FA8A0" }} className="text-[11px] font-semibold shrink-0">Atualizar</button>
        </div>
      </div>

      <div className="px-6 pb-10">
        {checkinList === null ? (
          <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px] text-center py-8">Carregando...</p>
        ) : (
          <>
            <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px] mb-3">Aguardando busca ({aguardando.length})</p>
            {aguardando.length === 0 ? (
              <div className="rounded-2xl p-4 text-center mb-6" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
                <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Ninguém com check-in ativo agora.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 mb-6">
                {aguardando.map(c => (
                  <button key={c.id} onClick={() => setConfirmCheckoutFor(c)}
                    className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                    style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)", border: "1.5px solid #2FA8A055" }}>
                    {c.childPhoto ? (
                      <img src={c.childPhoto} alt={c.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                        <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[12px]">{initials(c.name)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[13px]">{c.name}</p>
                      <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[11px]">{c.age} anos</p>
                    </div>
                    <span style={{ fontFamily: "IBM Plex Mono", color: "#2FA8A0", fontWeight: 700, letterSpacing: 2 }} className="text-[16px]">{c.checkinCode}</span>
                  </button>
                ))}
              </div>
            )}

            <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px] mb-3">Sem check-in ({semCheckin.length})</p>
            {semCheckin.length === 0 ? (
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Nenhuma criança.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {semCheckin.map(c => (
                  <div key={c.id} className="flex items-center gap-3 rounded-2xl p-2.5" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
                    {c.childPhoto ? (
                      <img src={c.childPhoto} alt={c.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                        <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[10px]">{initials(c.name)}</span>
                      </div>
                    )}
                    <p style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[12.5px]">{c.name}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {confirmCheckoutFor && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setConfirmCheckoutFor(null)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#FFF8EE" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[17px] mb-1">Confirmar saída de {confirmCheckoutFor.name}</p>
            <p style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[12.5px] mb-4">Confira se a pessoa que veio buscar sabe o código abaixo antes de confirmar.</p>
            <p style={{ fontFamily: "IBM Plex Mono", color: "#2FA8A0", fontWeight: 700, letterSpacing: 4 }} className="text-[36px] text-center mb-5">{confirmCheckoutFor.checkinCode}</p>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmCheckoutFor(null)} className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#6B6255" }}>Cancelar</button>
              <button onClick={() => confirmCheckout(confirmCheckoutFor.id)} className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#2FA8A0", color: "#FFFFFF" }}>Confirmar saída</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckinScreen;
