import React, { useState, useEffect, useContext, createContext } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Users
} from "lucide-react";
import { FeedContext, UserContext } from "../context/contexts.js";
import { colorFor, initials } from "../utils/helpers.js";
import { INITIAL_POLLS, ME, VOTE_OPTIONS } from "../data/constants.js";

function EnquetesScreen({ onBack }) {
  const ME = useContext(UserContext).name || "Você";
  const { addPost } = useContext(FeedContext);
  const [polls, setPolls] = useState(INITIAL_POLLS);
  const [openPollId, setOpenPollId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "" });
  const [postToFeed, setPostToFeed] = useState(true);
  const [formError, setFormError] = useState("");

  const poll = polls.find(p => p.id === openPollId);

  const vote = (pollId, optionId) => {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      const others = p.votes.filter(v => v.name !== ME);
      return { ...p, votes: [...others, { name: ME, option: optionId }] };
    }));
  };

  const handleAdd = () => {
    setFormError("");
    if (!form.title.trim()) { setFormError("Digite o título da enquete."); return; }
    setPolls(prev => [{ id: "poll" + Date.now(), title: form.title.trim(), date: form.date.trim() || "—", time: form.time.trim() || "—", votes: [] }, ...prev]);
    if (postToFeed) {
      addPost({
        author: ME,
        text: `Nova enquete: ${form.title.trim()}${form.date.trim() ? ` — ${form.date.trim()}` : ""}${form.time.trim() ? ` às ${form.time.trim()}` : ""}. Vá em Enquetes e diga se você pode participar!`,
        kind: "enquete",
      });
    }
    setForm({ title: "", date: "", time: "" });
    setShowAdd(false);
  };

  const counts = (p) => VOTE_OPTIONS.map(o => ({ ...o, count: p.votes.filter(v => v.option === o.id).length }));

  if (poll) {
    const c = counts(poll);
    const total = poll.votes.length || 1;
    const myVote = poll.votes.find(v => v.name === ME)?.option;
    const confirmados = poll.votes.filter(v => v.option === "sim");

    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenPollId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Enquetes</button>
        </div>
        <div className="px-6 mt-2 mb-1">
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px] leading-snug">{poll.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <CalendarDays size={12} color="#707070" />
              <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{poll.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} color="#707070" />
              <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{poll.time}</span>
            </div>
          </div>
        </div>

        <div className="px-6 mt-5 mb-2">
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">Você pode participar?</p>
          <div className="flex flex-col gap-2">
            {VOTE_OPTIONS.map(o => {
              const active = myVote === o.id;
              return (
                <button key={o.id} onClick={() => vote(poll.id, o.id)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform"
                  style={{ background: active ? o.color : "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <span style={{ fontFamily: "Inter", fontWeight: 600, color: active ? "#F2F2F2" : "#000000" }} className="text-[13px]">{o.label}</span>
                  {active && <Check size={16} color="#F2F2F2" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 mt-6">
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">Resultado · {poll.votes.length} respostas</p>
          <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-3" style={{ background: "#E3E3E3" }}>
            {c.map(o => o.count > 0 && (
              <div key={o.id} style={{ width: `${(o.count / total) * 100}%`, background: o.color }} />
            ))}
          </div>
          <div className="flex flex-col gap-1.5 mb-6">
            {c.map(o => (
              <div key={o.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: o.color }} />
                  <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">{o.label}</span>
                </div>
                <span style={{ fontFamily: "IBM Plex Mono", color: "#000000" }} className="text-[12px]">{o.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-8">
          <p style={{ fontFamily: "Inter", color: "#5A5A5A" }} className="text-[12px] mb-3 font-semibold">✓ Confirmados para participar</p>
          {confirmados.length === 0 ? (
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Ninguém confirmou ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {confirmados.map(v => (
                <div key={v.name} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full" style={{ background: "#5A5A5A1E" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: colorFor(v.name) }}>
                    <span style={{ fontFamily: "Inter", color: "#F2F2F2", fontSize: 9, fontWeight: 700 }}>{initials(v.name)}</span>
                  </div>
                  <span style={{ fontFamily: "Inter", color: "#000000" }} className="text-[12px]">{v.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#0000000F", color: "#616161" }}>
          {polls.length} ativas
        </span>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Enquetes</h1>
      </div>

      <div className="px-6 pb-28 flex flex-col gap-3">
        {polls.map(p => {
          const c = counts(p);
          const total = p.votes.length || 1;
          return (
            <button key={p.id} onClick={() => setOpenPollId(p.id)}
              className="rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
              style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-start justify-between">
                <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[15px] pr-2">{p.title}</p>
                <ChevronRight size={16} color="#9E9E9E" />
              </div>
              <div className="flex items-center gap-3 mt-1.5 mb-3">
                <div className="flex items-center gap-1">
                  <CalendarDays size={11} color="#707070" />
                  <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{p.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} color="#707070" />
                  <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{p.time}</span>
                </div>
              </div>
              <div className="flex w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: "#E3E3E3" }}>
                {c.map(o => o.count > 0 && <div key={o.id} style={{ width: `${(o.count / total) * 100}%`, background: o.color }} />)}
              </div>
              <div className="flex items-center gap-1">
                <Users size={11} color="#707070" />
                <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{p.votes.length} responderam</span>
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={() => setShowAdd(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#2B2B2B", boxShadow: "0 6px 16px rgba(43,43,43,0.4)" }}>
        <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
      </button>

      {showAdd && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Nova enquete</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Perguntar quem pode participar de um evento</p>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Evangelismo no Parque"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <div className="flex gap-3 mb-4">
              <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="Data (ex: 22/08)"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
              <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="Hora (ex: 09:00)"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            </div>
            <label className="flex items-center gap-2.5 mb-4 cursor-pointer">
              <input type="checkbox" checked={postToFeed} onChange={e => setPostToFeed(e.target.checked)}
                className="w-4 h-4 rounded" style={{ accentColor: "#000000" }} />
              <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Publicar essa enquete no Feed também</span>
            </label>
            {formError && (
              <p style={{ fontFamily: "Inter", color: "#B25B4A" }} className="text-[12px] mb-4 text-center">{formError}</p>
            )}
            <button onClick={handleAdd}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              Criar enquete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquetesScreen;
