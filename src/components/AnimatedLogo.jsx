import React, { useEffect, useState } from "react";
import { LOGO_IMG } from "../assets/logo-base64.js";

// Mascaras recortam regioes da MESMA imagem original (nada e redesenhado),
// entao o resultado final e sempre identico a logo real.
const BIG_CHEVRON = "M 85,505 L 380,270 L 675,505 L 675,528 L 380,315 L 85,528 Z";
const SMALL_CHEVRON = "M 195,590 L 380,420 L 565,590 L 565,625 L 380,455 L 195,625 Z";
// remendos solidos para fechar qualquer brecha residual entre a ponta da fita e o anel
const FOOT_PATCH_LEFT = { cx: 97, cy: 517, r: 26 };
const FOOT_PATCH_RIGHT = { cx: 663, cy: 517, r: 26 };

function AnimatedLogo({ size = 160, rotate = 0 }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 80);   // a bola
    const t2 = setTimeout(() => setStage(2), 700);  // os triangulos
    const t3 = setTimeout(() => setStage(3), 1250); // os passaros
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <svg width={size} height={size} viewBox="0 0 760 760"
      style={{ transform: `rotate(${rotate}deg)`, transition: "transform 0.7s ease-in-out" }}>
      <defs>
        <mask id="logo-ring-mask">
          <circle cx="380" cy="380" r="380" fill="#FFFFFF" />
          <path d={BIG_CHEVRON} fill="#000000" />
          <path d={SMALL_CHEVRON} fill="#000000" />
          <ellipse cx="205" cy="258" rx="75" ry="35" fill="#000000" />
          <ellipse cx="515" cy="250" rx="80" ry="38" fill="#000000" />
        </mask>
        <mask id="logo-chevron-mask">
          <path d={BIG_CHEVRON} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="16" strokeLinejoin="round" />
          <path d={SMALL_CHEVRON} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="16" strokeLinejoin="round" />
        </mask>
        <mask id="logo-bird-left-mask">
          <ellipse cx="205" cy="258" rx="75" ry="35" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="16" />
        </mask>
        <mask id="logo-bird-right-mask">
          <ellipse cx="515" cy="250" rx="80" ry="38" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="16" />
        </mask>
      </defs>

      <g style={{
        opacity: stage >= 1 ? 1 : 0,
        transform: stage >= 1 ? "scale(1)" : "scale(0.6)",
        transformOrigin: "380px 380px",
        transition: "opacity 0.5s ease-out, transform 0.55s cubic-bezier(0.34,1.56,0.64,1)",
      }} mask="url(#logo-ring-mask)">
        <image href={LOGO_IMG} x="0" y="0" width="760" height="760" />
      </g>

      <g style={{
        opacity: stage >= 2 ? 1 : 0,
        transform: stage >= 2 ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.45s ease-out, transform 0.45s ease-out",
      }} mask="url(#logo-chevron-mask)">
        <image href={LOGO_IMG} x="0" y="0" width="760" height="760" />
      </g>

      <g style={{
        opacity: stage >= 3 ? 1 : 0,
        transform: stage >= 3 ? "translate(0,0)" : "translate(-60px,-18px)",
        transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
      }} mask="url(#logo-bird-left-mask)">
        <image href={LOGO_IMG} x="0" y="0" width="760" height="760" />
      </g>

      <g style={{
        opacity: stage >= 3 ? 1 : 0,
        transform: stage >= 3 ? "translate(0,0)" : "translate(60px,-18px)",
        transition: "opacity 0.45s ease-out 0.06s, transform 0.45s ease-out 0.06s",
      }} mask="url(#logo-bird-right-mask)">
        <image href={LOGO_IMG} x="0" y="0" width="760" height="760" />
      </g>

      <g style={{ opacity: stage >= 2 ? 1 : 0, transition: "opacity 0.45s ease-out" }}>
        <circle cx={FOOT_PATCH_LEFT.cx} cy={FOOT_PATCH_LEFT.cy} r={FOOT_PATCH_LEFT.r} fill="#FFFFFF" />
        <circle cx={FOOT_PATCH_RIGHT.cx} cy={FOOT_PATCH_RIGHT.cy} r={FOOT_PATCH_RIGHT.r} fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export default AnimatedLogo;
