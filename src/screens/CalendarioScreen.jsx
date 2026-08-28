import React, { useState, useEffect, useContext } from "react";
import {
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  ImageIcon,
  MapPin,
  Plus,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { collection, addDoc, arrayUnion, arrayRemove, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db } from "../firebase.js";
import { FeedContext, UserContext } from "../context/contexts.js";
import { catColor, getMonthGrid, todayISO } from "../utils/helpers.js";
import { compressImage } from "../utils/imageCompress.js";
import { broadcastNotification } from "../utils/notifyAll.js";
import { CATEGORIES } from "../data/constants.js";

function toCsvValue(v) {
  const s = (v ?? "").toString().replace(/"/g, '""');
  return `"${s}"`;
}

function CalendarioScreen({ onBack }) {
  const me = useContext(UserContext);
  const meName = me.name || "Alguém da igreja";
  const { addPost } = useContext(FeedContext);
  const [events, setEvents] = useState([]);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0].id, image: null, signupEnabled: false });
  const [formDays, setFormDays] = useState([{ date: todayISO(), time: "" }]);
  const [postToFeed, setPostToFeed] = useState(true);
  const [signupForEvent, setSignupForEvent] = useState(null);
  const [signupForm, setSignupForm] = useState({ name: meName, phone: "" });
  const [resultsForEvent, setResultsForEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "eventos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  const YEAR = viewDate.getFullYear();
  const MONTH = viewDate.getMonth();
  const isoOf = (day) => `${YEAR}-${String(MONTH + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const monthLabel = (() => {
    const s = viewDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();
  const weekdayShort = (iso) => {
    const s = new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const fmtDia = (iso) => {
    const [, m, d] = iso.split("-");
    return `${Number(d)}/${m}`;
  };

  const weeks = getMonthGrid(YEAR, MONTH);
  const eventsSorted = [...events].sort((a, b) => (a.days?.[0]?.date || "").localeCompare(b.days?.[0]?.date || ""));
  const dayEvents = eventsSorted
    .filter(e => (e.days || []).some(d => d.date === selectedDate))
    .map(e => ({ ...e, _time: e.days.find(d => d.date === selectedDate).time }))
    .sort((a, b) => a._time.localeCompare(b._time));
  const eventDaySet = new Set(events.flatMap(e => (e.days || []).map(d => d.date)));

  const changeMonth = (delta) => {
    const nd = new Date(YEAR, MONTH + delta, 1);
    setViewDate(nd);
    setSelectedDate(`${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}-01`);
  };

  const toggleReminder = (ev) => {
    const mine = (ev.reminders || []).includes(me.uid);
    updateDoc(doc(db, "eventos", ev.id), { reminders: mine ? arrayRemove(me.uid) : arrayUnion(me.uid) })
      .catch(err => console.error("EVENTO_REMINDER_ERR", err.code, err.message));
  };

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => compressImage(reader.result, 900, 0.7).then(img => setForm(f => ({ ...f, image: img })));
    reader.readAsDataURL(file);
  };

  const addFormDay = () => setFormDays(prev => [...prev, { date: selectedDate, time: "" }]);
  const removeFormDay = (idx) => setFormDays(prev => prev.filter((_, i) => i !== idx));
  const updateFormDay = (idx, field, value) => setFormDays(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));

  const summarizeDays = (days) => {
    if (days.length === 1) return `dia ${fmtDia(days[0].date)} às ${days[0].time}`;
    return `${days.length} datas, a partir de ${fmtDia(days[0].date)}`;
  };

  const handleAdd = async () => {
    if (!form.title.trim() || saving) return;
    const cleanDays = formDays
      .filter(d => d.date)
      .map(d => ({ date: d.date, time: d.time.trim() || "—" }))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (cleanDays.length === 0) return;
    setSaving(true);
    try {
      const title = form.title.trim();
      const docRef = await addDoc(collection(db, "eventos"), {
        days: cleanDays, title, location: "", category: form.category,
        image: form.image || null, signupEnabled: form.signupEnabled, signups: [], reminders: [],
        authorUid: me.uid, authorName: meName, createdAt: serverTimestamp(),
      });
      if (postToFeed) {
        const texto = `📅 Novo evento: ${title} — ${summarizeDays(cleanDays)}. Não perca!`;
        addPost({ author: meName, authorUid: me.uid, text: texto, image: form.image || null, kind: "evento" })
          .catch(err => console.error("EVENTO_FEED_POST_ERR", err.code, err.message));
        broadcastNotification(texto, { excludeUid: me.uid, link: { tile: "calendario" } })
          .catch(err => console.error("EVENTO_BROADCAST_ERR", err.code, err.message));
      }
      setForm({ title: "", category: CATEGORIES[0].id, image: null, signupEnabled: false });
      setFormDays([{ date: selectedDate, time: "" }]);
      setShowAdd(false);
    } catch (err) {
      console.error("EVENTO_ADD_ERR", err.code, err.message);
    }
    setSaving(false);
  };

  const mySignup = (ev) => (ev.signups || []).find(s => s.uid === me.uid);

  const submitSignup = () => {
    if (!signupForm.name.trim()) return;
    const ev = events.find(e => e.id === signupForEvent);
    if (!ev) return;
    const newSignups = [...(ev.signups || []).filter(s => s.uid !== me.uid), { uid: me.uid, name: signupForm.name.trim(), phone: signupForm.phone.trim() }];
    updateDoc(doc(db, "eventos", ev.id), { signups: newSignups }).catch(err => console.error("EVENTO_SIGNUP_ERR", err.code, err.message));
    setSignupForEvent(null);
    setSignupForm({ name: meName, phone: "" });
  };

  const resultsEvent = events.find(e => e.id === resultsForEvent);
  const signupEvent = events.find(e => e.id === signupForEvent);

  const buildSignupRows = (ev) => {
    const header = ["Nome", "Celular"];
    const rows = (ev.signups || []).map(s => [s.name || "", s.phone || ""]);
    return [header, ...rows];
  };

  const slugFileName = (title) => (title || "evento").replace(/[\\/:*?"<>|]/g, "-");

  const exportSignupsCsv = (ev) => {
    const csv = buildSignupRows(ev).map(r => r.map(toCsvValue).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscritos-${slugFileName(ev.title)}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportSignupsExcel = (ev) => {
    const ws = XLSX.utils.aoa_to_sheet(buildSignupRows(ev));
    ws["!cols"] = [{ wch: 26 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inscritos");
    XLSX.writeFile(wb, `inscritos-${slugFileName(ev.title)}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const cancelSignup = (ev) => {
    const newSignups = (ev.signups || []).filter(s => s.uid !== me.uid);
    updateDoc(doc(db, "eventos", ev.id), { signups: newSignups }).catch(err => console.error("EVENTO_SIGNUP_CANCEL_ERR", err.code, err.message));
  };

  return (
    <div className="flex-1 relative flex flex-col min-h-0" style={{ background: "#F2F2F2" }}>
      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#0000000F", color: "#616161" }}>
          {events.length} eventos
        </span>
      </div>

      <div className="px-6 mt-1 mb-4 flex items-center justify-between">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">{monthLabel}</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <ChevronLeft size={16} color="#4D4D4D" />
          </button>
          <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <ChevronRight size={16} color="#4D4D4D" />
          </button>
        </div>
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
              const iso = isoOf(d);
              const isSelected = iso === selectedDate;
              const isToday = iso === todayISO();
              const hasEvents = eventDaySet.has(iso);
              return (
                <button key={di} onClick={() => setSelectedDate(iso)} className="flex flex-col items-center py-1">
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
          Eventos · {fmtDia(selectedDate)}{selectedDate === todayISO() ? " (hoje)" : ""}
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
                        <span key={d.date} className="text-[9.5px] px-2 py-0.5 rounded-full"
                          style={{
                            fontFamily: "IBM Plex Mono",
                            background: d.date === selectedDate ? "#000000" : "#0000000A",
                            color: d.date === selectedDate ? "#FFFFFF" : "#707070",
                          }}>
                          {weekdayShort(d.date)} {d.time}
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
                      {ev.authorUid === me.uid ? (
                        <button onClick={() => setResultsForEvent(ev.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#0000000F" }}>
                          <Users size={12} color="#4D4D4D" />
                          <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[10.5px]">{(ev.signups || []).length} inscritos · ver lista</span>
                        </button>
                      ) : mySignup(ev) ? (
                        <button onClick={() => cancelSignup(ev)}
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
                <button onClick={() => toggleReminder(ev)} className="shrink-0 mt-0.5">
                  {(ev.reminders || []).includes(me.uid)
                    ? <Bell size={17} color="#2B2B2B" fill="#2B2B2B" />
                    : <BellOff size={17} color="#9E9E9E" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <button onClick={() => { setFormDays([{ date: selectedDate, time: "" }]); setShowAdd(true); }}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#2B2B2B", boxShadow: "0 6px 16px rgba(43,43,43,0.4)" }}>
        <span style={{ color: "#F2F2F2", fontSize: 26, lineHeight: 1 }}>+</span>
      </button>

      {showAdd && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl p-6 overflow-y-auto" style={{ background: "#F2F2F2", maxHeight: "88%" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Novo evento</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Pode ter mais de uma data, cada uma com seu horário — útil pra eventos tipo sexta 19h, sábado e domingo 18h.</p>

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
            <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] mb-2">Datas e horários</p>
            <div className="flex flex-col gap-2 mb-2">
              {formDays.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="date" value={d.date} onChange={e => updateFormDay(i, "date", e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl outline-none text-[13px]"
                    style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
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
              <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Adicionar outra data</span>
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
              <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Publicar no Feed e notificar todo mundo</span>
            </label>
            <label className="flex items-center gap-2.5 mb-5 cursor-pointer">
              <input type="checkbox" checked={form.signupEnabled} onChange={e => setForm({ ...form, signupEnabled: e.target.checked })}
                className="w-4 h-4 rounded" style={{ accentColor: "#000000" }} />
              <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Abrir lista de inscrição (só você vê quem se inscreveu)</span>
            </label>
            <button onClick={handleAdd} disabled={!form.title.trim() || saving}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: form.title.trim() && !saving ? "#000000" : "#E3E3E3", color: form.title.trim() && !saving ? "#FFFFFF" : "#9E9E9E", fontFamily: "Inter" }}>
              {saving ? "Salvando..." : "Adicionar ao calendário"}
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
              {(resultsEvent.signups || []).length > 0 && (
                <div className="flex items-center gap-2.5 mb-4">
                  <button onClick={() => exportSignupsExcel(resultsEvent)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold"
                    style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                    <FileSpreadsheet size={14} /> Exportar Excel
                  </button>
                  <button onClick={() => exportSignupsCsv(resultsEvent)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold"
                    style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#000000", border: "1px solid #E3E3E3" }}>
                    <Download size={14} /> Exportar CSV
                  </button>
                </div>
              )}
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
