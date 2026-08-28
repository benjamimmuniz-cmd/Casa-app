import React, { useState, useEffect, useContext, createContext } from "react";
import { Video } from "lucide-react";
import { INITIAL_DEVOCIONAIS } from "../data/constants.js";
import VideoCallScreen from "./VideoCallScreen.jsx";

function EstudosScreen({ onBack }) {
  const [devocionais, setDevocionais] = useState(INITIAL_DEVOCIONAIS);
  const [openId, setOpenId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [form, setForm] = useState({ title: "", verse: "", day: "", text: "" });

  const devo = devocionais.find(d => d.id === openId);

  if (showCall) {
    return <VideoCallScreen onBack={() => setShowCall(false)} />;
  }

  const handleAdd = () => {
    if (!form.title.trim() || !form.text.trim()) return;
    setDevocionais(prev => [{ id: "dev" + Date.now(), title: form.title.trim(), verse: form.verse.trim(), day: form.day.trim() || "Sem data", text: form.text.trim() }, ...prev]);
    setForm({ title: "", verse: "", day: "", text: "" });
    setShowAdd(false);
  };

  if (devo) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Estudos</button>
        </div>
        <div className="px-6 mt-2 mb-4">
          <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#5A5A5A1E", color: "#5C6B45" }}>{devo.day}</span>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px] mt-3 leading-snug">{devo.title}</h1>
          {devo.verse && <p style={{ fontFamily: "Fraunces", fontStyle: "italic", color: "#2B2B2B" }} className="text-[13px] mt-1">{devo.verse}</p>}
        </div>
        <div className="px-6 pb-10">
          <p style={{ fontFamily: "Inter", color: "#1A1A1A" }} className="text-[14.5px] leading-relaxed">{devo.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col min-h-0" style={{ background: "#F2F2F2" }}>
      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        <button onClick={() => setShowCall(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold" style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
          <Video size={13} /> Videochamada
        </button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Estudos</h1>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-1">Devocionais para sua semana</p>
      </div>

      <div className="px-6 pb-28 flex flex-col gap-3">
        {devocionais.map(d => (
          <button key={d.id} onClick={() => setOpenId(d.id)}
            className="rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
            style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#5A5A5A1E", color: "#5C6B45" }}>{d.day}</span>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[15px] mt-2 leading-snug">{d.title}</p>
            {d.verse && <p style={{ fontFamily: "Fraunces", fontStyle: "italic", color: "#2B2B2B" }} className="text-[12px] mt-1">{d.verse}</p>}
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-2 line-clamp-2">{d.text}</p>
          </button>
        ))}
      </div>
      </div>

      <button onClick={() => setShowAdd(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#5A5A5A", boxShadow: "0 6px 16px rgba(124,139,93,0.4)" }}>
        <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
      </button>

      {showAdd && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-4">Novo devocional</p>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <div className="flex gap-3 mb-3">
              <input value={form.verse} onChange={e => setForm({ ...form, verse: e.target.value })} placeholder="Versículo (ex: Salmos 23:1)"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
              <input value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} placeholder="Dia (ex: Sexta-feira)"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            </div>
            <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Texto do devocional" rows={6}
              className="w-full px-4 py-3 rounded-xl mb-5 outline-none text-[13px] resize-none"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <button onClick={handleAdd}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              Publicar devocional
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EstudosScreen;
