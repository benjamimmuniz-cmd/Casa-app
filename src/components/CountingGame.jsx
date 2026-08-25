import React, { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

// Jogo de contar pra 3-5 anos — mostra um bando de figurinhas e a criança
// toca no número certo. Sem palavras pra ler, só contar e apontar.
function CountingGame({ item, color, onCorrect }) {
  const [picked, setPicked] = useState(null);
  useEffect(() => { setPicked(null); }, [item.id]);
  const showResult = picked !== null;
  const isCorrectPick = picked === item.count;

  const pick = (n) => {
    if (picked !== null) return;
    setPicked(n);
    if (n === item.count) onCorrect && onCorrect();
  };

  return (
    <div>
      <p style={{ fontFamily: "Fraunces", color: "#3A2E22" }} className="text-[15px] leading-relaxed text-center mb-5">{item.prompt}</p>

      <div className="flex flex-wrap justify-center gap-3 mb-6 px-4 py-5 rounded-2xl" style={{ background: `${color}14` }}>
        {Array.from({ length: item.count }).map((_, i) => (
          <span key={i} style={{ fontSize: 34 }}>{item.emoji}</span>
        ))}
      </div>

      <div className="flex gap-2.5 justify-center">
        {item.choices.map(n => {
          const isCorrect = n === item.count;
          const isPicked = picked === n;
          const bg = !showResult ? "#FFFFFF" : isCorrect ? "#2FA8A01E" : isPicked ? "#FF7A591E" : "#FFFFFF";
          const border = !showResult ? `1px solid ${color}33` : isCorrect ? "1px solid #2FA8A0" : isPicked ? "1px solid #FF7A59" : `1px solid ${color}33`;
          return (
            <button key={n} onClick={() => pick(n)}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-[24px] font-bold"
              style={{ fontFamily: "IBM Plex Mono", background: bg, border, color: "#3A2E22", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
              {n}
            </button>
          );
        })}
      </div>

      {showResult && (
        <>
          <p className="text-center mt-5 mb-3" style={{ fontFamily: "Inter", color: isCorrectPick ? "#1D7A72" : "#8A7F6E" }}>
            {isCorrectPick ? "Isso mesmo, contou certinho! 🎉" : `Quase! Eram ${item.count}.`}
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

export default CountingGame;
