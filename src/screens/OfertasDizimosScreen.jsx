import React from "react";
import { HandCoins } from "lucide-react";
import PixGiving from "../components/PixGiving.jsx";

function OfertasDizimosScreen({ onBack }) {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#8A6D3B1E" }}>
          <HandCoins size={20} color="#8A6D3B" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">Generosidade e Dízimos</h1>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mt-0.5">Semeie com um coração alegre</p>
        </div>
      </div>

      <div className="px-6 mb-5">
        <p style={{ fontFamily: "Fraunces", fontStyle: "italic", color: "#4D4D4D" }} className="text-[14px] leading-relaxed">
          "Cada um contribua segundo propôs no seu coração, não com tristeza ou por obrigação; porque Deus ama ao que dá com alegria."
        </p>
        <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] mt-1">2 Coríntios 9:7</p>
      </div>

      <div className="px-6 pb-10">
        <PixGiving />
        <div className="rounded-2xl px-4 py-3 mt-4 flex items-start gap-2.5" style={{ background: "#8A6D3B14" }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <p style={{ fontFamily: "Inter", color: "#6B551F" }} className="text-[12px] leading-relaxed">
            Por gentileza, coloque na descrição do Pix se a contribuição é referente ao <b>dízimo</b> ou à <b>generosidade</b>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OfertasDizimosScreen;
