import React, { useContext, useState } from "react";
import { Check, ChevronDown, HandCoins } from "lucide-react";
import PixGiving from "../components/PixGiving.jsx";
import { UserContext } from "../context/contexts.js";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function mesKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

function ultimosMeses(n) {
  const out = [];
  const hoje = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    out.push({ key: mesKey(d), label: `${MESES[d.getMonth()]} de ${d.getFullYear()}` });
  }
  return out;
}

function OfertasDizimosScreen({ onBack }) {
  const me = useContext(UserContext);
  const [showHistorico, setShowHistorico] = useState(false);
  const meses = ultimosMeses(6);
  const [mesAtual, ...mesesAnteriores] = meses;
  const dizimadoAtual = !!me.dizimos?.[mesAtual.key];

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#8A6D3B1E" }}>
          <HandCoins size={20} color="#8A6D3B" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">Generosidade e Dízimos</h1>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mt-0.5">Semeie com um coração alegre</p>
        </div>
      </div>

      <div className="px-6 mb-5">
        <p style={{ fontFamily: "Fraunces", fontStyle: "italic", color: "#4D4D4D" }} className="text-[14px] leading-relaxed">
          "Cada um contribua segundo propôs no seu coração, não com tristeza ou por obrigação; porque Deus ama ao que dá com alegria."
        </p>
        <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] mt-1">2 Coríntios 9:7</p>
      </div>

      <div className="px-6 mb-5">
        <div className="rounded-2xl p-4" style={{ background: dizimadoAtual ? "#5C6B451A" : "#FFFFFF", boxShadow: dizimadoAtual ? "none" : "0 1px 3px rgba(0,0,0,0.06)", border: dizimadoAtual ? "1px solid #5C6B4533" : "none" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: dizimadoAtual ? "#5C6B4526" : "#8A6D3B14" }}>
                {dizimadoAtual ? <Check size={18} color="#5C6B45" /> : <HandCoins size={18} color="#8A6D3B" />}
              </div>
              <div className="min-w-0">
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px] uppercase tracking-wide">Dízimo deste mês</p>
                <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[15px] truncate">{mesAtual.label}</p>
              </div>
            </div>
          </div>
          <button onClick={() => me.toggleDizimoMes(mesAtual.key)}
            className="w-full mt-3.5 py-3 rounded-full font-semibold text-[13px] active:scale-[0.98] transition-transform"
            style={{
              fontFamily: "Inter",
              background: dizimadoAtual ? "#FFFFFF" : "#000000",
              color: dizimadoAtual ? "#5C6B45" : "#FFFFFF",
              border: dizimadoAtual ? "1px solid #5C6B4533" : "none"
            }}>
            {dizimadoAtual ? "✓ Dízimo confirmado — toque para desmarcar" : "Marcar dízimo deste mês como pago"}
          </button>
        </div>

        <button onClick={() => setShowHistorico(v => !v)} className="w-full flex items-center justify-between mt-3 px-1">
          <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Ver meses anteriores</span>
          <ChevronDown size={16} color="#9E9E9E" style={{ transform: showHistorico ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {showHistorico && (
          <div className="flex flex-col gap-2 mt-2">
            {mesesAnteriores.map(m => {
              const feito = !!me.dizimos?.[m.key];
              return (
                <button key={m.key} onClick={() => me.toggleDizimoMes(m.key)}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12.5px]">{m.label}</span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: feito ? "#5C6B45" : "#0000000F" }}>
                    {feito && <Check size={13} color="#FFFFFF" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-6 pb-10">
        <PixGiving />
        <div className="rounded-2xl px-4 py-3 mt-4 flex items-start gap-2.5" style={{ background: "#8A6D3B14" }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <p style={{ fontFamily: "Inter", color: "#6B551F" }} className="text-[12px] leading-relaxed">
            Por gentileza, coloque na descrição do Pix se a contribuição é referente ao <b>dízimo</b> ou à <b>generosidade</b>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OfertasDizimosScreen;
