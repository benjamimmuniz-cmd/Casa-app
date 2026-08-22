import React, { useState, useEffect, useContext, createContext } from "react";
import AnimatedLogo from "../components/AnimatedLogo.jsx";

function Intro({ onStart }) {
  const [showName, setShowName] = useState(false);
  const [show, setShow] = useState(false);
  const [rotate, setRotate] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const t2 = setTimeout(() => setShowName(true), 1900);
    const t3 = setTimeout(() => setShow(true), 2500);
    return () => { clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleLogoTap = () => {
    if (leaving) return;
    setRotate(r => r + 360);
    setTimeout(() => {
      setLeaving(true);
      setTimeout(() => onStart(), 500);
    }, 550);
  };

  const handleStart = () => {
    if (leaving) return;
    setRotate(r => r + 360);
    setLeaving(true);
    setTimeout(() => onStart(), 500);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden flex flex-col items-center justify-between transition-all duration-500 ${leaving ? "opacity-0 scale-95" : "opacity-100 scale-100"}`} style={{ background: "#000000" }}>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10 text-center">
        <div className="flex flex-col items-center">
          <button onClick={handleLogoTap} className="active:scale-95 transition-transform mb-6" style={{ background: "none", border: "none", padding: 0 }}>
            <AnimatedLogo size={160} rotate={rotate} />
          </button>
          <div className={`transition-all duration-1000 ${showName ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
            <p style={{ fontFamily: "Inter", color: "#FFFFFF", letterSpacing: 2 }} className="text-[13px] uppercase font-semibold">
              Igreja do Nazareno
            </p>
            <h1 style={{ fontFamily: "Fraunces", color: "#FFFFFF", fontWeight: 700 }} className="text-[38px] leading-tight mt-1">
              A CASA
            </h1>
            <p style={{ fontFamily: "Fraunces", fontStyle: "italic", color: "#FFFFFF" }} className="text-[15px] mt-4">
              "Eu sou o caminho, a verdade e a vida."
            </p>
            <p style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)" }} className="text-[12px] mt-1">
              João 14:6
            </p>
          </div>
        </div>
      </div>
      <div className={`relative w-full px-8 pb-10 transition-all duration-1000 ${show ? "opacity-100" : "opacity-0"}`}>
        <button onClick={handleStart}
          className="w-full py-4 rounded-full font-semibold text-[15px] active:scale-[0.98] transition-transform"
          style={{ background: "#F2F2F2", color: "#000000", fontFamily: "Inter" }}>
          Começar jornada
        </button>
        <p className="text-center text-[11px] mt-4" style={{ color: "rgba(242,242,242,0.5)", fontFamily: "Inter" }}>
          Sua caminhada diária com Jesus, com sua igreja ao lado.
        </p>
        <p className="text-center text-[10px] mt-3" style={{ color: "rgba(242,242,242,0.35)", fontFamily: "Inter" }}>
          Criado por Benjamim Muniz
        </p>
      </div>
    </div>
  );
}

export default Intro;
