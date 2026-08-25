import React, { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

function shuffledOrder(n) {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// "Coloque em ordem" — toca nas cartas na ordem que acha que a história
// aconteceu. No fim compara com a ordem certa. Funciona pra qualquer idade,
// só muda se tem legenda de texto ou não.
function SequenceGame({ set, color, onWin }) {
  const [shuffled, setShuffled] = useState(() => shuffledOrder(set.steps.length));
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setShuffled(shuffledOrder(set.steps.length));
    setPlaced([]);
    setChecked(false);
  }, [set.id]);

  const allPlaced = placed.length === set.steps.length;
  const correct = allPlaced && placed.every((stepIndex, pos) => stepIndex === pos);

  useEffect(() => {
    if (allPlaced && !checked) {
      setChecked(true);
      if (correct) onWin && onWin();
    }
  }, [allPlaced]);

  const tapCard = (stepIndex) => {
    if (allPlaced || placed.includes(stepIndex)) return;
    setPlaced(prev => [...prev, stepIndex]);
  };

  const reset = () => {
    setShuffled(shuffledOrder(set.steps.length));
    setPlaced([]);
    setChecked(false);
  };

  return (
    <div>
      <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[11.5px] text-center mb-4">Toca nas cartas na ordem que a história aconteceu</p>

      <div className="flex items-center justify-center gap-2.5 mb-6">
        {set.steps.map((_, pos) => {
          const stepIndex = placed[pos];
          const step = stepIndex !== undefined ? set.steps[stepIndex] : null;
          const wrong = allPlaced && !correct && stepIndex !== pos;
          return (
            <div key={pos} className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
              style={{
                background: step ? (wrong ? "#FF7A591E" : `${color}1E`) : "#FFFFFF",
                border: step ? "none" : `1px dashed ${color}55`,
                boxShadow: "0 1px 3px rgba(180,140,80,0.1)",
              }}>
              <span style={{ fontFamily: "IBM Plex Mono", color: "#B0A18A", fontSize: 9 }}>{pos + 1}º</span>
              <span style={{ fontSize: 24 }}>{step ? step.emoji : ""}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {shuffled.map(stepIndex => {
          const step = set.steps[stepIndex];
          const used = placed.includes(stepIndex);
          return (
            <button key={stepIndex} onClick={() => tapCard(stepIndex)} disabled={used}
              className="rounded-2xl p-3 flex flex-col items-center gap-1.5 active:scale-[0.95] transition-transform"
              style={{ background: used ? "#FFF8EE" : "#FFFFFF", opacity: used ? 0.3 : 1, boxShadow: used ? "none" : "0 1px 3px rgba(180,140,80,0.1)" }}>
              <span style={{ fontSize: 26 }}>{step.emoji}</span>
              {step.label && <p style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[9.5px] text-center leading-tight">{step.label}</p>}
            </button>
          );
        })}
      </div>

      {allPlaced && (
        <>
          <p className="text-center mb-4" style={{ fontFamily: "Fraunces", fontWeight: 600, color: correct ? "#2FA8A0" : "#8A7F6E" }}>
            {correct ? "Isso mesmo, foi assim que aconteceu! 🎉" : "Quase! Tenta de novo."}
          </p>
          <button onClick={reset}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-full"
            style={{ background: color }}>
            <RotateCcw size={13} color="#FFFFFF" />
            <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[13px] font-semibold">Jogar de novo</span>
          </button>
        </>
      )}
    </div>
  );
}

export default SequenceGame;
