import React, { useContext, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials } from "../utils/helpers.js";

// Bottom sheet pra escolher varias pessoas de uma vez — usado pra criar grupo de chat.
function MultiMemberPickerSheet({ title, confirmLabel, excludeUids, onClose, onConfirm }) {
  const me = useContext(UserContext);
  const [members, setMembers] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      const exclude = new Set([me.uid, ...(excludeUids || [])]);
      setMembers(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => !exclude.has(u.uid)));
    }).catch(err => {
      console.error("MULTI_MEMBER_PICKER_ERR", err.code, err.message);
      setError(err.message);
      setMembers([]);
    });
  }, []);

  const toggle = (u) => {
    setSelected(prev => prev.some(x => x.uid === u.uid) ? prev.filter(x => x.uid !== u.uid) : [...prev, u]);
  };

  return (
    <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="w-full rounded-t-3xl p-6" style={{ background: "var(--c-bg)", maxHeight: "80%", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px]">{title}</p>
          <button onClick={onClose}><X size={18} color="var(--c-faint)" /></button>
        </div>
        <div className="overflow-y-auto flex flex-col gap-1 mb-4">
          {members === null ? (
            <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] text-center py-6">Carregando...</p>
          ) : members.length === 0 ? (
            <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[12px] text-center py-6">
              {error ? `Erro ao carregar: ${error}` : "Ninguém mais cadastrado ainda."}
            </p>
          ) : members.map(u => {
            const checked = selected.some(x => x.uid === u.uid);
            return (
              <button key={u.uid} onClick={() => toggle(u)}
                className="flex items-center gap-3 p-2.5 rounded-xl text-left active:scale-[0.98] transition-transform">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: colorFor(u.nome || "?") }}>
                  {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[11px]">{initials(u.nome || "?")}</span>}
                </div>
                <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px] flex-1 min-w-0 truncate">{u.nome}</p>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: checked ? "var(--c-accent)" : "var(--c-surface-2)", border: checked ? "none" : "1px solid var(--c-border)" }}>
                  {checked && <Check size={12} color="#FFFFFF" />}
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={() => onConfirm(selected)} disabled={selected.length === 0}
          className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
          style={{ background: selected.length ? "var(--c-accent)" : "var(--c-surface-2)", color: selected.length ? "#FFFFFF" : "var(--c-faint)", fontFamily: "Inter" }}>
          {confirmLabel || `Continuar${selected.length ? ` (${selected.length})` : ""}`}
        </button>
      </div>
    </div>
  );
}

export default MultiMemberPickerSheet;
