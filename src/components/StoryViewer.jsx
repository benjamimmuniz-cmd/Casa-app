import React, { useContext, useEffect, useRef, useState } from "react";
import { Eye, Music, Send, Trash2, X } from "lucide-react";
import { colorFor, timeAgo } from "../utils/helpers.js";
import { containsBlockedContent } from "../utils/contentFilter.js";
import { UserContext, StoryContext, ProfileNavContext } from "../context/contexts.js";
import { sendChatMessage } from "../utils/chatActions.js";
import Avatar from "./Avatar.jsx";

const DURATION = 15000;
const REACTION_EMOJIS = ["❤️", "🙌", "😂", "😮", "😢", "🙏"];

function StoryViewer({ stories, startIndex, onClose, onFinishAll }) {
  const me = useContext(UserContext);
  const { deleteStory, markViewed, reactToStory } = useContext(StoryContext);
  const { openProfile } = useContext(ProfileNavContext);
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const pausedRef = useRef(false);
  const pausedMsRef = useRef(0);
  const pauseStartRef = useRef(0);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const durationRef = useRef(DURATION);

  const story = stories[index];

  const pause = () => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    pauseStartRef.current = Date.now();
    audioRef.current?.pause();
    videoRef.current?.pause();
  };
  const resume = () => {
    if (!pausedRef.current) return;
    pausedMsRef.current += Date.now() - pauseStartRef.current;
    pausedRef.current = false;
    audioRef.current?.play().catch(() => {});
    videoRef.current?.play().catch(() => {});
  };

  useEffect(() => {
    setProgress(0);
    setReply("");
    setSent(false);
    setShowViewers(false);
    pausedMsRef.current = 0;
    pausedRef.current = false;
    durationRef.current = DURATION;
    const start = Date.now();
    const tick = setInterval(() => {
      if (pausedRef.current) return;
      const elapsed = Date.now() - start - pausedMsRef.current;
      const pct = Math.min(100, (elapsed / durationRef.current) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        goNext();
      }
    }, 50);
    return () => clearInterval(tick);
  }, [index]);

  useEffect(() => {
    if (story) markViewed(story);
  }, [story?.id]);

  const goNext = () => {
    if (index < stories.length - 1) setIndex(i => i + 1);
    else { onFinishAll?.(); onClose(); }
  };
  const goPrev = () => {
    if (index > 0) setIndex(i => i - 1);
  };

  if (!story) return null;

  const isOwnStory = story.authorUid ? story.authorUid === me.uid : story.author === me.name;
  const viewersList = Object.entries(story.viewers || {})
    .map(([uid, v]) => ({ uid, name: v.name, at: v.at, reaction: story.reactions?.[uid]?.emoji }))
    .sort((a, b) => (b.at?.toMillis?.() || 0) - (a.at?.toMillis?.() || 0));
  const viewersCount = viewersList.length;
  const myReaction = story.reactions?.[me.uid]?.emoji;

  const sendReply = async () => {
    if (!reply.trim() || !story.authorUid || sent) return;
    if (containsBlockedContent(reply)) return;
    const text = reply.trim();
    setReply("");
    setSent(true);
    try {
      await sendChatMessage({
        myUid: me.uid, myName: me.name, otherUid: story.authorUid, otherName: story.author, text,
        sharedPost: { author: story.author, image: story.image, text: story.text ? `Story: ${story.text}` : "Respondeu ao seu story" },
      });
    } catch (err) {
      console.error("STORY_REPLY_ERR", err.code, err.message);
    }
  };

  const sendReaction = (emoji) => reactToStory(story, emoji);

  const openDeleteConfirm = () => { pause(); setConfirmDelete(true); };
  const closeDeleteConfirm = () => { resume(); setConfirmDelete(false); };
  const confirmDeleteStory = async () => {
    await deleteStory(story.id);
    setConfirmDelete(false);
    onClose();
  };

  const openViewers = () => { pause(); setShowViewers(true); };
  const closeViewers = () => { resume(); setShowViewers(false); };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: "#000000" }}>
      <div className="flex gap-1.5 px-3 pt-3">
        {stories.map((s, i) => (
          <div key={s.id} className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.3)" }}>
            <div className="h-full rounded-full" style={{
              width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
              background: "#FFFFFF",
              transition: i === index ? "none" : "width 0.15s linear",
            }} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
        <div onClick={() => story.authorUid && openProfile(story.authorUid)} className="flex items-center gap-2.5 flex-1 min-w-0">
          <Avatar name={story.author} uid={story.authorUid} size={36} fontSize={11} />
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: "Inter", color: "#FFFFFF", fontWeight: 600 }} className="text-[13px] truncate">{story.author}</p>
            <p style={{ fontFamily: "IBM Plex Mono", color: "rgba(255,255,255,0.6)" }} className="text-[10px]">{story.time}</p>
          </div>
        </div>
        {isOwnStory && (
          <button onClick={openDeleteConfirm}><Trash2 size={17} color="#FFFFFF" /></button>
        )}
        <button onClick={onClose}><X size={20} color="#FFFFFF" /></button>
      </div>

      {story.musicUrl && (
        <>
          <audio key={story.id} ref={audioRef} src={story.musicUrl} autoPlay />
          <div className="px-4 pb-1 flex justify-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.35)" }}>
              <Music size={11} color="#FFFFFF" />
              <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[11px] max-w-[180px] truncate">{story.musicName || "Música"}</span>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 relative flex items-center justify-center px-6 overflow-hidden">
        {story.video ? (
          <video key={story.id} ref={videoRef} src={story.video} className="absolute inset-0 w-full h-full object-cover"
            autoPlay playsInline
            onLoadedMetadata={(e) => { if (e.target.duration) durationRef.current = e.target.duration * 1000; }} />
        ) : story.image ? (
          <img src={story.image} alt="" className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: `${story.focus?.x ?? 50}% ${story.focus?.y ?? 50}%`,
              transform: `scale(${story.zoom || 1})`, transformOrigin: "center",
            }} />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${colorFor(story.author)}, #000000)` }} />
        )}
        {story.text && (
          <p style={{ fontFamily: "Fraunces", color: "#FFFFFF", fontWeight: 600 }} className="relative text-[22px] leading-snug text-center" >
            {story.text}
          </p>
        )}
        {(story.overlays || []).map(o => (
          <div key={o.id} className="absolute" style={{ left: `${o.x}%`, top: `${o.y}%`, transform: "translate(-50%, -50%)" }}>
            {o.type === "emoji" ? (
              <span style={{ fontSize: 44, lineHeight: 1 }}>{o.content}</span>
            ) : (
              <p className="text-center whitespace-nowrap" style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#FFFFFF", fontSize: 24, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
                {o.content}
              </p>
            )}
          </div>
        ))}
      </div>

      {isOwnStory && story.authorUid && (
        <button onClick={openViewers} className="px-4 pb-6 pt-2 flex items-center gap-1.5 self-start"
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)" }}>
          <Eye size={15} color="#FFFFFF" />
          <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[12.5px]">
            {viewersCount} visualiza{viewersCount === 1 ? "ção" : "ções"}
          </span>
        </button>
      )}

      {!isOwnStory && story.authorUid && (
        <div className="pt-2 pb-6" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)" }}>
          <div className="px-4 pb-2.5 flex items-center gap-2 overflow-x-auto">
            {REACTION_EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => sendReaction(emoji)}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                style={{ background: myReaction === emoji ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)", fontSize: 18 }}>
                {emoji}
              </button>
            ))}
          </div>
          <div className="px-4 flex items-center gap-2.5">
            <input value={reply} onChange={e => setReply(e.target.value)}
              onFocus={pause} onBlur={resume}
              onKeyDown={e => e.key === "Enter" && sendReply()}
              placeholder={sent ? "Enviado!" : `Responder pra ${story.author.split(" ")[0]}...`}
              className="flex-1 min-w-0 px-4 py-2.5 rounded-full outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF" }} />
            {reply.trim() && (
              <button onClick={sendReply} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FFFFFF" }}>
                <Send size={14} color="#000000" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex" style={{ top: 70, bottom: isOwnStory ? 56 : (!story.authorUid ? 0 : 122) }}>
        <button className="flex-1" onClick={goPrev} style={{ background: "transparent" }} />
        <button className="flex-1" onClick={goNext} style={{ background: "transparent" }} />
      </div>

      {confirmDelete && (
        <div className="absolute inset-0 flex items-end z-10" style={{ background: "rgba(0,0,0,0.6)" }} onClick={closeDeleteConfirm}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1.5">Excluir esse story?</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-5">Não tem como desfazer depois.</p>
            <div className="flex gap-2.5">
              <button onClick={closeDeleteConfirm}
                className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D" }}>
                Cancelar
              </button>
              <button onClick={confirmDeleteStory}
                className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewers && (
        <div className="absolute inset-0 flex items-end z-10" style={{ background: "rgba(0,0,0,0.6)" }} onClick={closeViewers}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: "#F2F2F2", maxHeight: "70%" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px]">
                {viewersCount} visualiza{viewersCount === 1 ? "ção" : "ções"}
              </p>
              <button onClick={closeViewers}><X size={18} color="#9E9E9E" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-3.5">
              {viewersList.length === 0 ? (
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-8">Ninguém visualizou ainda.</p>
              ) : viewersList.map(v => (
                <div key={v.uid} className="flex items-center gap-3">
                  <Avatar name={v.name} uid={v.uid} size={34} fontSize={11} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{v.name}</p>
                    <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px]">{timeAgo(v.at)}</p>
                  </div>
                  {v.reaction && <span style={{ fontSize: 20 }}>{v.reaction}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoryViewer;
