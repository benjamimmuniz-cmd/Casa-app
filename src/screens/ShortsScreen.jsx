import React, { useContext, useEffect, useRef, useState } from "react";
import { Bookmark, Clapperboard, Home, MessageCircle, Plus, Send, Share2, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { ShortsContext, UserContext } from "../context/contexts.js";
import Avatar from "../components/Avatar.jsx";
import { extractYoutubeId, youtubeEmbedUrl, youtubeThumbUrl } from "../utils/youtube.js";
import { containsBlockedContent, BLOCKED_CONTENT_MESSAGE } from "../utils/contentFilter.js";

function postToPlayer(iframe, func) {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
}

function ShortItem({ s, muted, isActive, onActiveChange, onToggleLike, onLike, onOpenComments, onShare, onToggleSave, onDelete, liked, saved, isOwn }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [burst, setBurst] = useState(false);
  const lastTapRef = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onLike(s.id);
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    }
    lastTapRef.current = now;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) onActiveChange(s.id);
      });
    }, { threshold: [0, 0.6, 1] });
    io.observe(container);
    return () => io.disconnect();
  }, [s.id, onActiveChange]);

  // O video so pode tocar/ter som quando ele e o item ativo — mesmo que o
  // comando de pausa de um item que saiu de tela chegue atrasado (a API do
  // YouTube demora a ficar pronta as vezes), ele nunca fica com som ligado
  // por engano, evitando dois audios tocando ao mesmo tempo.
  useEffect(() => {
    postToPlayer(iframeRef.current, isActive ? "playVideo" : "pauseVideo");
  }, [isActive]);

  useEffect(() => {
    postToPlayer(iframeRef.current, isActive && !muted ? "unMute" : "mute");
  }, [isActive, muted]);

  return (
    <div ref={containerRef} className="relative w-full shrink-0" style={{ height: "100%", scrollSnapAlign: "start", scrollSnapStop: "always" }}>
      <iframe ref={iframeRef} src={youtubeEmbedUrl(s.videoId)} title={s.text || "Shorts"}
        className="absolute inset-0 w-full h-full" style={{ border: "none", pointerEvents: "none" }}
        allow="autoplay; encrypted-media" />
      <div className="absolute inset-0" onClick={handleTap} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)" }} />
      {burst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Home size={90} className="like-burst" color="#F2F2F2" fill="#F2F2F2" style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-16 p-5 pointer-events-none">
        <div className="flex items-center gap-2.5 mb-2">
          <Avatar name={s.author} uid={s.authorUid} size={36} fontSize={11} />
          <p style={{ fontFamily: "Inter", color: "#F2F2F2", fontWeight: 600 }} className="text-[13px] truncate">{s.author}</p>
        </div>
        {s.text && <p style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[13px] leading-snug">{s.text}</p>}
      </div>

      <div className="absolute bottom-5 right-4 flex flex-col items-center gap-5">
        <button onClick={() => onToggleLike(s.id)} className="flex flex-col items-center gap-1">
          <Home size={26} color="#F2F2F2" fill={liked ? "#2B2B2B" : "none"} />
          <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[11px]">{s.likes.length}</span>
        </button>
        <button onClick={() => onOpenComments(s.id)} className="flex flex-col items-center gap-1">
          <MessageCircle size={26} color="#F2F2F2" />
          <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[11px]">{s.comments.length}</span>
        </button>
        <button onClick={() => onShare(s)} className="flex flex-col items-center gap-1">
          <Share2 size={24} color="#F2F2F2" />
        </button>
        <button onClick={() => onToggleSave(s.id)} className="flex flex-col items-center gap-1">
          <Bookmark size={24} color="#F2F2F2" fill={saved ? "#F2F2F2" : "none"} />
        </button>
        {isOwn && (
          <button onClick={() => onDelete(s)} className="flex flex-col items-center gap-1">
            <Trash2 size={22} color="#F2F2F2" />
          </button>
        )}
      </div>
    </div>
  );
}

function ShortsScreen({ onBack }) {
  const me = useContext(UserContext);
  const ME = me.name || "Você";
  const { shorts, addShort, toggleLike: ctxToggleLike, likeOnly: ctxLikeOnly, toggleSave: ctxToggleSave, addComment: ctxAddComment, deleteShort } = useContext(ShortsContext);
  const [muted, setMuted] = useState(true);
  const [activeShortId, setActiveShortId] = useState(null);
  const [openComments, setOpenComments] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newText, setNewText] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [deleteConfirmShort, setDeleteConfirmShort] = useState(null);
  const [commentError, setCommentError] = useState("");
  const [publishError, setPublishError] = useState("");

  const confirmDeleteShort = async () => {
    if (!deleteConfirmShort) return;
    await deleteShort(deleteConfirmShort.id);
    setDeleteConfirmShort(null);
  };

  const toggleLike = (id) => ctxToggleLike(id, ME);
  const likeOnly = (id) => ctxLikeOnly(id, ME);
  const toggleSave = (id) => ctxToggleSave(id, ME);

  const shareShort = async (s) => {
    const shareText = `${s.author} — Shorts Casa: ${s.text || "Confira esse vídeo"}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Igreja do Nazareno A Casa", text: shareText }); } catch (e) {}
    } else {
      alert("Link copiado! Pronto pra compartilhar: " + shareText);
    }
  };

  const addComment = (id) => {
    if (!commentDraft.trim()) return;
    setCommentError("");
    if (containsBlockedContent(commentDraft)) { setCommentError(BLOCKED_CONTENT_MESSAGE); return; }
    ctxAddComment(id, { id: "c" + Date.now(), author: ME, text: commentDraft.trim() });
    setCommentDraft("");
  };

  const videoId = extractYoutubeId(newUrl.trim());

  const publish = async () => {
    if (!videoId || publishing) return;
    setPublishError("");
    if (containsBlockedContent(newText)) { setPublishError(BLOCKED_CONTENT_MESSAGE); return; }
    setPublishing(true);
    try {
      await addShort({ author: ME, authorUid: me.uid, videoId, sourceUrl: newUrl.trim(), text: newText.trim() });
      setNewUrl("");
      setNewText("");
      setShowAdd(false);
    } catch (err) {
      console.error("SHORT_PUBLISH_ERR", err.code, err.message);
    } finally {
      setPublishing(false);
    }
  };

  const commentShort = shorts.find(s => s.id === openComments);

  useEffect(() => {
    if (shorts.length && !shorts.some(s => s.id === activeShortId)) setActiveShortId(shorts[0].id);
  }, [shorts, activeShortId]);

  return (
    <div className="flex-1 relative overflow-hidden" style={{ background: "#000000" }}>
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-6 pb-3" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)" }}>
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#F2F2F2" }}>← Início</button>
        <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#F2F2F2" }} className="text-[15px]">Shorts</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setMuted(m => !m)}>
            {muted ? <VolumeX size={18} color="#F2F2F2" /> : <Volume2 size={18} color="#F2F2F2" />}
          </button>
          <button onClick={() => setShowAdd(true)}>
            <Plus size={20} color="#F2F2F2" />
          </button>
        </div>
      </div>

      {shorts.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-10 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(242,242,242,0.1)" }}>
            <Clapperboard size={26} color="#F2F2F2" />
          </div>
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#F2F2F2" }} className="text-[16px]">Nenhum Shorts ainda</p>
          <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }} className="text-[12.5px]">
            Vídeos curtos e verticais da igreja aparecem aqui. Seja o primeiro a publicar!
          </p>
          <button onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 rounded-full text-[13px] font-semibold" style={{ fontFamily: "Inter", background: "#F2F2F2", color: "#000000" }}>
            Publicar Shorts
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col overflow-y-auto" style={{ scrollSnapType: "y mandatory" }}>
          {shorts.map(s => (
            <ShortItem key={s.id} s={s} muted={muted} isActive={s.id === activeShortId} onActiveChange={setActiveShortId} isOwn={s.authorUid === me.uid}
              liked={s.likes.includes(ME)} saved={(s.saved || []).includes(ME)}
              onToggleLike={toggleLike} onLike={likeOnly} onOpenComments={setOpenComments} onShare={shareShort} onToggleSave={toggleSave} onDelete={setDeleteConfirmShort} />
          ))}
        </div>
      )}

      {showAdd && (
        <div className="absolute inset-0 flex items-end z-20" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Novo Shorts</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mb-4">Cole o link de um vídeo do YouTube (Shorts fica melhor, formato vertical)</p>
            {videoId ? (
              <div className="relative mb-3 rounded-2xl overflow-hidden" style={{ height: 200 }}>
                <img src={youtubeThumbUrl(videoId)} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setNewUrl("")} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <X size={13} color="#F2F2F2" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 mb-3 rounded-2xl" style={{ height: 100, background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
                <Clapperboard size={22} color="#9E9E9E" />
                <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Cole o link abaixo</span>
              </div>
            )}
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://youtube.com/shorts/..."
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            {newUrl.trim() && !videoId && (
              <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[11px] mb-3 -mt-1.5">Não reconheci esse link do YouTube.</p>
            )}
            <textarea value={newText} onChange={e => { setNewText(e.target.value); setPublishError(""); }} placeholder="Escreva uma legenda..." rows={2}
              className="w-full px-4 py-3 rounded-xl mb-1 outline-none text-[13px] resize-none"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            {publishError && (
              <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[11px] mb-3">{publishError}</p>
            )}
            <button onClick={publish} disabled={!videoId || publishing}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: videoId && !publishing ? "#000000" : "#E3E3E3", color: videoId && !publishing ? "#FFFFFF" : "#9E9E9E", fontFamily: "Inter" }}>
              {publishing ? "Publicando..." : "Publicar Shorts"}
            </button>
          </div>
        </div>
      )}

      {commentShort && (
        <div className="absolute inset-0 flex items-end z-20" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setOpenComments(null)}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: "#F2F2F2", maxHeight: "70%" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px]">Comentários</p>
              <button onClick={() => setOpenComments(null)}><X size={18} color="#9E9E9E" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-3">
              {commentShort.comments.length === 0 ? (
                <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] text-center py-8">Seja o primeiro a comentar.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {commentShort.comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <Avatar name={c.author} size={28} fontSize={9} />
                      <div className="rounded-2xl px-3 py-2 flex-1" style={{ background: "#FFFFFF" }}>
                        <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[11.5px]">{c.author}</p>
                        <p style={{ fontFamily: "Inter", color: "#1A1A1A" }} className="text-[12.5px] mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {commentError && (
              <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[11px] px-6 pt-2">{commentError}</p>
            )}
            <div className="px-6 py-4 flex items-center gap-2" style={{ borderTop: "1px solid #D6D6D6" }}>
              <input value={commentDraft} onChange={e => { setCommentDraft(e.target.value); setCommentError(""); }} placeholder="Escreva um comentário..."
                onKeyDown={e => e.key === "Enter" && addComment(commentShort.id)}
                className="flex-1 px-4 py-2.5 rounded-full outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
              <button onClick={() => addComment(commentShort.id)} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#000000" }}>
                <Send size={14} color="#FFFFFF" />
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmShort && (
        <div className="absolute inset-0 flex items-end z-20" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setDeleteConfirmShort(null)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1.5">Excluir esse Shorts?</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-5">Não tem como desfazer depois.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteConfirmShort(null)}
                className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D" }}>
                Cancelar
              </button>
              <button onClick={confirmDeleteShort}
                className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShortsScreen;
