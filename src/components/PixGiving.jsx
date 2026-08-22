import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { PIX_KEY, PIX_KEY_LABEL, PIX_BANK_NAME, PIX_RECEIVER_NAME, PIX_RECEIVER_CITY } from "../data/constants.js";
import { buildPixPayload } from "../utils/pix.js";

function PixGiving() {
  const [copied, setCopied] = useState(false);
  const payload = buildPixPayload({ key: PIX_KEY, name: PIX_RECEIVER_NAME, city: PIX_RECEIVER_CITY });

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="rounded-3xl p-5 flex flex-col items-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="p-3 rounded-2xl mb-4" style={{ background: "#FFFFFF", border: "1px solid #E8E8E8" }}>
        <QRCodeSVG value={payload} size={168} bgColor="#FFFFFF" fgColor="#000000" level="M" />
      </div>
      <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] text-center mb-1">
        Escaneie com o app do seu banco, ou copie a chave abaixo
      </p>
      <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[15px]">
        {PIX_RECEIVER_NAME}
      </p>
      <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11.5px] mb-3">
        {PIX_BANK_NAME}
      </p>

      <div className="w-full rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "#F2F2F2" }}>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10px] uppercase tracking-wide">Chave Pix ({PIX_KEY_LABEL})</p>
          <p style={{ fontFamily: "IBM Plex Mono", color: "#000000" }} className="text-[13px] truncate mt-0.5">{PIX_KEY}</p>
        </div>
        <button onClick={copyKey} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: copied ? "#5C6B45" : "#000000" }}>
          {copied ? <Check size={15} color="#FFFFFF" /> : <Copy size={15} color="#FFFFFF" />}
        </button>
      </div>
      {copied && (
        <p style={{ fontFamily: "Inter", color: "#5C6B45" }} className="text-[11.5px] mt-2">Código Pix copiado!</p>
      )}
    </div>
  );
}

export default PixGiving;
