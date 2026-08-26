import React, { useState } from "react";
import { BookOpen, Menu as MenuIcon, Search } from "lucide-react";

const STEPS = [
  {
    emoji: "🏠",
    title: "Bem-vindo à Casa!",
    desc: "Esse é o seu espaço na comunidade da igreja. Vamos te mostrar rapidinho onde encontrar cada coisa.",
  },
  {
    icon: MenuIcon,
    title: "Tudo pelo menu",
    desc: "Toque no ☰ no canto superior esquerdo pra ver tudo que a Casa oferece: Bíblia, Discipulado, Crianças, Chat, Eventos, Ministérios e muito mais.",
  },
  {
    icon: Search,
    title: "Busca rápida",
    desc: "Precisa achar uma pessoa, uma mensagem, um produto ou um evento? Toque na lupa ao lado da sua foto e busque tudo de uma vez.",
  },
  {
    icon: BookOpen,
    title: "Sempre à mão",
    desc: "Bíblia, Shorts, Casa Store e Generosidade ficam fixos na barra debaixo — um toque de distância, sempre.",
  },
  {
    emoji: "🔔",
    title: "Fique por dentro",
    desc: "O sininho avisa quando alguém te chama, um evento novo é criado, ou seu filho ganha uma medalha na Área Infantil.",
  },
];

function WelcomeTour({ onFinish }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-[320px] rounded-3xl p-6" style={{ background: "#F2F2F2" }}>
        <div className="flex justify-end mb-1">
          <button onClick={onFinish} style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Pular</button>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#0000000F" }}>
            {Icon ? <Icon size={28} color="#000000" /> : <span style={{ fontSize: 30 }}>{current.emoji}</span>}
          </div>
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[18px] mb-2">{current.title}</p>
          <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12.5px] leading-relaxed">{current.desc}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <span key={i} className="rounded-full transition-all" style={{ width: i === step ? 16 : 6, height: 6, background: i === step ? "#000000" : "#D6D6D6" }} />
          ))}
        </div>

        <button onClick={() => isLast ? onFinish() : setStep(s => s + 1)}
          className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
          style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
          {isLast ? "Vamos lá!" : "Próximo"}
        </button>
      </div>
    </div>
  );
}

export default WelcomeTour;
