import React, { useState, useContext, useEffect } from "react";
import { Search, UserPlus, UserCheck, UserX, X, Clock } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext, ConnectionsContext, ProfileNavContext } from "../context/contexts.js";
import { colorFor, initials } from "../utils/helpers.js";

function AmigosScreen({ onBack, initialTab = "amigos" }) {
  const me = useContext(UserContext);
  const { connections, sendRequest, respond, cancelSent } = useContext(ConnectionsContext);
  const { openProfile } = useContext(ProfileNavContext);
  const [tab, setTab] = useState(initialTab); // amigos | solicitacoes | buscar
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState(null);

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      setMembers(snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(u => u.uid !== me.uid));
    });
  }, [me.uid]);

  const memberByUid = (uid) => members?.find(m => m.uid === uid);

  const friends = connections
    .filter(c => c.status === "accepted")
    .map(c => (c.fromUid === me.uid ? { uid: c.toUid, name: c.toName } : { uid: c.fromUid, name: c.fromName }));

  const received = connections.filter(c => c.status === "pending" && c.toUid === me.uid);
  const sent = connections.filter(c => c.status === "pending" && c.fromUid === me.uid);

  const statusWith = (uid) => {
    const c = connections.find(x => x.fromUid === uid || x.toUid === uid);
    if (!c) return null;
    if (c.status === "accepted") return "friends";
    return c.fromUid === me.uid ? "sent" : "received";
  };

  const searchResults = (members || []).filter(m => (m.nome || "").toLowerCase().includes(search.trim().toLowerCase()));

  const MemberRow = ({ uid, name, photo, role, right }) => (
    <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <button onClick={() => uid && openProfile(uid)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: colorFor(name || "?") }}>
          {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[12px]">{initials(name || "?")}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{name}</p>
          {role && <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px] truncate">{role}</p>}
        </div>
      </button>
      {right}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#0000000F", color: "#616161" }}>
          {friends.length} amigos
        </span>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Amigos</h1>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-1">Conecte-se com a igreja</p>
      </div>

      <div className="px-6 mb-5 flex gap-2">
        <button onClick={() => setTab("amigos")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: tab === "amigos" ? "#000000" : "#FFFFFF", color: tab === "amigos" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Amigos
        </button>
        <button onClick={() => setTab("solicitacoes")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold relative"
          style={{ fontFamily: "Inter", background: tab === "solicitacoes" ? "#000000" : "#FFFFFF", color: tab === "solicitacoes" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Solicitações
          {received.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#B33B3B" }}>
              <span style={{ fontFamily: "IBM Plex Mono", color: "#FFFFFF", fontSize: 9 }}>{received.length}</span>
            </span>
          )}
        </button>
        <button onClick={() => setTab("buscar")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: tab === "buscar" ? "#000000" : "#FFFFFF", color: tab === "buscar" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          Buscar
        </button>
      </div>

      {tab === "amigos" && (
        <div className="px-6 pb-10 flex flex-col gap-2.5">
          {friends.length === 0 ? (
            <div className="rounded-2xl py-10 text-center" style={{ background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Você ainda não tem amigos. Vá em "Buscar" pra se conectar.</p>
            </div>
          ) : friends.map(f => {
            const member = memberByUid(f.uid);
            return <MemberRow key={f.uid} uid={f.uid} name={f.name} photo={member?.photo} role={member?.profissao} />;
          })}
        </div>
      )}

      {tab === "solicitacoes" && (
        <div className="px-6 pb-10">
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-2">Recebidas</p>
          <div className="flex flex-col gap-2.5 mb-6">
            {received.length === 0 ? (
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11.5px]">Nenhuma solicitação recebida.</p>
            ) : received.map(c => (
              <MemberRow key={c.id} uid={c.fromUid} name={c.fromName} photo={memberByUid(c.fromUid)?.photo} role={memberByUid(c.fromUid)?.profissao}
                right={
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => respond(c, true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#5C6B45" }}>
                      <UserCheck size={14} color="#FFFFFF" />
                    </button>
                    <button onClick={() => respond(c, false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#E3E3E3" }}>
                      <UserX size={14} color="#4D4D4D" />
                    </button>
                  </div>
                } />
            ))}
          </div>

          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-2">Enviadas</p>
          <div className="flex flex-col gap-2.5">
            {sent.length === 0 ? (
              <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11.5px]">Nenhuma solicitação enviada.</p>
            ) : sent.map(c => (
              <MemberRow key={c.id} uid={c.toUid} name={c.toName} photo={memberByUid(c.toUid)?.photo} role={memberByUid(c.toUid)?.profissao}
                right={
                  <button onClick={() => cancelSent(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full shrink-0" style={{ background: "#F2F2F2" }}>
                    <Clock size={12} color="#9E9E9E" />
                    <span style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">Aguardando</span>
                  </button>
                } />
            ))}
          </div>
        </div>
      )}

      {tab === "buscar" && (
        <div className="px-6 pb-10">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <Search size={15} color="#9E9E9E" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar membros da igreja"
              className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#000000" }} />
            {search && <button onClick={() => setSearch("")}><X size={14} color="#9E9E9E" /></button>}
          </div>
          {members === null ? (
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11.5px] text-center py-6">Carregando...</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {searchResults.length === 0 ? (
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11.5px] text-center py-6">Ninguém encontrado.</p>
              ) : searchResults.map(m => {
                const st = statusWith(m.uid);
                return (
                  <MemberRow key={m.uid} uid={m.uid} name={m.nome} photo={m.photo} role={m.profissao}
                    right={
                      st === "friends" ? (
                        <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full shrink-0" style={{ background: "#5C6B451A" }}>
                          <UserCheck size={12} color="#5C6B45" />
                          <span style={{ fontFamily: "Inter", color: "#5C6B45" }} className="text-[10.5px]">Amigos</span>
                        </span>
                      ) : st === "sent" ? (
                        <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full shrink-0" style={{ background: "#F2F2F2" }}>
                          <Clock size={12} color="#9E9E9E" />
                          <span style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">Aguardando</span>
                        </span>
                      ) : st === "received" ? (
                        <button onClick={() => setTab("solicitacoes")} className="px-2.5 py-1.5 rounded-full shrink-0 text-[10.5px]" style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                          Respondeu
                        </button>
                      ) : (
                        <button onClick={() => sendRequest(m)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full shrink-0" style={{ background: "#000000" }}>
                          <UserPlus size={12} color="#FFFFFF" />
                          <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[10.5px]">Conectar</span>
                        </button>
                      )
                    } />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AmigosScreen;
