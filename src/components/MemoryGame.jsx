import React, { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

function shuffledDeck(pieces) {
  const deck = [...pieces, ...pieces].map((piece, i) => ({ cardId: `${piece}-${i}`, piece }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Jogo da memória pra 3-5 anos — vira duas cartas, se as figurinhas forem
// iguais elas ficam reveladas. Não precisa saber ler, só reconhecer emoji.
function MemoryGame({ set, color, onWin }) {
  const [deck, setDeck] = useState(() => shuffledDeck(set.pieces));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setDeck(shuffledDeck(set.pieces));
    setFlipped([]);
    setMatched([]);
    setLocked(false);
  }, [set.id]);

  const won = matched.length === deck.length && deck.length > 0;

  useEffect(() => {
    if (won) onWin && onWin();
  }, [won]);

  const flipCard = (i) => {
    if (locked || flipped.includes(i) || matched.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setLocked(true);
      const [a, b] = next;
      if (deck[a].piece === deck[b].piece) {
        setTimeout(() => {
          setMatched(prev => [...prev, a, b]);
          setFlipped([]);
          setLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 800);
      }
    }
  };

  const reset = () => {
    setDeck(shuffledDeck(set.pieces));
    setFlipped([]);
    setMatched([]);
    setLocked(false);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {deck.map((card, i) => {
          const up = flipped.includes(i) || matched.includes(i);
          return (
            <button key={card.cardId} onClick={() => flipCard(i)} disabled={up}
              className="aspect-square rounded-2xl flex items-center justify-center active:scale-[0.95] transition-transform"
              style={{
                background: matched.includes(i) ? `${color}1E` : up ? "#FFFFFF" : color,
                boxShadow: up ? "0 1px 3px rgba(180,140,80,0.12)" : "none",
              }}>
              <span style={{ fontSize: 28, opacity: up ? 1 : 0 }}>{card.piece}</span>
            </button>
          );
        })}
      </div>

      {won && (
        <>
          <p className="text-center mb-4" style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#2FA8A0" }}>
            Você encontrou todos os pares! 🎉
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

export default MemoryGame;
