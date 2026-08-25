import React from "react";
import { QRCodeSVG } from "qrcode.react";

// Cartela de check-in no formato "etiqueta de recepção de kids", com nome
// (separado em dois campos, como em etiquetas reais), código, QR e rodapé —
// a mesma cartela serve pra criança e pra quem for buscar (responsável),
// só trocando os textos. Usada em InfantilScreen (Meus Filhos) e onde mais
// precisar imprimir a etiqueta.
function CheckinLabelCard({ kicker, nameLeft, nameRight, code, qrValue, groupEmoji, diet, neuro, footerLeft, dateLabel, timeLabel }) {
  return (
    <div className="overflow-hidden" style={{ width: 320, background: "#FFFFFF", border: "2px solid #3A2E22", borderRadius: 10 }}>
      <div className="flex items-stretch justify-between px-3 pt-2.5 pb-2" style={{ borderBottom: "1px dashed #C9BBA0" }}>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "Inter", color: "#B0A18A", fontWeight: 700, letterSpacing: 0.5 }} className="text-[8.5px] uppercase mb-0.5">{kicker}</p>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 800 }} className="text-[15px] uppercase truncate">{nameLeft || "—"}</span>
            <span style={{ color: "#C9BBA0" }} className="text-[11px] shrink-0">┊</span>
            <span style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[11px] uppercase truncate">{nameRight || ""}</span>
          </div>
        </div>
        <div className="p-1 rounded-lg shrink-0 ml-2" style={{ background: "#FFFFFF", border: "1px solid #E8DCC4" }}>
          <QRCodeSVG value={qrValue} size={54} bgColor="#FFFFFF" fgColor="#3A2E22" level="M" />
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <p style={{ fontFamily: "IBM Plex Mono", color: "#3A2E22", fontWeight: 800, letterSpacing: 2 }} className="text-[26px]">{code}</p>
          {groupEmoji && <span style={{ fontSize: 19 }} title="Turma">{groupEmoji}</span>}
        </div>
        {diet && (
          <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[10px] mt-0.5 leading-snug">Restrição: {diet}</p>
        )}
        {neuro && (
          <p style={{ fontFamily: "Inter", color: "#5A4BC7" }} className="text-[10px] mt-0.5 leading-snug">Neurodivergente</p>
        )}
      </div>
      <div className="flex items-center justify-between px-3 py-2" style={{ background: "#3A2E22" }}>
        <span style={{ fontFamily: "Inter", color: "#FFFFFF", fontWeight: 700, letterSpacing: 0.5 }} className="text-[9.5px] uppercase truncate">{footerLeft}</span>
        <span style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.75)" }} className="text-[9.5px] shrink-0 ml-2 text-right">{dateLabel}{timeLabel ? ` · ${timeLabel}` : ""}</span>
      </div>
    </div>
  );
}

export default CheckinLabelCard;
