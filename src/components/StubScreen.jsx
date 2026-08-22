import React, { useState, useEffect, useContext, createContext } from "react";
import { BookOpen } from "lucide-react";
import { TAB_DESCRIPTIONS, TAB_LABELS, TILES } from "../data/constants.js";

function StubScreen({ tabId, onBack }) {
  const Icon = TILES.find(t => t.id === tabId)?.icon || BookOpen;
  const color = TILES.find(t => t.id === tabId)?.color || "#2B2B2B";
  return (
    <div className="flex-1 flex flex-col px-6 pt-6" style={{ background: "#F2F2F2" }}>
      <button onClick={onBack} className="text-[13px] mb-8 flex items-center gap-1" style={{ fontFamily: "Inter", color: "#616161" }}>
        ← Início
      </button>
      <div className="flex flex-col items-center text-center gap-5 mt-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: color + "22" }}>
          <Icon size={28} color={color} />
        </div>
        <h2 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">
          {TAB_LABELS[tabId]}
        </h2>
        <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[13px] leading-relaxed max-w-[260px]">
          {TAB_DESCRIPTIONS[tabId]}
        </p>
        <span className="text-[11px] px-3 py-1 rounded-full mt-2" style={{ fontFamily: "IBM Plex Mono", background: "#000000", color: "#FFFFFF" }}>
          próxima etapa do protótipo
        </span>
      </div>
    </div>
  );
}

// Textos ilustrativos para o protótipo (paráfrase própria, não é uma tradução específica)

export default StubScreen;
