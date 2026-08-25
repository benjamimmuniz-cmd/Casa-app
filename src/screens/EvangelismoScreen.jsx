import React, { useState, useEffect, useContext, createContext } from "react";
import {
  ChevronRight,
  Clock,
  Compass,
  HandHeart,
  Home,
  MapPin,
  Phone,
  X
} from "lucide-react";
import { UserContext } from "../context/contexts.js";
import { colorFor, getMonthGrid, initials } from "../utils/helpers.js";
import { EVANG_DOACAO_TIPOS } from "../data/constants.js";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function EvangelismoScreen({ onBack }) {
  const meName = useContext(UserContext).name || "Alguém da igreja";
  const [innerTab, setInnerTab] = useState("familias");

  const [families, setFamilies] = useState([]);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [openFamilyId, setOpenFamilyId] = useState(null);
  const [familyForm, setFamilyForm] = useState({ name: "", address: "", phone: "", people: "", notes: "" });
  const [familyError, setFamilyError] = useState("");

  const hoje = new Date();
  const YEAR = hoje.getFullYear(), MONTH = hoje.getMonth(), TODAY = hoje.getDate();
  const [events, setEvents] = useState([
    { id: "ev1", day: 22, title: "Evangelismo no Parque", time: "09:00", location: "Parque da Cidade", volunteers: ["Benjamim Muniz"] },
    { id: "ev2", day: 29, title: "Visita ao Bairro Esperança", time: "14:00", location: "Bairro Esperança", volunteers: [] },
  ]);
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [openEventId, setOpenEventId] = useState(null);
  const [eventForm, setEventForm] = useState({ title: "", time: "", location: "" });
  const [eventError, setEventError] = useState("");
  const [volunteerName, setVolunteerName] = useState("");

  const [donations, setDonations] = useState([]);
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [donationForm, setDonationForm] = useState({ donor: "", type: "dinheiro", value: "", description: "" });
  const [donationError, setDonationError] = useState("");

  const weeks = getMonthGrid(YEAR, MONTH);
  const dayEvents = events.filter(e => e.day === selectedDay);
  const eventDays = new Set(events.map(e => e.day));
  const openEvent = events.find(e => e.id === openEventId);
  const openFamily = families.find(f => f.id === openFamilyId);

  const totalDoado = donations.filter(d => d.type === "dinheiro").reduce((sum, d) => sum + (parseFloat(d.value.replace(",", ".")) || 0), 0);

  const handleAddFamily = () => {
    setFamilyError("");
    if (!familyForm.name.trim()) { setFamilyError("Digite o nome da família."); return; }
    setFamilies(prev => [{
      id: "fam" + Date.now(),
      name: familyForm.name.trim(),
      address: familyForm.address.trim(),
      phone: familyForm.phone.trim(),
      people: familyForm.people.trim(),
      notes: familyForm.notes.trim(),
      lastVisit: null,
    }, ...prev]);
    setFamilyForm({ name: "", address: "", phone: "", people: "", notes: "" });
    setShowAddFamily(false);
  };

  const registrarVisita = (id) => {
    setFamilies(prev => prev.map(f => f.id === id ? { ...f, lastVisit: "Hoje" } : f));
  };

  const handleAddEvent = () => {
    setEventError("");
    if (!eventForm.title.trim()) { setEventError("Digite o título do evento."); return; }
    setEvents(prev => [...prev, {
      id: "ev" + Date.now(),
      day: selectedDay,
      title: eventForm.title.trim(),
      time: eventForm.time.trim() || "—",
      location: eventForm.location.trim(),
      volunteers: [],
    }]);
    setEventForm({ title: "", time: "", location: "" });
    setShowAddEvent(false);
  };

  const addVolunteer = (eventId) => {
    if (!volunteerName.trim()) return;
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, volunteers: [...e.volunteers, volunteerName.trim()] } : e));
    setVolunteerName("");
  };

  const removeVolunteer = (eventId, name) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, volunteers: e.volunteers.filter(v => v !== name) } : e));
  };

  const handleAddDonation = () => {
    setDonationError("");
    if (!donationForm.donor.trim()) { setDonationError("Digite o nome do doador."); return; }
    if (donationForm.type === "dinheiro" && !donationForm.value.trim()) { setDonationError("Digite o valor doado."); return; }
    if (donationForm.type !== "dinheiro" && !donationForm.description.trim()) { setDonationError("Descreva a doação."); return; }
    setDonations(prev => [{
      id: "don" + Date.now(),
      donor: donationForm.donor.trim(),
      type: donationForm.type,
      value: donationForm.value.trim(),
      description: donationForm.description.trim(),
      date: "16/08",
    }, ...prev]);
    setDonationForm({ donor: "", type: "dinheiro", value: "", description: "" });
    setShowAddDonation(false);
  };

  if (openFamily) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenFamilyId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Famílias</button>
        </div>
        <div className="px-6 mt-2">
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">{openFamily.name}</h1>
          {openFamily.address && (
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin size={12} color="#707070" />
              <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">{openFamily.address}</span>
            </div>
          )}
          {openFamily.phone && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Phone size={12} color="#707070" />
              <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">{openFamily.phone}</span>
            </div>
          )}
        </div>

        <div className="px-6 mt-5">
          <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">Última visita</p>
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[14px]">{openFamily.lastVisit || "Nenhuma ainda"}</p>
              </div>
              <button onClick={() => registrarVisita(openFamily.id)}
                className="px-4 py-2.5 rounded-full text-[12px] font-semibold"
                style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                Registrar visita
              </button>
            </div>
            {openFamily.people && (
              <p style={{ fontFamily: "Inter", color: "#4D4D4D", borderTop: "1px solid #F0EAD9", paddingTop: 12 }} className="text-[12.5px]">
                {openFamily.people} pessoa(s) na casa
              </p>
            )}
          </div>
        </div>

        <div className="px-6 mt-5 pb-8">
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-2">Notas</p>
          <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: openFamily.notes ? "#000000" : "#9E9E9E" }} className="text-[13px] leading-relaxed">
              {openFamily.notes || "Nenhuma nota registrada."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (openEvent) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenEventId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Eventos</button>
        </div>
        <div className="px-6 mt-2">
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">{openEvent.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Clock size={12} color="#707070" />
              <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px]">{openEvent.time}</span>
            </div>
            {openEvent.location && (
              <div className="flex items-center gap-1">
                <MapPin size={12} color="#707070" />
                <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px]">{openEvent.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 mt-5 pb-8">
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-2">Escala de voluntários</p>
          <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            {openEvent.volunteers.length === 0 ? (
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12.5px] mb-3">Ninguém escalado ainda.</p>
            ) : (
              <div className="flex flex-col gap-2 mb-3">
                {openEvent.volunteers.map((v, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#F2F2F2" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: colorFor(v) }}>
                        <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[10px]">{initials(v)}</span>
                      </div>
                      <span style={{ fontFamily: "Inter", color: "#000000" }} className="text-[12.5px]">{v}</span>
                    </div>
                    <button onClick={() => removeVolunteer(openEvent.id, v)}>
                      <X size={14} color="#9E9E9E" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={volunteerName} onChange={e => setVolunteerName(e.target.value)} placeholder="Nome do voluntário"
                className="flex-1 px-3 py-2.5 rounded-xl outline-none text-[12.5px]"
                style={{ fontFamily: "Inter", background: "#F2F2F2", border: "1px solid #D6D6D6", color: "#000000" }} />
              <button onClick={() => addVolunteer(openEvent.id)}
                className="px-4 rounded-xl text-[12px] font-semibold"
                style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                Escalar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Evangelismo</h1>
        <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Famílias, eventos e doações da nossa missão</p>
      </div>

      <div className="flex gap-2 px-6 mb-6">
        {[{ id: "familias", label: "Famílias" }, { id: "eventos", label: "Eventos" }, { id: "doacoes", label: "Doações" }].map(t => (
          <button key={t.id} onClick={() => setInnerTab(t.id)}
            className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold transition-colors"
            style={{
              fontFamily: "Inter",
              background: innerTab === t.id ? "#000000" : "#FFFFFF",
              color: innerTab === t.id ? "#F2F2F2" : "#4D4D4D",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {innerTab === "familias" && (
        <div className="px-6 pb-28">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Famílias cadastradas</p>
            <button onClick={() => setShowAddFamily(true)} className="text-[12px] font-semibold" style={{ fontFamily: "Inter", color: "#000000" }}>
              + Cadastrar
            </button>
          </div>
          {families.length === 0 ? (
            <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Nenhuma família cadastrada ainda</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {families.map(f => (
                <button key={f.id} onClick={() => setOpenFamilyId(f.id)}
                  className="w-full flex items-center gap-3 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(f.name) }}>
                    <Home size={17} color="#F2F2F2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{f.name}</p>
                    <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">
                      {f.address || "Sem endereço"} · {f.lastVisit ? "Visita: " + f.lastVisit : "Sem visitas"}
                    </p>
                  </div>
                  <ChevronRight size={16} color="#B5AC9C" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {innerTab === "eventos" && (
        <div className="pb-28">
          <div className="mx-6 rounded-3xl p-4 mb-5" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[14px] mb-3">{MESES[MONTH]} {YEAR}</p>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                <div key={i} className="text-center text-[10px]" style={{ fontFamily: "Inter", color: "#9E9E9E" }}>{d}</div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                {week.map((d, di) => (
                  <button key={di} disabled={!d} onClick={() => d && setSelectedDay(d)}
                    className="aspect-square rounded-xl flex items-center justify-center relative text-[12px]"
                    style={{
                      fontFamily: "Inter",
                      background: d === selectedDay ? "#000000" : "transparent",
                      color: d === selectedDay ? "#F2F2F2" : d === TODAY ? "#454545" : "#4D4D4D",
                      fontWeight: (d === TODAY || d === selectedDay) ? 700 : 400,
                    }}>
                    {d || ""}
                    {d && eventDays.has(d) && d !== selectedDay && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: "#787878" }} />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="px-6">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Dia {selectedDay}</p>
              <button onClick={() => setShowAddEvent(true)} className="text-[12px] font-semibold" style={{ fontFamily: "Inter", color: "#000000" }}>
                + Novo evento
              </button>
            </div>
            {dayEvents.length === 0 ? (
              <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Nenhum evento nesse dia</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {dayEvents.map(ev => (
                  <button key={ev.id} onClick={() => setOpenEventId(ev.id)}
                    className="w-full flex items-center gap-3 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
                    style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
                      <Compass size={18} color="#454545" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{ev.title}</p>
                      <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px]">{ev.time} · {ev.volunteers.length} escalado(s)</p>
                    </div>
                    <ChevronRight size={16} color="#B5AC9C" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {innerTab === "doacoes" && (
        <div className="px-6 pb-28">
          <div className="rounded-3xl p-4 mb-5" style={{ background: "#000000" }}>
            <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.65)" }} className="text-[11px]">Total em doações (dinheiro)</p>
            <p style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[26px] mt-1">
              R$ {totalDoado.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Doações registradas</p>
            <button onClick={() => setShowAddDonation(true)} className="text-[12px] font-semibold" style={{ fontFamily: "Inter", color: "#000000" }}>
              + Registrar
            </button>
          </div>
          {donations.length === 0 ? (
            <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Nenhuma doação registrada ainda</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {donations.map(d => (
                <div key={d.id} className="flex items-center gap-3 rounded-2xl p-3.5" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#B25B4A1E" }}>
                    <HandHeart size={18} color="#B25B4A" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px]">{d.donor}</p>
                    <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px]">
                      {EVANG_DOACAO_TIPOS.find(t => t.id === d.type)?.label}
                      {d.type === "dinheiro" ? " · R$ " + d.value : (d.description ? " · " + d.description : "")} · {d.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddFamily && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAddFamily(false)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-4">Cadastrar família</p>
            <input value={familyForm.name} onChange={e => setFamilyForm({ ...familyForm, name: e.target.value })} placeholder="Nome da família"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input value={familyForm.address} onChange={e => setFamilyForm({ ...familyForm, address: e.target.value })} placeholder="Endereço / bairro"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <div className="flex gap-3 mb-3">
              <input value={familyForm.phone} onChange={e => setFamilyForm({ ...familyForm, phone: e.target.value })} placeholder="Telefone"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
              <input value={familyForm.people} onChange={e => setFamilyForm({ ...familyForm, people: e.target.value.replace(/[^0-9]/g, "") })} placeholder="Nº pessoas" inputMode="numeric"
                className="w-28 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            </div>
            <textarea value={familyForm.notes} onChange={e => setFamilyForm({ ...familyForm, notes: e.target.value })} placeholder="Notas (opcional)" rows={3}
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px] resize-none"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            {familyError && <p style={{ fontFamily: "Inter", color: "#B25B4A" }} className="text-[12px] mb-3 text-center">{familyError}</p>}
            <button onClick={handleAddFamily}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              Cadastrar família
            </button>
          </div>
        </div>
      )}

      {showAddEvent && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAddEvent(false)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Novo evento — dia {selectedDay}</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-4">Evangelismo, visita ou mutirão</p>
            <input value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Ex: Evangelismo no Parque"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <div className="flex gap-3 mb-4">
              <input value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} placeholder="Hora (ex: 09:00)"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
              <input value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Local"
                className="flex-1 px-4 py-3 rounded-xl outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            </div>
            {eventError && <p style={{ fontFamily: "Inter", color: "#B25B4A" }} className="text-[12px] mb-4 text-center">{eventError}</p>}
            <button onClick={handleAddEvent}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              Criar evento
            </button>
          </div>
        </div>
      )}

      {showAddDonation && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAddDonation(false)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-4">Registrar doação</p>
            <input value={donationForm.donor} onChange={e => setDonationForm({ ...donationForm, donor: e.target.value })} placeholder="Nome do doador"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <div className="flex gap-2 mb-3 flex-wrap">
              {EVANG_DOACAO_TIPOS.map(t => (
                <button key={t.id} onClick={() => setDonationForm({ ...donationForm, type: t.id })}
                  className="px-3.5 py-2 rounded-full text-[12px] font-semibold"
                  style={{
                    fontFamily: "Inter",
                    background: donationForm.type === t.id ? "#000000" : "#FFFFFF",
                    color: donationForm.type === t.id ? "#FFFFFF" : "#4D4D4D",
                    border: "1px solid " + (donationForm.type === t.id ? "#000000" : "#D6D6D6"),
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
            {donationForm.type === "dinheiro" ? (
              <input value={donationForm.value} onChange={e => setDonationForm({ ...donationForm, value: e.target.value.replace(/[^0-9,]/g, "") })} placeholder="Valor (ex: 50,00)" inputMode="decimal"
                className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            ) : (
              <input value={donationForm.description} onChange={e => setDonationForm({ ...donationForm, description: e.target.value })} placeholder="O que foi doado"
                className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            )}
            {donationError && <p style={{ fontFamily: "Inter", color: "#B25B4A" }} className="text-[12px] mb-3 text-center">{donationError}</p>}
            <button onClick={handleAddDonation}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
              Registrar doação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvangelismoScreen;
