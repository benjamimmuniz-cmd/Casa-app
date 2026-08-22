import React, { useState, useEffect, useContext, createContext } from "react";
import {
  Handshake
} from "lucide-react";
import { UserContext } from "../context/contexts.js";
import { SOUNOVO_SITUACOES } from "../data/constants.js";

function SouNovoScreen({ onBack }) {
  const meName = useContext(UserContext).name || "";
  const [step, setStep] = useState("intro");
  const [form, setForm] = useState({
    nome: meName, telefone: "", nascimento: "", situacao: null,
    igrejaAnterior: "", comoConheceu: "", acompanhamento: true,
  });
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    setError("");
    if (!form.nome.trim()) { setError("Digite seu nome."); return; }
    if (!form.telefone.trim()) { setError("Digite seu telefone."); return; }
    if (!form.situacao) { setError("Selecione uma opção: novo convertido ou vindo de outra igreja."); return; }
    setStep("sucesso");
  };

  if (step === "sucesso") {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "#5C6B451E" }}>
            <Handshake size={32} color="#5C6B45" />
          </div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px] mb-3">
            Que alegria ter você aqui!
          </h1>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[13px] leading-relaxed mb-1">
            Seu cadastro foi recebido. Um discipulador da Casa vai entrar em contato com você em breve.
          </p>
          <p style={{ fontFamily: "Fraunces", fontStyle: "italic", color: "#4D4D4D" }} className="text-[14px] mt-4">
            "Portanto, se alguém está em Cristo, é nova criação." — 2 Coríntios 5:17
          </p>
        </div>
        <div className="px-6 pb-10">
          <button onClick={onBack}
            className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
            style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (step === "cadastro") {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setStep("intro")} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Sou Novo</button>
        </div>
        <div className="px-6 mt-1 mb-6">
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Seu cadastro</h1>
          <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Leva menos de um minuto</p>
        </div>

        <div className="px-6 pb-10">
          <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Nome completo</label>
          <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Seu nome"
            className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

          <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Telefone / WhatsApp</label>
          <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 90000-0000"
            className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

          <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Data de nascimento <span style={{ color: "#9E9E9E" }}>(opcional)</span></label>
          <input type="date" value={form.nascimento} onChange={e => set("nascimento", e.target.value)}
            className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

          <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Qual é a sua situação?</label>
          <div className="flex flex-col gap-2.5 mb-4">
            {SOUNOVO_SITUACOES.map(s => (
              <button key={s.id} type="button" onClick={() => set("situacao", s.id)}
                className="w-full py-3.5 rounded-xl text-[13.5px] font-semibold text-left px-4"
                style={{
                  fontFamily: "Inter",
                  background: form.situacao === s.id ? "#000000" : "#FFFFFF",
                  color: form.situacao === s.id ? "#FFFFFF" : "#4D4D4D",
                  border: "1px solid " + (form.situacao === s.id ? "#000000" : "#D6D6D6"),
                }}>
                {s.label}
              </button>
            ))}
          </div>

          {form.situacao === "outra_igreja" && (
            <>
              <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Nome da igreja anterior <span style={{ color: "#9E9E9E" }}>(opcional)</span></label>
              <input value={form.igrejaAnterior} onChange={e => set("igrejaAnterior", e.target.value)} placeholder="Ex: Igreja Batista Central"
                className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            </>
          )}

          <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Como conheceu a Casa? <span style={{ color: "#9E9E9E" }}>(opcional)</span></label>
          <input value={form.comoConheceu} onChange={e => set("comoConheceu", e.target.value)} placeholder="Ex: convite de um amigo, redes sociais..."
            className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

          <label className="flex items-start gap-3 mb-6 cursor-pointer rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid #D6D6D6" }}>
            <input type="checkbox" checked={form.acompanhamento} onChange={e => set("acompanhamento", e.target.checked)}
              className="w-4 h-4 rounded mt-0.5 shrink-0" style={{ accentColor: "#000000" }} />
            <span>
              <span style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px] block">Quero receber acompanhamento</span>
              <span style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] leading-relaxed block mt-0.5">Um discipulador da Casa vai entrar em contato pra te dar as boas-vindas.</span>
            </span>
          </label>

          {error && <p style={{ fontFamily: "Inter", color: "#B25B4A" }} className="text-[12px] mb-4 text-center">{error}</p>}

          <button onClick={handleSubmit}
            className="w-full py-4 rounded-full font-semibold text-[15px] active:scale-[0.98] transition-transform"
            style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
            Enviar cadastro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: "#000000" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }}>← Início</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(242,242,242,0.12)" }}>
          <Handshake size={32} color="#F2F2F2" />
        </div>
        <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.6)", letterSpacing: 2 }} className="text-[12px] uppercase font-semibold mb-2">
          Bem-vindo(a)
        </p>
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#F2F2F2" }} className="text-[26px] leading-tight mb-4">
          Sou Novo na Casa
        </h1>
        <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }} className="text-[13.5px] leading-relaxed">
          Se você é um novo convertido ou está chegando de outra igreja, queremos te conhecer! Faz seu cadastro e um discipulador vai te dar as boas-vindas.
        </p>
      </div>
      <div className="px-6 pb-10">
        <button onClick={() => setStep("cadastro")}
          className="w-full py-4 rounded-full font-semibold text-[15px] active:scale-[0.98] transition-transform"
          style={{ background: "#F2F2F2", color: "#000000", fontFamily: "Inter" }}>
          Fazer meu cadastro
        </button>
      </div>
    </div>
  );
}

export default SouNovoScreen;
