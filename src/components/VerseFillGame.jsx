import React, { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";

// Completar o versículo: escolher a palavra certa entre 3 opções — pensado
// pra 6-12 anos, ensina e testa memorização sem ser uma folha de colorir.
function VerseFillGame({ item, color }) {
  const [picked, setPicked] = useState(null);
  useEffect(() => { setPicked(null); }, [item.id]);
  const showResult = picked !== null;
  const isCorrectPick = picked === item.blank;

  return (
    <div>
      <p style={{ fontFamily: "IBM Plex Mono", color }} className="text-[11px] mb-3 text-center">{item.reference}</p>
      <p style={{ fontFamily: "Fraunces", color: "#3A2E22" }} className="text-[16px] leading-relaxed text-center mb-6">
        {item.before}{" "}
        <span style={{ color, fontWeight: 700 }}>{showResult ? item.blank : "___"}</span>
        {item.after}
      </p>
      <div className="flex flex-col gap-2">
        {item.options.map((opt, i) => {
          const isCorrect = opt === item.blank;
          const isPicked = picked === opt;
          const bg = !showResult ? "#FFFFFF" : isCorrect ? "#2FA8A01E" : isPicked ? "#FF7A591E" : "#FFFFFF";
          const border = !showResult ? "1px solid transparent" : isCorrect ? "1px solid #2FA8A0" : isPicked ? "1px solid #FF7A59" : "1px solid transparent";
          return (
            <button key={i} onClick={() => picked === null && setPicked(opt)}
              className="text-left px-4 py-3 rounded-xl text-[13px] font-semibold flex items-center justify-between"
              style={{ fontFamily: "Inter", background: bg, border, boxShadow: "0 1px 3px rgba(180,140,80,0.1)", color: "#3A2E22" }}>
              {opt}
              {showResult && isCorrect && <span>✓</span>}
              {showResult && isPicked && !isCorrect && <span>✗</span>}
            </button>
          );
        })}
      </div>
      {showResult && (
        <>
          <p className="text-center mt-4 mb-3" style={{ fontFamily: "Inter", color: isCorrectPick ? "#1D7A72" : "#8A7F6E" }}>
            {isCorrectPick ? "Show de bola, acertou! 🎉" : "Quase! A resposta certa tá marcada com ✓"}
          </p>
          <button onClick={() => setPicked(null)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full"
            style={{ background: color }}>
            <RotateCcw size={13} color="#FFFFFF" />
            <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[12.5px] font-semibold">Tentar de novo</span>
          </button>
        </>
      )}
    </div>
  );
}

export default VerseFillGame;
