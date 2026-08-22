import React, { useState, useContext } from "react";
import { HandHeart, Lock, Globe } from "lucide-react";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials } from "../utils/helpers.js";
import { INITIAL_PRAYERS } from "../data/constants.js";

function OracaoScreen({ onBack }) {
  const me = useContext(UserContext).name || "Você";
  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    if (isPublic) {
      setPrayers(prev => [{ id: "pr" + Date.now(), author: me, time: "agora", text: text.trim(), prayingBy: [] }, ...prev]);
      setConfirmation("Seu pedido foi publicado no mural. 🙏");
    } else {
      setConfirmation("Pedido enviado só pra liderança da igreja, em sigilo.");
    }
    setText("");
    setIsPublic(false);
    setTimeout(() => setConfirmation(""), 3000);
  };

  const togglePray = (id) => {
    setPrayers(prev => prev.map(p => {
      if (p.id !== id) return p;
      const praying = p.prayingBy.includes(me);
      return { ...p, prayingBy: praying ? p.prayingBy.filter(n => n !== me) : [...p.prayingBy, me] };
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#8A4B6D1E" }}>
          <HandHeart size={20} color="#8A4B6D" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">Oração</h1>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mt-0.5">Compartilhe seu pedido</p>
        </div>
      </div>

      <div className="mx-6 rounded-3xl p-4 mb-6" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Qual é o seu pedido de oração?" rows={3}
          className="w-full outline-none text-[13.5px] resize-none bg-transparent"
          style={{ fontFamily: "Inter", color: "#000000" }} />

        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #E8E8E8" }}>
          <button onClick={() => setIsPublic(false)}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: !isPublic ? "#000000" : "#F2F2F2", color: !isPublic ? "#FFFFFF" : "#4D4D4D" }}>
            <Lock size={13} /> Só a liderança
          </button>
          <button onClick={() => setIsPublic(true)}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: isPublic ? "#000000" : "#F2F2F2", color: isPublic ? "#FFFFFF" : "#4D4D4D" }}>
            <Globe size={13} /> Publicar no mural
          </button>
        </div>

        <button onClick={submit} disabled={!text.trim()}
          className="w-full mt-3 py-3 rounded-full font-semibold text-[13.5px] active:scale-[0.98] transition-transform"
          style={{ fontFamily: "Inter", background: text.trim() ? "#000000" : "#E3E3E3", color: text.trim() ? "#FFFFFF" : "#9E9E9E" }}>
          Enviar pedido
        </button>

        {confirmation && (
          <p style={{ fontFamily: "Inter", color: "#5C6B45" }} className="text-[12px] text-center mt-3">{confirmation}</p>
        )}
      </div>

      <div className="px-6 mb-3">
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Mural de oração da igreja</p>
      </div>

      <div className="px-6 pb-10 flex flex-col gap-3">
        {prayers.map(p => {
          const praying = p.prayingBy.includes(me);
          return (
            <div key={p.id} className="rounded-2xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(p.author) }}>
                  <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[10px]">{initials(p.author)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px] truncate">{p.author}</p>
                  <p style={{ fontFamily: "IBM Plex Mono", color: "#9E9E9E" }} className="text-[10px]">{p.time}</p>
                </div>
              </div>
              <p style={{ fontFamily: "Fraunces", color: "#000000" }} className="text-[14.5px] leading-snug mb-3">{p.text}</p>
              <button onClick={() => togglePray(p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={{ fontFamily: "Inter", background: praying ? "#8A4B6D" : "#F2F2F2", color: praying ? "#FFFFFF" : "#4D4D4D" }}>
                🙏 {praying ? "Orando" : "Orar por isso"} {p.prayingBy.length > 0 && `· ${p.prayingBy.length}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OracaoScreen;
