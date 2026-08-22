import React, { useContext, useEffect } from "react";
import { CalendarDays, Lock, MessageCircle, Tag, UserCheck, UserPlus, Clock } from "lucide-react";
import { UserContext, UsersDirectoryContext, ConnectionsContext, FeedContext } from "../context/contexts.js";
import { colorFor, initials, fmtDateBR, friendUidsOf } from "../utils/helpers.js";

function PersonProfileScreen({ uid, onBack, onOpenChat }) {
  const me = useContext(UserContext);
  const { byUid, ensureUser } = useContext(UsersDirectoryContext);
  const { connections, sendRequest, respond, cancelSent } = useContext(ConnectionsContext);
  const { posts } = useContext(FeedContext);

  useEffect(() => { ensureUser(uid); }, [uid]);
  const person = byUid[uid];
  const isMe = uid === me.uid;
  const friends = friendUidsOf(me.uid, connections);
  const isFriend = isMe || friends.has(uid);

  const connection = connections.find(c => c.fromUid === uid || c.toUid === uid);
  const status = isMe ? null : !connection ? "none" : connection.status === "accepted" ? "friends" : connection.fromUid === me.uid ? "sent" : "received";

  const name = person?.nome || "Membro";
  const postCount = posts.filter(p => (p.authorUid ? p.authorUid === uid : p.author === name)).length;

  if (!person) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center" style={{ background: "var(--c-bg)" }}>
        <button onClick={onBack} className="absolute top-6 left-6 text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>← Voltar</button>
        <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[13px]">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "var(--c-bg)" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>← Voltar</button>
      </div>

      <div className="flex flex-col items-center px-6 mt-3 mb-5">
        <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden mb-3" style={{ background: colorFor(name) }}>
          {person.photo ? (
            <img src={person.photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[26px]">{initials(name)}</span>
          )}
        </div>
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[19px]">{name}</h1>
        {person.profissao && (
          <span className="mt-2 text-[11px] px-3 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#5A5A5A1E", color: "#5C6B45" }}>
            {person.profissao}
          </span>
        )}
      </div>

      {!isMe && (
        <div className="px-6 mb-5 flex gap-2.5">
          {status === "friends" ? (
            <>
              <span className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full text-[13px] font-semibold" style={{ fontFamily: "Inter", background: "var(--c-surface)", color: "#5C6B45" }}>
                <UserCheck size={15} /> Amigos
              </span>
              {onOpenChat && (
                <button onClick={() => onOpenChat({ uid, name, photo: person.photo })}
                  className="w-14 rounded-full flex items-center justify-center" style={{ background: "var(--c-accent)" }}>
                  <MessageCircle size={17} color="#FFFFFF" />
                </button>
              )}
            </>
          ) : status === "sent" ? (
            <button onClick={() => cancelSent(connection.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full text-[13px] font-semibold" style={{ fontFamily: "Inter", background: "var(--c-surface)", color: "var(--c-muted)" }}>
              <Clock size={15} /> Aguardando — cancelar
            </button>
          ) : status === "received" ? (
            <button onClick={() => respond(connection, true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full text-[13px] font-semibold" style={{ fontFamily: "Inter", background: "var(--c-accent)", color: "#FFFFFF" }}>
              <UserCheck size={15} /> Aceitar pedido de amizade
            </button>
          ) : (
            <button onClick={() => sendRequest({ uid, nome: name })}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full text-[13px] font-semibold" style={{ fontFamily: "Inter", background: "var(--c-accent)", color: "#FFFFFF" }}>
              <UserPlus size={15} /> Adicionar como amigo
            </button>
          )}
        </div>
      )}

      {!isFriend ? (
        <div className="px-6 pb-10">
          <div className="rounded-2xl p-6 text-center flex flex-col items-center gap-2" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
            <Lock size={18} color="var(--c-faint)" />
            <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12.5px] leading-relaxed">
              Aceita o pedido de amizade pra ver a bio, publicações e mais informações de {name.split(" ")[0]}.
            </p>
          </div>
        </div>
      ) : (
        <>
          {person.bio && (
            <div className="px-6 mb-5">
              <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] uppercase tracking-wide font-semibold mb-2 px-1">Sobre</p>
              <div className="rounded-2xl p-4" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
                <p style={{ fontFamily: "Inter", color: "var(--c-text)" }} className="text-[13px] leading-relaxed">{person.bio}</p>
              </div>
            </div>
          )}

          <div className="px-6 mb-5">
            <div className="flex items-center justify-between mb-2 px-1">
              <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] uppercase tracking-wide font-semibold">Publicações</p>
              <span style={{ fontFamily: "IBM Plex Mono", color: "var(--c-faint)" }} className="text-[10px]">{postCount}</span>
            </div>
          </div>

          <div className="px-6 mb-8">
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
              {person.nascimento && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#2B2B2B1E" }}>
                    <CalendarDays size={15} color="var(--c-text-2)" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[10.5px]">Data de nascimento</p>
                    <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">{fmtDateBR(person.nascimento)}</p>
                  </div>
                </div>
              )}
              {person.profissao && (
                <div className="flex items-center gap-3" style={person.nascimento ? { borderTop: "1px solid var(--c-divider)", paddingTop: 12 } : {}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#5A5A5A1E" }}>
                    <Tag size={15} color="#5A5A5A" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[10.5px]">Profissão</p>
                    <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">{person.profissao}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PersonProfileScreen;
