import React, { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

// Verdadeiro ou Falso — afirmação rápida sobre uma história bíblica, a
// criança decide se é verdade ou mentira. Pensado pra 6-12 anos.
function TrueFalseGame({ item, color, onCorrect }) {
  const [picked, setPicked] = useState(null);
  useEffect(() => { setPicked(null); }, [item.id]);
  const showResult = picked !== null;
  const isCorrectPick = picked === item.answer;

  const pick = (value) => {
    if (picked !== null) return;
    setPicked(value);
    if (value === item.answer) onCorrect && onCorrect();
  };

  return (
    <div>
      <p style={{ fontFamily: "Fraunces", color: "#3A2E22" }} className="text-[16px] leading-relaxed text-center mb-8">{item.statement}</p>

      <div className="flex gap-3">
        <button onClick={() => pick(true)}
          className="flex-1 py-5 rounded-2xl flex flex-col items-center gap-1.5"
          style={{
            background: !showResult ? "#FFFFFF" : item.answer === true ? "#2FA8A01E" : (picked === true ? "#FF7A591E" : "#FFFFFF"),
            border: !showResult ? `1px solid ${color}33` : item.answer === true ? "1px solid #2FA8A0" : (picked === true ? "1px solid #FF7A59" : `1px solid ${color}33`),
          }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <span style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 700 }} className="text-[13px]">Verdadeiro</span>
        </button>
        <button onClick={() => pick(false)}
          className="flex-1 py-5 rounded-2xl flex flex-col items-center gap-1.5"
          style={{
            background: !showResult ? "#FFFFFF" : item.answer === false ? "#2FA8A01E" : (picked === false ? "#FF7A591E" : "#FFFFFF"),
            border: !showResult ? `1px solid ${color}33` : item.answer === false ? "1px solid #2FA8A0" : (picked === false ? "1px solid #FF7A59" : `1px solid ${color}33`),
          }}>
          <span style={{ fontSize: 24 }}>❌</span>
          <span style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 700 }} className="text-[13px]">Falso</span>
        </button>
      </div>

      {showResult && (
        <>
          <p className="text-center mt-5 mb-3" style={{ fontFamily: "Inter", color: isCorrectPick ? "#1D7A72" : "#8A7F6E" }}>
            {isCorrectPick ? "Acertou! 🎉" : `Essa era ${item.answer ? "verdadeira" : "falsa"}.`}
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

export default TrueFalseGame;
