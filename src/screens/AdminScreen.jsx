import React, { useEffect, useState } from "react";
import { Car, Download, Search, ShieldCheck, Users, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { colorFor, fmtDateBR, initials } from "../utils/helpers.js";

function toCsvValue(v) {
  const s = (v ?? "").toString().replace(/"/g, '""');
  return `"${s}"`;
}

function fmtCreatedAt(ts) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function AdminScreen({ onBack }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDocs(collection(db, "users"))
      .then(snap => {
        const list = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setUsers(list);
      })
      .catch(() => setError("Não foi possível carregar os cadastros. Verifique sua permissão de acesso."));
  }, []);

  const exportCsv = () => {
    const header = ["Nome", "E-mail", "Nascimento", "Profissão", "Possui carro", "Placa", "Membro da igreja", "Cadastrado em"];
    const rows = users.map(u => [
      u.nome || "", u.email || "", fmtDateBR(u.nascimento) || "", u.profissao || "",
      u.possuiCarro ? "Sim" : "Não", u.placa || "",
      u.membro ? "Sim" : "Não", fmtCreatedAt(u.createdAt),
    ]);
    const csv = [header, ...rows].map(r => r.map(toCsvValue).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cadastros-casa-app-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "var(--c-bg)" }}>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#3E5FBF1E" }}>
          <ShieldCheck size={20} color="var(--c-accent-2)" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[20px]">Painel de cadastros</h1>
          <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11.5px] mt-0.5">Acesso restrito à liderança</p>
        </div>
      </div>

      {error && (
        <div className="mx-6 rounded-2xl p-4 mb-5" style={{ background: "#B33B3B1E" }}>
          <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[12.5px]">{error}</p>
        </div>
      )}

      {users === null && !error && (
        <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] text-center py-10">Carregando cadastros...</p>
      )}

      {users && (
        <>
          <div className="px-6 mb-5 flex items-center gap-3">
            <div className="flex-1 rounded-2xl p-4" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} color="var(--c-muted)" />
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Total de cadastrados</p>
              </div>
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[24px]">{users.length}</p>
            </div>
            <button onClick={exportCsv} disabled={users.length === 0}
              className="flex items-center gap-2 px-4 py-4 rounded-2xl text-[12.5px] font-semibold shrink-0"
              style={{ fontFamily: "Inter", background: "var(--c-accent)", color: "#FFFFFF", opacity: users.length === 0 ? 0.5 : 1 }}>
              <Download size={15} /> Exportar CSV
            </button>
          </div>

          <div className="px-6 mb-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
              <Search size={15} color="var(--c-faint)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou placa"
                className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "var(--c-text)" }} />
              {search && <button onClick={() => setSearch("")}><X size={14} color="var(--c-faint)" /></button>}
            </div>
          </div>

          <div className="px-6 pb-10 flex flex-col gap-2.5">
            {users.filter(u => {
              const q = search.trim().toUpperCase();
              if (!q) return true;
              return (u.nome || "").toUpperCase().includes(q) || (u.placa || "").toUpperCase().includes(q);
            }).map(u => (
              <div key={u.uid} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: colorFor(u.nome || u.email || "?") }}>
                  {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[12px]">{initials(u.nome || "?")}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px] truncate">{u.nome || "Sem nome"}</p>
                  <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px] truncate">{u.email}</p>
                  {u.possuiCarro && (
                    <div className="flex items-center gap-1 mt-1">
                      <Car size={10} color="#3B6D8A" />
                      <span style={{ fontFamily: "IBM Plex Mono", color: "#3B6D8A" }} className="text-[10px]">{u.placa || "sem placa informada"}</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {u.role === "master" && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full inline-block mb-1" style={{ fontFamily: "IBM Plex Mono", background: "#3E5FBF22", color: "var(--c-accent-2)" }}>master</span>
                  )}
                  <p style={{ fontFamily: "IBM Plex Mono", color: "var(--c-faint)" }} className="text-[10px]">{fmtCreatedAt(u.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminScreen;
