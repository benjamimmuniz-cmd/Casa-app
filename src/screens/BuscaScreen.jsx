import React, { useContext, useEffect, useState } from "react";
import { CalendarDays, Film, Search, ShoppingBag, Tag, User, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { ProfileNavContext } from "../context/contexts.js";
import Avatar from "../components/Avatar.jsx";

// Busca única do app: procura em pessoas, mensagens, produtos da loja/cantina
// e eventos de uma vez só. Busca tudo uma vez ao abrir a tela (sem listener
// ligado o tempo todo) e filtra do lado do cliente enquanto digita.
function BuscaScreen({ onBack, onOpenTile }) {
  const { openProfile, openMensagem } = useContext(ProfileNavContext);
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "mensagens")),
      getDocs(collection(db, "storeProducts")),
      getDocs(collection(db, "cantinaProducts")),
      getDocs(collection(db, "eventos")),
    ]).then(([usersSnap, mensagensSnap, storeSnap, cantinaSnap, eventosSnap]) => {
      setData({
        users: usersSnap.docs.map(d => ({ uid: d.id, ...d.data() })),
        mensagens: mensagensSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        storeProducts: storeSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        cantinaProducts: cantinaSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        eventos: eventosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      });
    }).catch(err => {
      console.error("BUSCA_ERR", err.code, err.message);
      setData({ users: [], mensagens: [], storeProducts: [], cantinaProducts: [], eventos: [] });
    });
  }, []);

  const q = query.trim().toLowerCase();
  const has = (...vals) => vals.some(v => (v || "").toLowerCase().includes(q));

  const results = !data || !q ? null : {
    pessoas: data.users.filter(u => has(u.nome, u.profissao)).slice(0, 8),
    mensagens: data.mensagens.filter(m => has(m.title, m.speaker)).slice(0, 8),
    lojaProdutos: data.storeProducts.filter(p => has(p.name, p.desc)).slice(0, 8),
    cantinaProdutos: data.cantinaProducts.filter(p => has(p.name, p.desc)).slice(0, 8),
    eventos: data.eventos.filter(e => has(e.title)).slice(0, 8),
  };

  const totalResults = results ? Object.values(results).reduce((s, arr) => s + arr.length, 0) : 0;

  const Section = ({ title, icon: Icon, items, render }) => items.length === 0 ? null : (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Icon size={13} color="#9E9E9E" />
        <p style={{ fontFamily: "Inter", color: "#707070", fontWeight: 600 }} className="text-[11.5px]">{title}</p>
      </div>
      <div className="flex flex-col gap-2">
        {items.map(render)}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Buscar</h1>
        <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Pessoas, mensagens, produtos e eventos, tudo num lugar só</p>
      </div>

      <div className="px-6 mb-5">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Search size={16} color="#9E9E9E" />
          <input value={query} onChange={e => setQuery(e.target.value)} autoFocus placeholder="Buscar em toda a Casa..."
            className="flex-1 outline-none text-[14px] bg-transparent" style={{ fontFamily: "Inter", color: "#000000" }} />
          {query && <button onClick={() => setQuery("")}><X size={15} color="#9E9E9E" /></button>}
        </div>
      </div>

      <div className="px-6 pb-28">
        {!data ? (
          <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-10">Carregando...</p>
        ) : !q ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <Search size={22} color="#D6D6D6" className="mx-auto mb-2" />
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Comece a digitar pra buscar</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Nenhum resultado pra "{query.trim()}".</p>
          </div>
        ) : (
          <>
            <Section title="Pessoas" icon={User} items={results.pessoas} render={u => (
              <button key={u.uid} onClick={() => openProfile(u.uid)}
                className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Avatar name={u.nome} uid={u.uid} size={38} fontSize={12} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{u.nome || "Sem nome"}</p>
                  {u.profissao && <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">{u.profissao}</p>}
                </div>
              </button>
            )} />

            <Section title="Mensagens" icon={Film} items={results.mensagens} render={m => (
              <button key={m.id} onClick={() => openMensagem(m.id)}
                className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#B33B3B1E" }}>
                  <Film size={15} color="#B33B3B" />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{m.title}</p>
                  {m.speaker && <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">{m.speaker}</p>}
                </div>
              </button>
            )} />

            <Section title="Casa Store" icon={ShoppingBag} items={results.lojaProdutos} render={p => (
              <button key={p.id} onClick={() => onOpenTile("store")}
                className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: p.image ? "#E8E8E8" : (p.color || "#8A8A8A") + "1E" }}>
                  {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <ShoppingBag size={15} color={p.color || "#8A8A8A"} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{p.name}</p>
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">Casa Store</p>
                </div>
              </button>
            )} />

            <Section title="Casa Cantina" icon={Tag} items={results.cantinaProdutos} render={p => (
              <button key={p.id} onClick={() => onOpenTile("cantina")}
                className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: p.image ? "#E8E8E8" : (p.color || "#2B2B2B") + "1E" }}>
                  {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Tag size={15} color={p.color || "#2B2B2B"} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{p.name}</p>
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">Casa Cantina</p>
                </div>
              </button>
            )} />

            <Section title="Eventos" icon={CalendarDays} items={results.eventos} render={ev => (
              <button key={ev.id} onClick={() => onOpenTile("calendario")}
                className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#2626261E" }}>
                  <CalendarDays size={15} color="#262626" />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{ev.title}</p>
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">Calendário</p>
                </div>
              </button>
            )} />
          </>
        )}
      </div>
    </div>
  );
}

export default BuscaScreen;
