import React, { useContext, useEffect, useState } from "react";
import { QrCode, ShieldCheck, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials, isStaffRole, todayLabel } from "../utils/helpers.js";

// Check-in de presenca da congregacao (nao so das criancas): a equipe mostra
// o QR nessa tela (numa TV/tablet na entrada), cada pessoa escaneia com o
// proprio celular e a presenca dela e marcada na hora — sem precisar de
// ninguem escaneando pelos outros.
function PresencaScreen({ onBack }) {
  const me = useContext(UserContext);
  const isStaff = isStaffRole(me.role);
  const [today, setToday] = useState([]);
  const todayL = todayLabel();
  const qrUrl = `${window.location.origin}/?presenca=1`;

  useEffect(() => {
    if (!isStaff) return;
    const unsub = onSnapshot(query(collection(db, "presencas"), where("dateLabel", "==", todayL)), snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.at?.toMillis?.() || 0) - (a.at?.toMillis?.() || 0));
      setToday(list);
    }, err => console.error("PRESENCA_LOAD_ERR", err.code, err.message));
    return () => unsub();
  }, [isStaff, todayL]);

  if (!isStaff) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        </div>
        <div className="px-6 mt-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#8A8A8A1E" }}>
            <ShieldCheck size={24} color="#8A8A8A" />
          </div>
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1.5">Acesso restrito</p>
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12.5px] leading-relaxed">Essa área é só pra quem tem cargo Junta ou Liderança.</p>
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
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Presença</h1>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-1">Mostre esse QR na entrada — cada pessoa escaneia com o próprio celular pra marcar presença</p>
      </div>

      <div className="mx-6 mb-6 rounded-3xl p-6 flex flex-col items-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="p-4 rounded-2xl mb-3" style={{ background: "#FFFFFF", border: "1px solid #E3E3E3" }}>
          <QRCodeSVG value={qrUrl} size={190} bgColor="#FFFFFF" fgColor="#000000" level="M" />
        </div>
        <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] flex items-center gap-1.5">
          <QrCode size={12} /> Cada pessoa precisa estar logada no app
        </p>
      </div>

      <div className="px-6 pb-10">
        <p style={{ fontFamily: "Inter", color: "#4D4D4D", fontWeight: 600 }} className="text-[12px] mb-3 flex items-center gap-1.5">
          <Users size={13} /> Presentes hoje ({today.length})
        </p>
        {today.length === 0 ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Ninguém marcou presença ainda hoje.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {today.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(p.name) }}>
                  <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[10.5px]">{initials(p.name)}</span>
                </div>
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] flex-1">{p.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PresencaScreen;
