import React, { useState, useEffect, useContext, createContext } from "react";

function ProgressRing({ pct }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} stroke="#E3E3E3" strokeWidth="6" fill="none" />
      <circle cx="32" cy="32" r={r} stroke="#2B2B2B" strokeWidth="6" fill="none"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round"
        transform="rotate(-90 32 32)" />
      <text x="32" y="37" textAnchor="middle" style={{ fontFamily: "IBM Plex Mono", fontSize: "13px", fill: "#000000" }}>
        {pct}%
      </text>
    </svg>
  );
}

export default ProgressRing;
