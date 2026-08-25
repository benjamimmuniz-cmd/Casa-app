import React, { useContext, useEffect, useState } from "react";
import { Car, ChevronRight, Download, FileSpreadsheet, Search, ShieldCheck, Users, X } from "lucide-react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, fmtDateBR, initials, ROLE_LABELS } from "../utils/helpers.js";

const ROLE_OPTIONS = [
  { value: "member", label: "Membro", desc: "Acesso normal, sem telas de liderança." },
  { value: "junta", label: "Junta", desc: "Libera o Painel de cadastros e o Check-in da Área Infantil." },
  { value: "lideranca", label: "Liderança", desc: "Mesmo acesso da Junta." },
];

function toCsvValue(v) {
  const s = (v ?? "").toString().replace(/"/g, '""');
  return `"${s}"`;
}

function fmtCreatedAt(ts) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function AdminScreen({ onBack }) {
  const me = useContext(UserContext);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleTarget, setRoleTarget] = useState(null);
  const [savingRole, setSavingRole] = useState(false);

  const changeRole = (uid, role) => {
    setSavingRole(true);
    updateDoc(doc(db, "users", uid), { role })
      .then(() => {
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
        setRoleTarget(null);
      })
      .catch(err => console.error("ROLE_CHANGE_ERR", err.code, err.message))
      .finally(() => setSavingRole(false));
  };

  useEffect(() => {
    getDocs(collection(db, "users"))
      .then(snap => {
        const list = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setUsers(list);
      })
      .catch(() => setError("Não foi possível carregar os cadastros. Verifique sua permissão de acesso."));
  }, []);

  const buildExportRows = () => {
    const header = ["Nome", "E-mail", "Nascimento", "Profissão", "Cargo", "Possui carro", "Placa", "Membro da igreja", "Cadastrado em"];
    const rows = users.map(u => [
      u.nome || "", u.email || "", fmtDateBR(u.nascimento) || "", u.profissao || "", ROLE_LABELS[u.role] || "Membro",
      u.possuiCarro ? "Sim" : "Não", u.placa || "",
      u.membro ? "Sim" : "Não", fmtCreatedAt(u.createdAt),
    ]);
    return [header, ...rows];
  };

  const exportCsv = () => {
    const csv = buildExportRows().map(r => r.map(toCsvValue).join(",")).join("\n");
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

  const exportExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet(buildExportRows());
    ws["!cols"] = [{ wch: 24 }, { wch: 26 }, { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cadastros");
    XLSX.writeFile(wb, `cadastros-casa-app-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
          <div className="px-6 mb-3">
            <div className="rounded-2xl p-4" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} color="var(--c-muted)" />
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Total de cadastrados</p>
              </div>
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[24px]">{users.length}</p>
            </div>
          </div>
          <div className="px-6 mb-5 flex items-center gap-2.5">
            <button onClick={exportExcel} disabled={users.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-[12.5px] font-semibold"
              style={{ fontFamily: "Inter", background: "var(--c-accent)", color: "#FFFFFF", opacity: users.length === 0 ? 0.5 : 1 }}>
              <FileSpreadsheet size={15} /> Exportar Excel
            </button>
            <button onClick={exportCsv} disabled={users.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-[12.5px] font-semibold"
              style={{ fontFamily: "Inter", background: "var(--c-surface)", color: "var(--c-text)", border: "1px solid var(--c-border)", opacity: users.length === 0 ? 0.5 : 1 }}>
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
              <button key={u.uid} onClick={() => setRoleTarget(u)}
                className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
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
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    {(u.role === "master" || u.role === "junta" || u.role === "lideranca") && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full inline-block mb-1" style={{ fontFamily: "IBM Plex Mono", background: "#3E5FBF22", color: "var(--c-accent-2)" }}>{ROLE_LABELS[u.role]}</span>
                    )}
                    <p style={{ fontFamily: "IBM Plex Mono", color: "var(--c-faint)" }} className="text-[10px]">{fmtCreatedAt(u.createdAt)}</p>
                  </div>
                  <ChevronRight size={15} color="var(--c-faint)" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {roleTarget && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setRoleTarget(null)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "var(--c-bg)" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px] mb-1">Cargo de {roleTarget.nome || roleTarget.email}</p>
            <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] mb-4">Junta e Liderança liberam o Painel de cadastros e o Check-in da Área Infantil.</p>
            <div className="flex flex-col gap-2">
              {ROLE_OPTIONS.map(opt => {
                const current = roleTarget.role === opt.value || (opt.value === "lideranca" && roleTarget.role === "master") || (!roleTarget.role && opt.value === "member");
                return (
                  <button key={opt.value} disabled={savingRole} onClick={() => changeRole(roleTarget.uid, opt.value)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left"
                    style={{ background: current ? "var(--c-accent)" : "var(--c-surface)", border: current ? "none" : "1px solid var(--c-border)" }}>
                    <div>
                      <p style={{ fontFamily: "Inter", color: current ? "#FFFFFF" : "var(--c-text)", fontWeight: 600 }} className="text-[13px]">{opt.label}</p>
                      <p style={{ fontFamily: "Inter", color: current ? "rgba(255,255,255,0.75)" : "var(--c-muted)" }} className="text-[10.5px] mt-0.5">{opt.desc}</p>
                    </div>
                    {current && <ShieldCheck size={16} color="#FFFFFF" />}
                  </button>
                );
              })}
            </div>
            {roleTarget.uid === me.uid && (
              <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[11px] mt-4 text-center">Cuidado: isso é o seu próprio cadastro.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminScreen;
