import React, { useState, useEffect, useContext, createContext } from "react";
import {
  Bell,
  BellOff,
  ImageIcon,
  MapPin,
  Plus,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { FeedContext, UserContext } from "../context/contexts.js";
import { catColor, getMonthGrid } from "../utils/helpers.js";
import { CATEGORIES, INITIAL_EVENTS } from "../data/constants.js";

function CalendarioScreen({ onBack }) {
  const YEAR = 2026, MONTH = 7; // agosto
  const TODAY = 16;
  const meName = useContext(UserContext).name || "Alguém da igreja";
  const { addPost } = useContext(FeedContext);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0].id, image: null, signupEnabled: false });
  const [formDays, setFormDays] = useState([{ day: TODAY, time: "" }]);
  const [postToFeed, setPostToFeed] = useState(true);
  const [signupForEvent, setSignupForEvent] = useState(null);
  const [signupForm, setSignupForm] = useState({ name: meName, phone: "" });
  const [resultsForEvent, setResultsForEvent] = useState(null);

  const weekdayShort = (day) => {
    const s = new Date(YEAR, MONTH, day).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const weeks = getMonthGrid(YEAR, MONTH);
  const dayEvents = events
    .filter(e => e.days.some(d => d.day === selectedDay))
    .map(e => ({ ...e, _time: e.days.find(d => d.day === selectedDay).time }))
    .sort((a, b) => a._time.localeCompare(b._time));
  const eventDays = new Set(events.flatMap(e => e.days.map(d => d.day)));

  const toggleReminder = (id) => setEvents(prev => prev.map(e => e.id === id ? { ...e, reminder: !e.reminder } : e));

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const addFormDay = () => setFormDays(prev => [...prev, { day: selectedDay, time: "" }]);
  const removeFormDay = (idx) => setFormDays(prev => prev.filter((_, i) => i !== idx));
  const updateFormDay = (idx, field, value) => setFormDays(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));

  const summarizeDays = (days) => {
    if (days.length === 1) return `dia ${days[0].day} de agosto às ${days[0].time}`;
    const nums = days.map(d => d.day);
    const last = nums.pop();
    return `dias ${nums.join(", ")} e ${last} de agosto`;
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    const cleanDays = formDays
      .filter(d => d.day)
      .map(d => ({ day: Number(d.day), time: d.time.trim() || "—" }));
    if (cleanDays.length === 0) return;
    setEvents(prev => [...prev, {
      id: "ev" + Date.now(), days: cleanDays, title: form.title.trim(),
      location: "", category: form.category, reminder: true, image: form.image,
      author: meName, signupEnabled: form.signupEnabled, signups: [],
    }]);
    if (postToFeed) {
      addPost({
        author: meName,
        text: `Novo evento: ${form.title.trim()} — ${summarizeDays(cleanDays)}. Não perca!`,
        image: form.image,
        kind: "evento",
      });
    }
    setForm({ title: "", category: CATEGORIES[0].id, image: null, signupEnabled: false });
    setFormDays([{ day: selectedDay, time: "" }]);
    setShowAdd(false);
  };

  const mySignup = (ev) => (ev.signups || []).find(s => s.name === meName);

  const submitSignup = () => {
    if (!signupForm.name.trim()) return;
    setEvents(prev => prev.map(e => e.id === signupForEvent
      ? { ...e, signups: [...(e.signups || []), { name: signupForm.name.trim(), phone: signupForm.phone.trim() }] }
      : e));
    setSignupForEvent(null);
    setSignupForm({ name: meName, phone: "" });
  };

  const resultsEvent = events.find(e => e.id === resultsForEvent);
  const signupEvent = events.find(e => e.id === signupForEvent);

  const cancelSignup = (evId) => {
    setEvents(prev => prev.map(e => e.id === evId
      ? { ...e, signups: (e.signups || []).filter(s => s.name !== meName) }
      : e));
  };

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#0000000F", color: "#616161" }}>
          {events.length} eventos
        </span>
      </div>

      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Agosto 2026</h1>
      </div>

      <div className="mx-6 rounded-3xl p-4 mb-5" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="grid grid-cols-7 mb-2">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <span key={i} style={{ fontFamily: "IBM Plex Mono", color: "#9E9E9E" }} className="text-[10px] text-center">{d}</span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 mb-1">
            {week.map((d, di) => {
              if (!d) return <div key={di} />;
              const isSelected = d === selectedDay;
              const isToday = d === TODAY;
              const hasEvents = eventDays.has(d);
              return (
                <button key={di} onClick={() => setSelectedDay(d)} className="flex flex-col items-center py-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: isSelected ? "#000000" : "transparent",
                      outline: isToday && !isSelected ? "1.5px solid #2B2B2B" : "none",
                    }}>
                    <span style={{ fontFamily: "Inter", color: isSelected ? "#F2F2F2" : "#000000", fontSize: 12 }}>{d}</span>
                  </div>
                  <div className="h-1.5 mt-0.5">
                    {hasEvents && <div className="w-1 h-1 rounded-full" style={{ background: isSelected ? "#FFFFFF" : "#2B2B2B" }} />}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="px-6 pb-28">
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">
          Eventos · {selectedDay} de agosto{selectedDay === TODAY ? " (hoje)" : ""}
        </p>

        {dayEvents.length === 0 ? (
          <div className="rounded-2xl py-8 text-center" style={{ background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Nenhum evento neste dia.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {dayEvents.map(ev => (
              <div key={ev.id} className="rounded-2xl p-3.5 flex items-start gap-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {ev.image ? (
                  <img src={ev.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-1.5 self-stretch rounded-full" style={{ background: catColor(ev.category) }} />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: catColor(ev.category) + "1E", color: catColor(ev.category) }}>
                      {CATEGORIES.find(c => c.id === ev.category)?.label}
                    </span>
                    <span style={{ fontFamily: "IBM Plex Mono", color: "#707070" }} className="text-[10px]">{ev._time}</span>
                  </div>
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{ev.title}</p>
                  {ev.days.length > 1 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {ev.days.map(d => (
                        <span key={d.day} className="text-[9.5px] px-2 py-0.5 rounded-full"
                          style={{
                            fontFamily: "IBM Plex Mono",
                            background: d.day === selectedDay ? "#000000" : "#0000000A",
                            color: d.day === selectedDay ? "#FFFFFF" : "#707070",
                          }}>
                          {weekdayShort(d.day)} {d.time}
                        </span>
                      ))}
                    </div>
                  )}
                  {ev.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={11} color="#707070" />
                      <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">{ev.location}</span>
                    </div>
                  )}
                  {ev.signupEnabled && (
                    <div className="mt-2">
                      {ev.author === meName ? (
                        <button onClick={() => setResultsForEvent(ev.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#0000000F" }}>
                          <Users size={12} color="#4D4D4D" />
                          <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[10.5px]">{(ev.signups || []).length} inscritos · ver lista</span>
                        </button>
                      ) : mySignup(ev) ? (
                        <button onClick={() => cancelSignup(ev.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#5C6B451A" }}>
                          <UserCheck size={12} color="#5C6B45" />
                          <span style={{ fontFamily: "Inter", color: "#5C6B45" }} className="text-[10.5px]">Inscrito · {(ev.signups || []).length} no total</span>
                        </button>
                      ) : (
                        <button onClick={() => { setSignupForEvent(ev.id); setSignupForm({ name: meName, phone: "" }); }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#000000" }}>
                          <UserCheck size={12} color="#FFFFFF" />
                          <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[10.5px]">Inscrever-se · {(ev.signups || []).length} inscritos</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => toggleReminder(ev.id)} className="shrink-0 mt-0.5">
                  {ev.reminder
                    ? <Bell size={17} color="#2B2B2B" fill="#2B2B2B" />
                    : <BellOff size={17} color="#9E9E9E" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => { setFormDays([{ day: selectedDay, time: "" }]); setShowAdd(true); }}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#2B2B2B", boxShadow: "0 6px 16px rgba(43,43,43,0.4)" }}>
        <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
      </button>

      {showAdd && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl p-6 overflow-y-auto" style={{ background: "#F2F2F2", maxHeight: "88%" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Novo evento</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Pode ter mais de um dia, cada um com seu horário — útil pra eventos tipo sexta 19h, sábado e domingo 18h.</p>

            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0" style={{ background: "#E8E8E8", border: "1px dashed #D6D6D6" }}>
                {form.image ? <img src={form.image} alt="Prévia" className="w-full h-full object-cover" /> : <ImageIcon size={20} color="#9E9E9E" />}
              </div>
              <div>
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px]">{form.image ? "Trocar foto" : "Adicionar foto"}</p>
                <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">Opcional — aparece no evento e no Feed</p>
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoPick} className="hidden" />
            </label>

            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Nome do evento"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] mb-2">Dias e horários</p>
            <div className="flex flex-col gap-2 mb-2">
              {formDays.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1.5 px-3 py-2.5 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid #D6D6D6" }}>
                    <span style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] shrink-0">Dia</span>
                    <input type="number" min="1" max="31" value={d.day} onChange={e => updateFormDay(i, "day", e.target.value)}
                      className="w-10 outline-none text-[13px]" style={{ fontFamily: "Inter", color: "#000000" }} />
                    <span style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] shrink-0">{weekdayShort(d.day)}/ago</span>
                  </div>
                  <input value={d.time} onChange={e => updateFormDay(i, "time", e.target.value)} placeholder="19:00"
                    className="w-20 px-3 py-2.5 rounded-xl outline-none text-[13px]"
                    style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
                  {formDays.length > 1 && (
                    <button onClick={() => removeFormDay(i)} className="shrink-0"><X size={16} color="#9E9E9E" /></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addFormDay} className="flex items-center gap-1.5 mb-4">
              <Plus size={13} color="#4D4D4D" />
              <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Adicionar outro dia</span>
            </button>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setForm({ ...form, category: c.id })}
                  className="px-3 py-1.5 rounded-full text-[11px]"
                  style={{
                    fontFamily: "Inter",
                    background: form.category === c.id ? c.color : "#FFFFFF",
                    color: form.category === c.id ? "#F2F2F2" : "#4D4D4D",
                    border: `1px solid ${form.category === c.id ? c.color : "#D6D6D6"}`,
                  }}>
                  {c.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2.5 mb-3 cursor-pointer">
              <input type="checkbox" checked={postToFeed} onChange={e => setPostToFeed(e.target.checked)}
                className="w-4 h-4 rounded" style={{ accentColor: "#000000" }} />
              <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Publicar esse evento no Feed também</span>
            </label>
            <label className="flex items-center gap-2.5 mb-5 cursor-pointer">
              <input type="checkbox" checked={form.signupEnabled} onChange={e => setForm({ ...form, signupEnabled: e.target.checked })}
                className="w-4 h-4 rounded" style={{ accentColor: "#000000" }} />
              <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Abrir lista de inscrição (só você vê quem se inscreveu)</span>
            </label>
            <button onClick={handleAdd}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              Adicionar ao calendário
            </button>
          </div>
        </div>
      )}

      {signupEvent && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setSignupForEvent(null)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Inscrever-se</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">{signupEvent.title}</p>
            <input value={signupForm.name} onChange={e => setSignupForm({ ...signupForm, name: e.target.value })} placeholder="Nome completo"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input value={signupForm.phone} onChange={e => setSignupForm({ ...signupForm, phone: e.target.value })} placeholder="Telefone / WhatsApp"
              className="w-full px-4 py-3 rounded-xl mb-5 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <button onClick={submitSignup} disabled={!signupForm.name.trim()}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: signupForm.name.trim() ? "#000000" : "#E3E3E3", color: signupForm.name.trim() ? "#FFFFFF" : "#9E9E9E", fontFamily: "Inter" }}>
              Confirmar inscrição
            </button>
          </div>
        </div>
      )}

      {resultsEvent && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setResultsForEvent(null)}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: "#F2F2F2", maxHeight: "80%" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <div>
                <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px]">Inscritos</p>
                <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mt-0.5">{resultsEvent.title}</p>
              </div>
              <button onClick={() => setResultsForEvent(null)}><X size={18} color="#9E9E9E" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {(resultsEvent.signups || []).length === 0 ? (
                <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] text-center py-8">Ninguém se inscreveu ainda.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {resultsEvent.signups.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
                        <UserCheck size={15} color="#4D4D4D" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{s.name}</p>
                        {s.phone && <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">{s.phone}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarioScreen;
