import React from "react";
import { QRCodeSVG } from "qrcode.react";

// Etiqueta de check-in pra impressora térmica de 50x30mm (bobina segmentada).
// Layout compacto lado a lado: QR grande à esquerda (pra escanear fácil na
// saída), nome/código/turma à direita. Medidas em mm pra bater exatamente
// com o tamanho físico do rolo, tanto na prévia quanto na impressão.
function CheckinLabelCard({ kicker, nameLeft, nameRight, code, qrValue, groupEmoji, diet, neuro, footerLeft }) {
  const name = [nameLeft, nameRight].filter(Boolean).join(" ") || "—";
  return (
    <div className="flex items-stretch overflow-hidden"
      style={{ width: "50mm", height: "30mm", background: "#FFFFFF", border: "0.3mm solid #3A2E22", borderRadius: "1mm", padding: "1.2mm", boxSizing: "border-box", gap: "1.5mm" }}>
      <div className="shrink-0 flex items-center justify-center" style={{ width: "20mm" }}>
        <QRCodeSVG value={qrValue} size={512} bgColor="#FFFFFF" fgColor="#3A2E22" level="M" style={{ width: "100%", height: "100%" }} />
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center" style={{ gap: "0.5mm" }}>
        <p style={{ fontFamily: "Inter", color: "#B0A18A", fontWeight: 700, fontSize: "2mm", lineHeight: 1.1 }} className="uppercase truncate">{kicker}</p>
        <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 800, fontSize: "3mm", lineHeight: 1.15 }} className="uppercase truncate">{name}</p>
        <p style={{ fontFamily: "IBM Plex Mono", color: "#3A2E22", fontWeight: 800, fontSize: "4.2mm", lineHeight: 1.1, letterSpacing: "0.3mm" }}>{code}</p>
        <div className="flex items-center truncate" style={{ gap: "1mm" }}>
          {groupEmoji && <span style={{ fontSize: "3mm", lineHeight: 1 }}>{groupEmoji}</span>}
          <span style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600, fontSize: "2mm", lineHeight: 1.1 }} className="truncate">{footerLeft}</span>
        </div>
        {(diet || neuro) && (
          <p style={{ fontFamily: "Inter", color: "#B33B3B", fontWeight: 700, fontSize: "1.9mm", lineHeight: 1.1 }} className="truncate">
            {diet ? `⚠ ${diet}` : ""}{diet && neuro ? " · " : ""}{neuro ? "💙 Neurodivergente" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export default CheckinLabelCard;
