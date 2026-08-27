import React, { useContext, useEffect, useRef, useState } from "react";
import { Printer, ShieldCheck } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext, UsersDirectoryContext } from "../context/contexts.js";
import { isStaffRole } from "../utils/helpers.js";
import { AGE_GROUPS } from "../data/constants.js";
import { groupIdForAge } from "../data/kidsBadges.js";
import CheckinLabelCard from "../components/CheckinLabelCard.jsx";

// Tela pra ficar sempre aberta no aparelho ligado na impressora termica da
// recepcao. Fica escutando check-ins novos (de qualquer crianca, feitos pelo
// celular do responsavel via QR) e abre a impressao das etiquetas sozinha,
// sem precisar tocar em nada aqui. Pra ficar 100% automatico (sem nem a
// caixinha de impressao aparecer), o Chrome desse aparelho precisa ser aberto
// com a flag --kiosk-printing configurada com o padrao pra impressora certa.
function EstacaoImpressaoScreen({ onBack }) {
  const me = useContext(UserContext);
  const isStaff = isStaffRole(me.role);
  const { byUid, ensureUser } = useContext(UsersDirectoryContext);
  const [printing, setPrinting] = useState(null);
  const seenRef = useRef(new Set());
  const printLabelRef = useRef(null);

  useEffect(() => {
    if (!isStaff) return;
    const unsub = onSnapshot(collection(db, "kids"), snap => {
      snap.docChanges().forEach(change => {
        if (change.type === "removed") return;
        const kid = { id: change.doc.id, ...change.doc.data() };
        if (!kid.checkinActive || !kid.checkinCode) return;
        const key = `${kid.id}_${kid.checkinCode}`;
        if (seenRef.current.has(key)) return;
        const checkinMs = kid.checkinAt?.toMillis?.() || 0;
        if (Date.now() - checkinMs > 20000) { seenRef.current.add(key); return; }
        seenRef.current.add(key);
        setPrinting(kid);
        ensureUser(kid.parentUid);
      });
    }, err => console.error("ESTACAO_LOAD_ERR", err.code, err.message));
    return () => unsub();
  }, [isStaff]);

  useEffect(() => {
    if (!printing) return;
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [printing?.id, printing?.checkinCode]);

  useEffect(() => {
    const after = () => setPrinting(null);
    window.addEventListener("afterprint", after);
    return () => window.removeEventListener("afterprint", after);
  }, []);

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
          <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12.5px] leading-relaxed">Essa área é só pra quem tem cargo Junta ou Liderança.</p>
        </div>
      </div>
    );
  }

  if (printing) {
    const [firstName, ...restName] = (printing.name || "").trim().split(/\s+/);
    const lastName = restName.join(" ");
    const respName = byUid[printing.parentUid]?.nome || "Responsável";
    const [respFirst, ...respRest] = respName.trim().split(/\s+/);
    const respLast = respRest.join(" ");
    const childGroup = AGE_GROUPS.find(g => g.id === groupIdForAge(printing.age));
    const qrValue = `CASA-CHECKIN:${printing.id}:${printing.checkinCode}`;
    return (
      <div className="flex-1 flex flex-col items-center justify-center" style={{ background: "#FFF8EE" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #casa-print-label, #casa-print-label * { visibility: visible; }
            #casa-print-label { position: fixed; top: 0; left: 0; }
            #casa-print-label > *:first-child { break-after: page; page-break-after: always; }
            @page { size: 80mm 30mm; margin: 0; }
          }
        `}</style>
        <p style={{ fontFamily: "Inter", color: "#2FA8A0", fontWeight: 600 }} className="text-[13px] mb-4">Imprimindo etiqueta de {printing.name}...</p>
        <div id="casa-print-label" ref={printLabelRef} className="flex flex-col items-center gap-4">
          <CheckinLabelCard kicker="Criança" nameLeft={firstName} nameRight={lastName} code={printing.checkinCode} qrValue={qrValue}
            groupEmoji={childGroup?.emoji} diet={printing.diet} neuro={printing.neurodivergente}
            footerLeft={`Turma ${childGroup?.label || ""}`} />
          <CheckinLabelCard kicker="Responsável" nameLeft={respFirst} nameRight={respLast} code={printing.checkinCode} qrValue={qrValue}
            groupEmoji={childGroup?.emoji} diet={printing.diet} neuro={printing.neurodivergente}
            footerLeft={`Buscar: ${printing.name}`} />
        </div>
        <button onClick={() => setPrinting(null)} className="mt-6 text-[11px]" style={{ fontFamily: "Inter", color: "#B0A18A" }}>
          Cancelar / voltar a aguardar
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center" style={{ background: "#FFF8EE" }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#2FA8A01E" }}>
        <Printer size={26} color="#2FA8A0" />
      </div>
      <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[17px] mb-2">Estação de impressão</p>
      <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12.5px] leading-relaxed mb-6">
        Deixe essa tela aberta no aparelho ligado na impressora. Assim que alguém fizer check-in escaneando o QR, a etiqueta abre pra impressão aqui automaticamente.
      </p>
      <button onClick={onBack} className="text-[12px]" style={{ fontFamily: "Inter", color: "#2FA8A0" }}>← Sair da estação</button>
    </div>
  );
}

export default EstacaoImpressaoScreen;
