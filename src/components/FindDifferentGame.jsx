import React, { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

const GRID_SIZE = 9;

function randomDifferentIndex() {
  return Math.floor(Math.random() * GRID_SIZE);
}

// "Encontre a diferente" pra 3-5 anos — um grid de figurinhas iguais com uma
// diferente escondida no meio. Toca na diferente e ganha. Sem ler nada.
function FindDifferentGame({ set, color, onWin }) {
  const [differentIndex, setDifferentIndex] = useState(randomDifferentIndex);
  const [found, setFound] = useState(false);
  const [missedIndex, setMissedIndex] = useState(null);

  useEffect(() => {
    setDifferentIndex(randomDifferentIndex());
    setFound(false);
    setMissedIndex(null);
  }, [set.id]);

  const tap = (i) => {
    if (found) return;
    if (i === differentIndex) {
      setFound(true);
      onWin && onWin();
    } else {
      setMissedIndex(i);
      setTimeout(() => setMissedIndex(null), 400);
    }
  };

  const reset = () => {
    setDifferentIndex(randomDifferentIndex());
    setFound(false);
    setMissedIndex(null);
  };

  return (
    <div>
      <p style={{ fontFamily: "Fraunces", color: "#3A2E22" }} className="text-[15px] leading-relaxed text-center mb-5">{set.prompt}</p>

      <div className="grid grid-cols-3 gap-2.5 mb-6 p-4 rounded-2xl" style={{ background: `${color}14` }}>
        {Array.from({ length: GRID_SIZE }).map((_, i) => {
          const isDifferent = i === differentIndex;
          const reveal = found && isDifferent;
          return (
            <button key={i} onClick={() => tap(i)} disabled={found}
              className="aspect-square rounded-2xl flex items-center justify-center active:scale-[0.9] transition-transform"
              style={{
                background: reveal ? "#2FA8A01E" : missedIndex === i ? "#FF7A591E" : "#FFFFFF",
                boxShadow: "0 1px 3px rgba(180,140,80,0.1)",
              }}>
              <span style={{ fontSize: 30 }}>{isDifferent ? set.different : set.same}</span>
            </button>
          );
        })}
      </div>

      {found && (
        <>
          <p className="text-center mb-4" style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#2FA8A0" }}>
            Você encontrou! 🎉
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

export default FindDifferentGame;
