import React, { useMemo } from "react";

const PARTICLES = ["🎉", "🎊", "✨", "🎈"];

function makeConfetti(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: PARTICLES[i % PARTICLES.length],
    left: Math.round(Math.random() * 90) + 3,
    delay: (Math.random() * 0.5).toFixed(2),
    duration: (2.2 + Math.random() * 1.2).toFixed(2),
    size: 16 + Math.round(Math.random() * 14),
  }));
}

// Overlay de celebração reutilizável — usado no aniversário e no desbloqueio
// de medalhas das crianças. Confete simples em CSS, sem biblioteca externa.
function CelebrationOverlay({ emoji, title, desc, buttonLabel = "Continuar", accent = "#000000", onDismiss }) {
  const confetti = useMemo(() => makeConfetti(16), []);

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.65)" }}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-40px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(420px) rotate(340deg); opacity: 0; }
        }
        @keyframes celebrationPop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div className="w-full max-w-[320px] rounded-3xl p-7 text-center relative overflow-hidden"
        style={{ background: "#F2F2F2", animation: "celebrationPop 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div className="absolute inset-0 pointer-events-none">
          {confetti.map(c => (
            <span key={c.id} style={{
              position: "absolute", top: -20, left: `${c.left}%`, fontSize: c.size,
              animation: `confettiFall ${c.duration}s ease-in ${c.delay}s infinite`,
            }}>{c.emoji}</span>
          ))}
        </div>

        <div className="relative">
          <span style={{ fontSize: 56, display: "block", marginBottom: 12 }}>{emoji}</span>
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[19px] mb-2">{title}</p>
          <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[13px] leading-relaxed mb-6">{desc}</p>
          <button onClick={onDismiss}
            className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
            style={{ background: accent, color: "#FFFFFF", fontFamily: "Inter" }}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CelebrationOverlay;
