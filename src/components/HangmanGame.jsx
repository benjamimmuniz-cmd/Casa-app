import React, { useState, useEffect } from "react";
import { Lightbulb, RotateCcw } from "lucide-react";

const MAX_LIVES = 6;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DIACRITICS = new RegExp("[̀-ͯ]", "g");
const normalize = (s) => s.normalize("NFD").replace(DIACRITICS, "").toUpperCase();

// Jogo da forca com palavras/temas bíblicos — pensado pra 6-12 anos, que já
// acham a folha de colorir muito infantil. Vidas em coraçãozinho em vez do
// bonequinho da forca clássica.
function HangmanGame({ item, color, onWin }) {
  const target = normalize(item.word);
  const [guessed, setGuessed] = useState([]);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => { setGuessed([]); setShowHint(false); }, [item.id]);

  const wrongGuesses = guessed.filter(l => !target.includes(l));
  const lives = MAX_LIVES - wrongGuesses.length;
  const won = target.split("").every(ch => guessed.includes(ch));
  const lost = lives <= 0;
  const over = won || lost;

  const guess = (letter) => {
    if (over || guessed.includes(letter)) return;
    const next = [...guessed, letter];
    setGuessed(next);
    if (target.split("").every(ch => next.includes(ch))) onWin && onWin();
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-1.5 mb-5">
        {Array.from({ length: MAX_LIVES }).map((_, i) => (
          <span key={i} style={{ fontSize: 19, opacity: i < lives ? 1 : 0.15 }}>❤️</span>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {target.split("").map((ch, i) => (
          <div key={i} className="flex items-center justify-center text-[20px] font-bold"
            style={{ width: 28, height: 38, fontFamily: "IBM Plex Mono",
              borderBottom: `3px solid ${color}`, color: "#3A2E22" }}>
            {(guessed.includes(ch) || over) ? ch : ""}
          </div>
        ))}
      </div>

      {over && (
        <>
          <p className="text-center mb-4" style={{ fontFamily: "Fraunces", fontWeight: 600, color: won ? "#2FA8A0" : "#C24C33" }}>
            {won ? "Você acertou! 🎉" : `Não foi dessa vez! A palavra era ${target}`}
          </p>
          <button onClick={() => { setGuessed([]); setShowHint(false); }}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-full mb-3"
            style={{ background: color }}>
            <RotateCcw size={13} color="#FFFFFF" />
            <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[13px] font-semibold">Jogar de novo</span>
          </button>
        </>
      )}

      {!over && (
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {LETTERS.map(l => {
            const used = guessed.includes(l);
            const correct = used && target.includes(l);
            return (
              <button key={l} onClick={() => guess(l)} disabled={used}
                className="aspect-square rounded-lg text-[12px] font-bold flex items-center justify-center"
                style={{
                  fontFamily: "Inter",
                  background: used ? (correct ? "#2FA8A01E" : "#FF7A591E") : "#FFFFFF",
                  color: used ? (correct ? "#1D7A72" : "#C24C33") : "#3A2E22",
                  boxShadow: used ? "none" : "0 1px 3px rgba(180,140,80,0.1)",
                  opacity: used ? 0.6 : 1,
                }}>
                {l}
              </button>
            );
          })}
        </div>
      )}

      <button onClick={() => setShowHint(v => !v)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full"
        style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
        <Lightbulb size={13} color={color} />
        <span style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[12px] font-semibold">
          {showHint ? item.hint : "Ver dica"}
        </span>
      </button>
    </div>
  );
}

export default HangmanGame;
