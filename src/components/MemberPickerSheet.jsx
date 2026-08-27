import React, { useContext, useEffect, useState } from "react";
import { X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials } from "../utils/helpers.js";

// Bottom sheet reutilizável pra escolher um membro cadastrado — usado pra iniciar
// conversas no Chat e pra encaminhar posts do Feed. "allowedUids", quando
// informado (ex: só amigos aceitos), restringe a lista a esses uids também.
function MemberPickerSheet({ title, onClose, onPick, excludeSelf = true, allowedUids, emptyMessage }) {
  const me = useContext(UserContext);
  const [members, setMembers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      let list = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      if (excludeSelf) list = list.filter(u => u.uid !== me.uid);
      if (allowedUids) list = list.filter(u => allowedUids.has(u.uid));
      setMembers(list);
    }).catch(err => {
      console.error("MEMBER_PICKER_ERR", err.code, err.message);
      setError(err.message);
      setMembers([]);
    });
  }, []);

  return (
    <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="w-full rounded-t-3xl p-6" style={{ background: "var(--c-bg)", maxHeight: "75%", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px]">{title}</p>
          <button onClick={onClose}><X size={18} color="var(--c-faint)" /></button>
        </div>
        <div className="overflow-y-auto flex flex-col gap-1">
          {members === null ? (
            <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] text-center py-6">Carregando...</p>
          ) : members.length === 0 ? (
            <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[12px] text-center py-6">
              {error ? `Erro ao carregar: ${error}` : (emptyMessage || "Ninguém mais cadastrado ainda.")}
            </p>
          ) : members.map(u => (
            <button key={u.uid} onClick={() => onPick(u)}
              className="flex items-center gap-3 p-2.5 rounded-xl text-left active:scale-[0.98] transition-transform">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: colorFor(u.nome || "?") }}>
                {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[11px]">{initials(u.nome || "?")}</span>}
              </div>
              <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">{u.nome}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MemberPickerSheet;
