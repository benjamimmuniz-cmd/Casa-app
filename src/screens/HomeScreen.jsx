import React, { useState, useEffect, useContext, createContext } from "react";
import {
  Bell,
  ChevronRight,
  Home as HomeLikeIcon,
  Menu,
  MessageCircle,
  Radio,
  ShieldCheck,
  User,
  UserPlus,
  X
} from "lucide-react";
import { FeedContext, UserContext, NotificationsContext, ConnectionsContext, LiveContext, ChatUnreadContext } from "../context/contexts.js";
import { visiblePosts } from "../utils/helpers.js";
import { KIND_LABELS, MENU_GROUPS, TILES } from "../data/constants.js";
import ProgressRing from "../components/ProgressRing.jsx";
import StoriesRow from "../components/StoriesRow.jsx";
import Avatar from "../components/Avatar.jsx";
import { TOTAL_READING_DAYS, getDayReading, formatReadingLabel } from "../data/readingPlan.js";
import { loadReadingProgress } from "../utils/readingProgress.js";

function HomeScreen({ onOpenTile }) {
  const [marked, setMarked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareMsg, setShareMsg] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [readingProgress] = useState(loadReadingProgress);
  const currentDay = Math.min(readingProgress.currentDay, TOTAL_READING_DAYS);
  const readingPct = Math.round(((currentDay - 1) / TOTAL_READING_DAYS) * 100);
  const todaysReadingLabel = formatReadingLabel(getDayReading(currentDay));
  const me = useContext(UserContext);
  const firstName = (me.name || "Visitante").split(" ")[0];
  const allFeedPosts = useContext(FeedContext).posts;
  const meFeedName = me.name || "Você";
  const { notifications } = useContext(NotificationsContext);
  const { connections } = useContext(ConnectionsContext);
  const { liveActive } = useContext(LiveContext);
  const { hasUnread: chatHasUnread } = useContext(ChatUnreadContext);
  const feedPosts = visiblePosts(allFeedPosts, me.uid, connections);
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const pendingRequests = connections.filter(c => c.status === "pending" && c.toUid === me.uid).length;

  const handleShare = () => {
    const text = '"Tudo posso naquele que me fortalece." — Filipenses 4:13';
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    }
    setShareMsg(true);
    setTimeout(() => setShareMsg(false), 1800);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-2 relative" style={{ background: "var(--c-bg)" }}>
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMenu(true)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow-strong)" }}>
            <Menu size={17} color="var(--c-text)" />
          </button>
          <div>
            <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px]">Paz do Senhor,</p>
            <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[22px]">{firstName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onOpenTile("perfil")} className="shrink-0" style={{ boxShadow: "0 1px 3px var(--c-shadow-strong)", borderRadius: "9999px" }}>
            <Avatar name={me.name} uid={me.uid} size={28} fontSize={10} />
          </button>
          <button onClick={() => onOpenTile("transmissao")} className="relative w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: liveActive ? "#B33B3B" : "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow-strong)" }}>
            <Radio size={13} color={liveActive ? "#F2F2F2" : "var(--c-text)"} />
            {liveActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full flex items-center justify-center" style={{ background: "#F2F2F2", border: "1.5px solid var(--c-surface)" }}>
                <span className="w-1 h-1 rounded-full" style={{ background: "#B33B3B" }} />
              </span>
            )}
          </button>
          <button onClick={() => onOpenTile("chat")} className="relative w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow-strong)" }}>
            <MessageCircle size={13} color="var(--c-text)" />
            {chatHasUnread && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: "#B33B3B", border: "1.5px solid var(--c-surface)" }} />
            )}
          </button>
          <button onClick={() => onOpenTile("notificacoes")} className="relative w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow-strong)" }}>
            <Bell size={13} color="var(--c-text)" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: "#B33B3B", border: "1.5px solid var(--c-surface)" }} />
            )}
          </button>
          <button onClick={() => onOpenTile("amigos-solicitacoes")} className="relative w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow-strong)" }}>
            <UserPlus size={13} color="var(--c-text)" />
            {pendingRequests > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: "#B33B3B", border: "1.5px solid var(--c-surface)" }} />
            )}
          </button>
        </div>
      </div>

      <StoriesRow onPublish={() => onOpenTile("feed")} onShorts={() => onOpenTile("shorts")} />

      <div className="px-6 mb-3 flex items-center justify-between">
        <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px]">Feed da igreja</p>
        <button onClick={() => onOpenTile("feed")} className="text-[12px] flex items-center gap-1" style={{ fontFamily: "Inter", color: "var(--c-accent-2)" }}>
          Ver tudo <ChevronRight size={13} />
        </button>
      </div>

      {feedPosts.slice(0, 7).map(p => (
        <button key={p.id} onClick={() => onOpenTile("feed")} className="block w-full px-6 mb-4">
          {p.image ? (
            <div className="rounded-[28px] overflow-hidden relative w-full" style={{ height: 340, boxShadow: "0 10px 26px rgba(0,0,0,0.18)" }}>
              <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.88) 100%)" }} />
              <div className="absolute top-4 left-4 right-4 flex items-center gap-2.5">
                <Avatar name={p.author} uid={p.authorUid} size={36} fontSize={11} />
                <div className="flex-1 min-w-0 text-left">
                  <p style={{ fontFamily: "Inter", color: "#F2F2F2", fontWeight: 600 }} className="text-[13px] truncate">{p.author}</p>
                  <p style={{ fontFamily: "IBM Plex Mono", color: "rgba(242,242,242,0.75)" }} className="text-[10px]">{p.time}</p>
                </div>
                {p.kind && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full shrink-0" style={{ fontFamily: "Inter", background: "rgba(242,242,242,0.18)", color: "#F2F2F2", backdropFilter: "blur(4px)" }}>
                    {KIND_LABELS[p.kind]}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                {p.text && (
                  <p style={{ fontFamily: "Fraunces", color: "#F2F2F2" }} className="text-[14.5px] leading-snug mb-2 line-clamp-3">{p.text}</p>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <HomeLikeIcon size={17} color="#F2F2F2" fill={p.likes.includes(meFeedName) ? "#2B2B2B" : "none"} />
                    <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[12px]">{p.likes.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle size={17} color="#F2F2F2" />
                    <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[12px]">{p.comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] p-5 text-left" style={{ background: "#000000", boxShadow: "0 10px 26px rgba(0,0,0,0.18)" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <Avatar name={p.author} uid={p.authorUid} size={36} fontSize={11} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#F2F2F2", fontWeight: 600 }} className="text-[13px] truncate">{p.author}</p>
                  <p style={{ fontFamily: "IBM Plex Mono", color: "rgba(242,242,242,0.6)" }} className="text-[10px]">{p.time}</p>
                </div>
                {p.kind && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full shrink-0" style={{ fontFamily: "Inter", background: "rgba(242,242,242,0.1)", color: "#FFFFFF" }}>
                    {KIND_LABELS[p.kind]}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: "Fraunces", color: "#F2F2F2" }} className="text-[17px] leading-snug mb-4 line-clamp-4">{p.text}</p>
              <div className="flex items-center gap-4 pt-3" style={{ borderTop: "1px solid rgba(242,242,242,0.12)" }}>
                <div className="flex items-center gap-1.5">
                  <HomeLikeIcon size={18} color="#FFFFFF" fill={p.likes.includes(meFeedName) ? "#FFFFFF" : "none"} />
                  <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[12.5px]">{p.likes.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={18} color="#FFFFFF" />
                  <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[12.5px]">{p.comments.length}</span>
                </div>
              </div>
            </div>
          )}
        </button>
      ))}

      <div className="mx-6 rounded-3xl p-4 flex items-center justify-between mb-5 mt-2" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
        <div>
          <p style={{ fontFamily: "Inter", color: "var(--c-text-2)" }} className="text-[11px]">Leitura anual · dia {currentDay} de {TOTAL_READING_DAYS}</p>
          <p style={{ fontFamily: "Fraunces", color: "var(--c-text)", fontWeight: 600 }} className="text-[15px] mt-1">{todaysReadingLabel}</p>
          <button onClick={() => onOpenTile("plano")} className="mt-2 text-[12px] flex items-center gap-1" style={{ fontFamily: "Inter", color: "var(--c-accent-2)" }}>
            Continuar leitura <ChevronRight size={13} />
          </button>
        </div>
        <ProgressRing pct={readingPct} />
      </div>


      {showMenu && (
        <div className="absolute inset-0 z-50 flex" onClick={() => setShowMenu(false)}>
          <div className="w-[78%] h-full flex flex-col" style={{ background: "var(--c-bg)", boxShadow: "10px 0 30px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-8 pb-5 flex items-center justify-between shrink-0" style={{ background: "#000000" }}>
              <div>
                <p style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[16px]">Menu</p>
                <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.6)" }} className="text-[11px] mt-0.5">{firstName}</p>
              </div>
              <button onClick={() => setShowMenu(false)}><X size={18} color="#F2F2F2" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {MENU_GROUPS.map(group => (
                <div key={group.label} className="mb-5">
                  <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] uppercase tracking-wide font-semibold px-3 mb-2">{group.label}</p>
                  <div className="flex flex-col gap-1">
                    {group.ids.map(id => {
                      const t = TILES.find(x => x.id === id);
                      if (!t) return null;
                      return (
                        <button key={id} onClick={() => { setShowMenu(false); onOpenTile(id); }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left active:scale-[0.98] transition-transform">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: t.color + "1E" }}>
                            <t.icon size={15} color={t.color} />
                          </div>
                          <span style={{ fontFamily: "Inter", color: "var(--c-text)" }} className="text-[13px]">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mb-2">
                <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] uppercase tracking-wide font-semibold px-3 mb-2">Você</p>
                <button onClick={() => { setShowMenu(false); onOpenTile("perfil"); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left active:scale-[0.98] transition-transform">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#7070701E" }}>
                    <User size={15} color="#707070" />
                  </div>
                  <span style={{ fontFamily: "Inter", color: "var(--c-text)" }} className="text-[13px]">Perfil</span>
                </button>
                {me.role === "master" && (
                  <button onClick={() => { setShowMenu(false); onOpenTile("admin"); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left active:scale-[0.98] transition-transform">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#3E5FBF1E" }}>
                      <ShieldCheck size={15} color="#3E5FBF" />
                    </div>
                    <span style={{ fontFamily: "Inter", color: "var(--c-text)" }} className="text-[13px]">Painel de cadastros</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
