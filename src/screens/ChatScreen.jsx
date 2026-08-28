import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCheck, CornerUpLeft, ImageIcon, Reply, Send, Smile, SquarePen, UserPlus, Users, X } from "lucide-react";
import { collection, doc, getDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext, ConnectionsContext } from "../context/contexts.js";
import { timeAgo, friendUidsOf } from "../utils/helpers.js";
import { isOnline } from "../utils/presence.js";
import { containsBlockedContent, BLOCKED_CONTENT_MESSAGE } from "../utils/contentFilter.js";
import { sendChatMessage, markChatRead, setTyping, deleteChatMessage } from "../utils/chatActions.js";
import { addMembersToGroup, createGroupChat, removeMemberFromGroup, sendGroupMessage, updateGroupPhoto } from "../utils/groupChatActions.js";
import { getChatId } from "../utils/chatId.js";
import { compressImage } from "../utils/imageCompress.js";
import MemberPickerSheet from "../components/MemberPickerSheet.jsx";
import MultiMemberPickerSheet from "../components/MultiMemberPickerSheet.jsx";
import ImageLightbox from "../components/ImageLightbox.jsx";
import VoiceRecorder from "../components/VoiceRecorder.jsx";
import AudioPlayButton from "../components/AudioPlayButton.jsx";
import Avatar from "../components/Avatar.jsx";

const EMOJIS = ["😀","😂","😍","🙏","👍","🙌","❤️","🔥","🎉","😢","😮","🤔","👏","✝️","🕊️","😇","🙋","👋","🤗","😅","🥲","😊","💪","✨","📖","🎶","😴","😎","😭","🥳"];

function isUnreadDoc(data, myUid) {
  const senderUid = data.lastMessage?.senderUid;
  if (!senderUid || senderUid === myUid) return false;
  const readAtMs = data.readAt?.[myUid]?.toMillis?.() || 0;
  const updatedMs = data.updatedAt?.toMillis?.() || 0;
  return readAtMs < updatedMs;
}

function ChatScreen({ onBack, initialChat }) {
  const me = useContext(UserContext);
  const { connections } = useContext(ConnectionsContext);
  const friends = friendUidsOf(me.uid, connections);
  const [conversations, setConversations] = useState(null);
  const [groups, setGroups] = useState(null);
  const [openChat, setOpenChat] = useState(initialChat || null); // { id, type: "dm"|"group", name, photo, otherUid?, memberCount? }

  useEffect(() => {
    if (initialChat) setOpenChat(initialChat);
  }, [initialChat]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const [showChoice, setShowChoice] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroupPick, setShowNewGroupPick] = useState(false);
  const [newGroupMembers, setNewGroupMembers] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupPhoto, setNewGroupPhoto] = useState(null);
  const groupPhotoInputRef = useRef(null);
  const groupPhotoEditInputRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [memberList, setMemberList] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [actionTarget, setActionTarget] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const bottomRef = useRef(null);
  const photoInputRef = useRef(null);
  const pressTimerRef = useRef(null);

  const startPressTimer = (m) => {
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => setActionTarget(m), 450);
  };
  const cancelPressTimer = () => clearTimeout(pressTimerRef.current);

  const buildReplySnapshot = (m) => ({
    id: m.id, senderName: m.senderName, text: m.text || "",
    image: m.image || null, audio: !!m.audio, sharedPost: !!m.sharedPost,
  });

  const confirmDeleteMessage = async () => {
    if (!deleteTarget || !openChat) return;
    setDeleteError("");
    const base = openChat.type === "group" ? "chatGroups" : "chats";
    try {
      await deleteChatMessage(base, openChat.id, deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("MSG_DELETE_ERR", err.code, err.message);
      setDeleteError(err.code === "permission-denied" ? "Sem permissão pra excluir — as regras do Firestore ainda não foram atualizadas." : "Não consegui excluir agora. Tenta de novo.");
    }
  };

  useEffect(() => {
    if (!me.uid) return;
    const q = query(collection(db, "chats"), where("participants", "array-contains", me.uid), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setConversations(snap.docs.map(d => {
        const data = d.data();
        const otherUid = data.participants.find(p => p !== me.uid);
        return { id: d.id, type: "dm", otherUid, name: data.participantNames?.[otherUid] || "Alguém", lastText: data.lastMessage?.text || "", time: timeAgo(data.updatedAt), _ts: data.updatedAt?.toMillis?.() || 0, unread: isUnreadDoc(data, me.uid) };
      }));
    }, (err) => { console.error("CONV_ERR", err.code, err.message); setConversations([]); });
    return () => unsub();
  }, [me.uid]);

  useEffect(() => {
    if (!me.uid) return;
    const q = query(collection(db, "chatGroups"), where("participants", "array-contains", me.uid));
    const unsub = onSnapshot(q, snap => {
      setGroups(snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, type: "group", name: data.name, photo: data.photo || null, participants: data.participants || [], memberCount: (data.participants || []).length, lastText: data.lastMessage?.text || "", time: timeAgo(data.updatedAt), _ts: data.updatedAt?.toMillis?.() || 0, unread: isUnreadDoc(data, me.uid) };
      }));
    }, (err) => { console.error("GROUPS_ERR", err.code, err.message); setGroups([]); });
    return () => unsub();
  }, [me.uid]);

  const [chatTab, setChatTab] = useState("conversas");

  const items = useMemo(() => {
    if (conversations === null || groups === null) return null;
    return [...conversations, ...groups].sort((a, b) => b._ts - a._ts);
  }, [conversations, groups]);

  const visibleItems = useMemo(() => {
    if (!items) return [];
    return items.filter(c => (chatTab === "grupos" ? c.type === "group" : c.type === "dm"));
  }, [items, chatTab]);

  const [chatMeta, setChatMeta] = useState(null);
  const [otherLastActive, setOtherLastActive] = useState(null);

  useEffect(() => {
    if (!openChat) { setChatMeta(null); return; }
    const base = openChat.type === "group" ? "chatGroups" : "chats";
    const q = query(collection(db, base, openChat.id, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("MSG_ERR", err.code, err.message));
    const unsubMeta = onSnapshot(doc(db, base, openChat.id), snap => setChatMeta(snap.data() || null), () => {});
    markChatRead(base, openChat.id, me.uid);
    return () => { unsub(); unsubMeta(); setTyping(base, openChat.id, me.uid, false); };
  }, [openChat?.id, openChat?.type]);

  useEffect(() => {
    if (!openChat || openChat.type === "group" || !openChat.otherUid) { setOtherLastActive(null); return; }
    const unsub = onSnapshot(doc(db, "users", openChat.otherUid), snap => setOtherLastActive(snap.data()?.lastActive || null), () => {});
    return () => unsub();
  }, [openChat?.otherUid, openChat?.type]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const startChat = (member) => {
    setShowNewChat(false);
    setOpenChat({ id: getChatId(me.uid, member.uid), type: "dm", otherUid: member.uid, name: member.nome, photo: member.photo });
  };

  const confirmGroupMembers = (selected) => {
    setNewGroupMembers(selected);
    setShowNewGroupPick(false);
  };

  const openMembers = async () => {
    setShowMembers(true);
    if (!openChat) return;
    const snap = await getDoc(doc(db, "chatGroups", openChat.id));
    const data = snap.data();
    if (!data) return;
    setMemberList((data.participants || []).map(uid => ({ uid, name: data.participantNames?.[uid] || "Alguém" })));
  };

  const removeMember = async (uid) => {
    if (!openChat) return;
    try {
      await removeMemberFromGroup(openChat.id, uid);
      setMemberList(prev => prev?.filter(m => m.uid !== uid) || null);
      setOpenChat(prev => prev ? { ...prev, memberCount: prev.memberCount - 1 } : prev);
    } catch (err) {
      console.error("GROUP_REMOVE_ERR", err.code, err.message);
    }
  };

  const leaveGroup = async () => {
    if (!openChat) return;
    try {
      await removeMemberFromGroup(openChat.id, me.uid);
      setShowMembers(false);
      setOpenChat(null);
    } catch (err) {
      console.error("GROUP_LEAVE_ERR", err.code, err.message);
    }
  };

  const confirmAddMembers = async (selected) => {
    setShowAddMembers(false);
    if (!selected.length || !openChat) return;
    try {
      await addMembersToGroup({ groupId: openChat.id, groupName: openChat.name, members: selected, addedByName: me.name });
      setOpenChat(prev => prev ? { ...prev, memberCount: prev.memberCount + selected.length, participants: [...(prev.participants || []), ...selected.map(m => m.uid)] } : prev);
    } catch (err) {
      console.error("GROUP_ADD_MEMBERS_ERR", err.code, err.message);
    }
  };

  const pickGroupPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => setNewGroupPhoto(await compressImage(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || !newGroupMembers?.length) return;
    try {
      const groupId = await createGroupChat({ name: newGroupName.trim(), photo: newGroupPhoto, members: newGroupMembers, createdByUid: me.uid, createdByName: me.name });
      setNewGroupMembers(null);
      setNewGroupName("");
      setOpenChat({ id: groupId, type: "group", name: newGroupName.trim(), photo: newGroupPhoto, memberCount: newGroupMembers.length + 1, participants: [me.uid, ...newGroupMembers.map(m => m.uid)] });
      setNewGroupPhoto(null);
    } catch (err) {
      console.error("GROUP_CREATE_ERR", err.code, err.message);
    }
  };

  const changeGroupPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !openChat) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const photo = await compressImage(reader.result);
      try {
        await updateGroupPhoto(openChat.id, photo);
        setOpenChat(prev => prev ? { ...prev, photo } : prev);
      } catch (err) {
        console.error("GROUP_PHOTO_ERR", err.code, err.message);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const send = async () => {
    if (!draft.trim() || !openChat) return;
    if (containsBlockedContent(draft)) { setSendError(BLOCKED_CONTENT_MESSAGE); return; }
    setSendError("");
    const text = draft.trim();
    const replyTo = replyTarget ? buildReplySnapshot(replyTarget) : null;
    setDraft("");
    setShowEmoji(false);
    setReplyTarget(null);
    setMessages(prev => [...prev, { id: "pending" + Date.now(), senderUid: me.uid, senderName: me.name, text, replyTo, createdAt: null }]);
    try {
      if (openChat.type === "group") {
        await sendGroupMessage({ groupId: openChat.id, myUid: me.uid, myName: me.name, text, replyTo });
      } else {
        await sendChatMessage({ myUid: me.uid, myName: me.name, otherUid: openChat.otherUid, otherName: openChat.name, text, replyTo });
      }
    } catch (err) {
      console.error("SEND_ERR", err.code, err.message);
    }
  };

  const addEmoji = (emoji) => setDraft(prev => prev + emoji);

  const typingTimeoutRef = useRef(null);
  const wasTypingRef = useRef(false);
  const handleDraftChange = (val) => {
    setDraft(val);
    setSendError("");
    if (!openChat) return;
    const base = openChat.type === "group" ? "chatGroups" : "chats";
    if (val.trim() && !wasTypingRef.current) {
      wasTypingRef.current = true;
      setTyping(base, openChat.id, me.uid, true);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      wasTypingRef.current = false;
      setTyping(base, openChat.id, me.uid, false);
    }, 2500);
  };

  // Audio e foto do chat voltam a ir direto como base64 (sem Storage) ate o
  // Storage/Blaze estar configurado — assim continua funcionando sem depender disso.
  const sendAudio = async (audioDataUrl, duration) => {
    if (!openChat) return;
    const replyTo = replyTarget ? buildReplySnapshot(replyTarget) : null;
    setReplyTarget(null);
    setMessages(prev => [...prev, { id: "pending" + Date.now(), senderUid: me.uid, senderName: me.name, text: "", audio: audioDataUrl, audioDuration: duration, replyTo, createdAt: null }]);
    try {
      if (openChat.type === "group") {
        await sendGroupMessage({ groupId: openChat.id, myUid: me.uid, myName: me.name, text: "", audio: audioDataUrl, replyTo });
      } else {
        await sendChatMessage({ myUid: me.uid, myName: me.name, otherUid: openChat.otherUid, otherName: openChat.name, text: "", audio: audioDataUrl, replyTo });
      }
    } catch (err) {
      console.error("SEND_AUDIO_ERR", err.code, err.message);
    }
  };

  const sendPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !openChat) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const image = await compressImage(reader.result);
      const replyTo = replyTarget ? buildReplySnapshot(replyTarget) : null;
      setReplyTarget(null);
      setMessages(prev => [...prev, { id: "pending" + Date.now(), senderUid: me.uid, senderName: me.name, text: "", image, replyTo, createdAt: null }]);
      try {
        if (openChat.type === "group") {
          await sendGroupMessage({ groupId: openChat.id, myUid: me.uid, myName: me.name, text: "", image, replyTo });
        } else {
          await sendChatMessage({ myUid: me.uid, myName: me.name, otherUid: openChat.otherUid, otherName: openChat.name, text: "", image, replyTo });
        }
      } catch (err) {
        console.error("SEND_IMG_ERR", err.code, err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  if (openChat) {
    const isGroup = openChat.type === "group";
    const typingUids = (chatMeta?.typingUids || []).filter(uid => uid !== me.uid);
    const otherTyping = typingUids.length > 0;
    const typingLabel = isGroup
      ? `${typingUids.map(uid => (chatMeta?.participantNames?.[uid] || "Alguém").split(" ")[0]).join(", ")} digitando...`
      : "digitando...";
    return (
      <div className="flex-1 flex flex-col relative min-h-0" style={{ background: "var(--c-bg)" }}>
        <div className="px-6 pt-6 pb-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setOpenChat(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>←</button>
          <button onClick={isGroup ? openMembers : undefined} className="flex items-center gap-3 min-w-0 flex-1 text-left" disabled={!isGroup}>
            <Avatar name={openChat.name} uid={isGroup ? undefined : openChat.otherUid} photo={openChat.photo} isGroup={isGroup} size={36} fontSize={11} />
            <div className="min-w-0">
              <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px] truncate">{openChat.name}</p>
              {otherTyping ? (
                <p style={{ fontFamily: "Inter", color: "var(--c-accent-2)" }} className="text-[10.5px] truncate">{typingLabel}</p>
              ) : isGroup ? (
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[10.5px]">{openChat.memberCount} pessoas · ver membros</p>
              ) : isOnline(otherLastActive) ? (
                <p style={{ fontFamily: "Inter", color: "#4B9B5C" }} className="text-[10.5px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#4B9B5C" }} />
                  Online
                </p>
              ) : null}
            </div>
          </button>
          {isGroup && (
            <button onClick={() => setShowAddMembers(true)} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-surface)" }}>
              <UserPlus size={15} color="var(--c-text-2)" />
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-3 flex flex-col gap-2.5">
          {messages.length === 0 ? (
            <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[12px] text-center py-8">Envie a primeira mensagem.</p>
          ) : messages.map(m => {
            const mine = m.senderUid === me.uid;
            let seen = false;
            if (mine && chatMeta) {
              const readAtMap = chatMeta.readAt || {};
              const otherUids = isGroup ? (chatMeta.participants || []).filter(u => u !== me.uid) : [openChat.otherUid];
              const msgMs = m.createdAt?.toMillis?.() ?? Infinity;
              seen = otherUids.length > 0 && otherUids.every(uid => (readAtMap[uid]?.toMillis?.() || 0) >= msgMs);
            }
            return (
              <div key={m.id} className={`flex items-end gap-1 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && (
                  <button onClick={() => setReplyTarget(m)} className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-transform">
                    <CornerUpLeft size={14} color="var(--c-faint)" />
                  </button>
                )}
                <div className="max-w-[78%] rounded-2xl px-3.5 py-2 select-none"
                  onPointerDown={() => startPressTimer(m)}
                  onPointerUp={cancelPressTimer}
                  onPointerLeave={cancelPressTimer}
                  onPointerCancel={cancelPressTimer}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    background: mine ? "var(--c-accent)" : "var(--c-surface)", boxShadow: mine ? "none" : "0 1px 3px var(--c-shadow)",
                    WebkitTouchCallout: "none", WebkitUserSelect: "none", touchAction: "pan-y",
                  }}>
                  {isGroup && !mine && (
                    <p style={{ fontFamily: "Inter", color: "var(--c-accent-2)", fontWeight: 600 }} className="text-[10.5px] mb-0.5">{m.senderName}</p>
                  )}
                  {m.replyTo && (
                    <div className="rounded-lg px-2.5 py-1.5 mb-1.5" style={{ background: mine ? "rgba(255,255,255,0.16)" : "var(--c-surface-2)", borderLeft: `2px solid ${mine ? "rgba(255,255,255,0.5)" : "var(--c-accent-2)"}` }}>
                      <p style={{ fontFamily: "Inter", color: mine ? "#FFFFFF" : "var(--c-accent-2)", fontWeight: 600 }} className="text-[10px]">{m.replyTo.senderName}</p>
                      <p style={{ fontFamily: "Inter", color: mine ? "rgba(255,255,255,0.8)" : "var(--c-text-2)" }} className="text-[10.5px] truncate">
                        {m.replyTo.text || (m.replyTo.image ? "📷 Foto" : m.replyTo.audio ? "🎤 Áudio" : m.replyTo.sharedPost ? "📎 Post compartilhado" : "")}
                      </p>
                    </div>
                  )}
                  {m.sharedPost && (
                    <div className="rounded-xl p-2.5 mb-1.5" style={{ background: "rgba(255,255,255,0.12)" }}>
                      {m.sharedPost.image && <img src={m.sharedPost.image} alt="" className="w-full rounded-lg mb-1.5" style={{ maxHeight: 120, objectFit: "cover" }} />}
                      <p style={{ fontFamily: "Inter", color: mine ? "#FFFFFF" : "var(--c-text)", fontWeight: 600 }} className="text-[10.5px]">{m.sharedPost.author}</p>
                      {m.sharedPost.text && <p style={{ fontFamily: "Inter", color: mine ? "rgba(255,255,255,0.85)" : "var(--c-text-2)" }} className="text-[11px] mt-0.5 line-clamp-2">{m.sharedPost.text}</p>}
                    </div>
                  )}
                  {m.image && <img src={m.image} alt="" onClick={() => setLightboxImage(m.image)} className="rounded-lg mb-1 cursor-pointer" style={{ maxWidth: 200, maxHeight: 260, objectFit: "cover" }} />}
                  {m.audio && (
                    <div className="flex items-center gap-2 py-1 min-w-[140px]">
                      <AudioPlayButton url={m.audio} size={32} iconSize={14} bg={mine ? "rgba(255,255,255,0.2)" : "var(--c-surface-2)"} color={mine ? "#FFFFFF" : "var(--c-text)"} />
                      <span style={{ fontFamily: "IBM Plex Mono", color: mine ? "rgba(255,255,255,0.8)" : "var(--c-muted)" }} className="text-[11px]">
                        {m.audioDuration ? `${Math.floor(m.audioDuration / 60)}:${String(m.audioDuration % 60).padStart(2, "0")}` : "Áudio"}
                      </span>
                    </div>
                  )}
                  {m.text && <p style={{ fontFamily: "Inter", color: mine ? "#FFFFFF" : "var(--c-text)" }} className="text-[13px]">{m.text}</p>}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <p style={{ fontFamily: "IBM Plex Mono", color: mine ? "rgba(255,255,255,0.6)" : "var(--c-faint)" }} className="text-[9px]">{timeAgo(m.createdAt)}</p>
                    {mine && (seen ? <CheckCheck size={12} color="#7EC0FF" /> : <Check size={12} color="rgba(255,255,255,0.6)" />)}
                  </div>
                </div>
                {mine && (
                  <button onClick={() => setReplyTarget(m)} className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-transform">
                    <CornerUpLeft size={14} color="var(--c-faint)" />
                  </button>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {showEmoji && (
          <div className="px-4 pt-3 pb-1 shrink-0 grid grid-cols-8 gap-1" style={{ borderTop: "1px solid var(--c-border)" }}>
            {EMOJIS.map(em => (
              <button key={em} onClick={() => addEmoji(em)} className="text-[19px] py-1 rounded-lg active:scale-90 transition-transform">{em}</button>
            ))}
          </div>
        )}

        {replyTarget && (
          <div className="px-6 pt-3 flex items-center gap-2.5 shrink-0" style={{ borderTop: "1px solid var(--c-border)" }}>
            <div className="flex-1 min-w-0 rounded-lg px-3 py-2" style={{ background: "var(--c-surface)", borderLeft: "2px solid var(--c-accent-2)" }}>
              <p style={{ fontFamily: "Inter", color: "var(--c-accent-2)", fontWeight: 600 }} className="text-[10.5px]">
                Respondendo a {replyTarget.senderUid === me.uid ? "você mesmo" : replyTarget.senderName}
              </p>
              <p style={{ fontFamily: "Inter", color: "var(--c-text-2)" }} className="text-[11px] truncate">
                {replyTarget.text || (replyTarget.image ? "📷 Foto" : replyTarget.audio ? "🎤 Áudio" : replyTarget.sharedPost ? "📎 Post compartilhado" : "")}
              </p>
            </div>
            <button onClick={() => setReplyTarget(null)} className="shrink-0"><X size={16} color="var(--c-faint)" /></button>
          </div>
        )}

        {sendError && (
          <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[11px] px-6 pt-3">{sendError}</p>
        )}
        <div className="px-6 py-4 flex items-center gap-2 shrink-0" style={{ borderTop: replyTarget ? "none" : "1px solid var(--c-border)" }}>
          {!recordingAudio && (
            <>
              <button onClick={() => setShowEmoji(v => !v)} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: showEmoji ? "var(--c-active-bg)" : "transparent" }}>
                <Smile size={19} color="var(--c-muted)" />
              </button>
              <button onClick={() => photoInputRef.current?.click()} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                <ImageIcon size={19} color="var(--c-muted)" />
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={sendPhoto} />
              <input value={draft} onChange={e => handleDraftChange(e.target.value)} placeholder="Escreva uma mensagem..."
                onFocus={() => setShowEmoji(false)}
                onKeyDown={e => e.key === "Enter" && send()}
                className="flex-1 min-w-0 px-4 py-2.5 rounded-full outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-text)" }} />
            </>
          )}
          {draft.trim() && !recordingAudio ? (
            <button onClick={send} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-accent)" }}>
              <Send size={14} color="#FFFFFF" />
            </button>
          ) : (
            <VoiceRecorder onSend={sendAudio} onRecordingChange={setRecordingAudio} />
          )}
        </div>

        {actionTarget && (
          <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setActionTarget(null)}>
            <div className="w-full rounded-t-3xl p-3" style={{ background: "var(--c-bg)" }} onClick={e => e.stopPropagation()}>
              <button onClick={() => { setReplyTarget(actionTarget); setActionTarget(null); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left">
                <Reply size={17} color="var(--c-text)" />
                <span style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13.5px]">Responder</span>
              </button>
              {actionTarget.senderUid === me.uid && (
                <button onClick={() => { setDeleteTarget(actionTarget); setActionTarget(null); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left">
                  <X size={17} color="#B33B3B" />
                  <span style={{ fontFamily: "Inter", color: "#B33B3B", fontWeight: 600 }} className="text-[13.5px]">Excluir</span>
                </button>
              )}
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => { setDeleteTarget(null); setDeleteError(""); }}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "var(--c-bg)" }} onClick={e => e.stopPropagation()}>
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px] mb-1.5">Excluir mensagem?</p>
              <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] mb-3">Ela some pra todo mundo na conversa. Não tem como desfazer.</p>
              {deleteError && (
                <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[12px] mb-3">{deleteError}</p>
              )}
              <div className="flex gap-2.5">
                <button onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
                  className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "var(--c-surface)", color: "var(--c-text-2)" }}>
                  Cancelar
                </button>
                <button onClick={confirmDeleteMessage}
                  className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddMembers && (
          <MultiMemberPickerSheet title="Adicionar ao grupo" excludeUids={openChat.participants} onClose={() => setShowAddMembers(false)} onConfirm={confirmAddMembers} />
        )}

        {showMembers && (
          <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowMembers(false)}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "var(--c-bg)", maxHeight: "80%", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px]">Membros do grupo</p>
                <button onClick={() => setShowMembers(false)}><X size={18} color="var(--c-faint)" /></button>
              </div>
              <button onClick={() => groupPhotoEditInputRef.current?.click()} className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <Avatar name={openChat.name} photo={openChat.photo} isGroup size={48} fontSize={13} />
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--c-accent)", border: "2px solid var(--c-bg)" }}>
                    <ImageIcon size={10} color="#FFFFFF" />
                  </div>
                </div>
                <p style={{ fontFamily: "Inter", color: "var(--c-accent-2)", fontWeight: 600 }} className="text-[12.5px]">Trocar foto do grupo</p>
                <input ref={groupPhotoEditInputRef} type="file" accept="image/*" className="hidden" onChange={changeGroupPhoto} />
              </button>
              <div className="overflow-y-auto flex flex-col gap-1 mb-3">
                {memberList === null ? (
                  <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] text-center py-6">Carregando...</p>
                ) : memberList.map(m => (
                  <div key={m.uid} className="flex items-center gap-3 p-2.5 rounded-xl">
                    <Avatar name={m.name} uid={m.uid} size={36} fontSize={11} />
                    <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px] flex-1 min-w-0 truncate">{m.name}{m.uid === me.uid ? " (você)" : ""}</p>
                    {m.uid !== me.uid && (
                      <button onClick={() => removeMember(m.uid)} className="px-2.5 py-1.5 rounded-full text-[10.5px] font-semibold shrink-0" style={{ fontFamily: "Inter", background: "#B33B3B1A", color: "#B33B3B" }}>
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={leaveGroup} className="w-full py-3 rounded-full text-[12.5px] font-semibold" style={{ fontFamily: "Inter", background: "var(--c-surface)", color: "#B33B3B" }}>
                Sair do grupo
              </button>
            </div>
          </div>
        )}

        <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col min-h-0" style={{ background: "var(--c-bg)" }}>
      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[22px]">Chat</h1>
        <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] mt-1">Converse com os membros da igreja</p>
      </div>

      <div className="px-6 mb-4 flex gap-2">
        <button onClick={() => setChatTab("conversas")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: chatTab === "conversas" ? "var(--c-accent)" : "var(--c-surface)", color: chatTab === "conversas" ? "#FFFFFF" : "var(--c-text-2)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
          Conversas
        </button>
        <button onClick={() => setChatTab("grupos")} className="flex-1 py-2 rounded-2xl text-[12px] font-semibold"
          style={{ fontFamily: "Inter", background: chatTab === "grupos" ? "var(--c-accent)" : "var(--c-surface)", color: chatTab === "grupos" ? "#FFFFFF" : "var(--c-text-2)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
          Grupos
        </button>
      </div>

      <div className="px-6 pb-28 flex flex-col gap-2">
        {items === null ? (
          <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] text-center py-8">Carregando...</p>
        ) : visibleItems.length === 0 ? (
          <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[12px] text-center py-8">
            {chatTab === "conversas" ? "Nenhuma conversa ainda." : "Nenhum grupo ainda."} Toque em + pra começar.
          </p>
        ) : visibleItems.map(c => (
          <button key={`${c.type}-${c.id}`} onClick={() => setOpenChat(c.type === "group" ? { id: c.id, type: "group", name: c.name, photo: c.photo, memberCount: c.memberCount, participants: c.participants } : { id: c.id, type: "dm", otherUid: c.otherUid, name: c.name })}
            className="flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
            style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
            <Avatar name={c.name} uid={c.type === "dm" ? c.otherUid : undefined} photo={c.photo} isGroup={c.type === "group"} size={44} fontSize={12} />
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: c.unread ? 700 : 600 }} className="text-[13px] truncate">{c.name}</p>
              <p style={{ fontFamily: "Inter", color: c.unread ? "var(--c-text)" : "var(--c-muted)", fontWeight: c.unread ? 600 : 400 }} className="text-[11.5px] truncate">{c.lastText}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span style={{ fontFamily: "IBM Plex Mono", color: "var(--c-faint)" }} className="text-[9.5px]">{c.time}</span>
              {c.unread && <span className="w-2 h-2 rounded-full" style={{ background: "var(--c-accent)" }} />}
            </div>
          </button>
        ))}
      </div>
      </div>

      <button onClick={() => setShowChoice(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "var(--c-accent)", boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}>
        <SquarePen size={22} color="#FFFFFF" />
      </button>

      {showChoice && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowChoice(false)}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: "var(--c-bg)" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px] mb-4 px-1">O que você quer fazer?</p>
            <button onClick={() => { setShowChoice(false); setShowNewChat(true); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl mb-2.5 text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#3E5FBF1E" }}>
                <SquarePen size={16} color="var(--c-accent-2)" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Nova conversa</p>
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Fale com uma pessoa</p>
              </div>
            </button>
            <button onClick={() => { setShowChoice(false); setShowNewGroupPick(true); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
                <Users size={16} color="var(--c-text)" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Novo grupo</p>
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">GR, discipulado, amigos... quem você escolher</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {showNewChat && (
        <MemberPickerSheet title="Nova conversa" onClose={() => setShowNewChat(false)} onPick={startChat}
          allowedUids={friends} emptyMessage="Você ainda não tem amigos aceitos. Peça amizade em Amigos pra poder conversar." />
      )}

      {showNewGroupPick && (
        <MultiMemberPickerSheet title="Adicionar pessoas ao grupo" onClose={() => setShowNewGroupPick(false)} onConfirm={confirmGroupMembers} />
      )}

      {newGroupMembers && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => { setNewGroupMembers(null); setNewGroupPhoto(null); }}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "var(--c-bg)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px]">Nome do grupo</p>
              <button onClick={() => { setNewGroupMembers(null); setNewGroupPhoto(null); }}><X size={18} color="var(--c-faint)" /></button>
            </div>
            <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11.5px] mb-3">{newGroupMembers.length + 1} pessoas no grupo</p>
            <button onClick={() => groupPhotoInputRef.current?.click()} className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ background: "var(--c-surface)", border: "1px dashed var(--c-border)" }}>
                {newGroupPhoto ? <img src={newGroupPhoto} alt="" className="w-full h-full object-cover" /> : <Users size={20} color="var(--c-faint)" />}
              </div>
              <p style={{ fontFamily: "Inter", color: "var(--c-accent-2)", fontWeight: 600 }} className="text-[12.5px]">{newGroupPhoto ? "Trocar foto" : "Adicionar foto (opcional)"}</p>
              <input ref={groupPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={pickGroupPhoto} />
            </button>
            <input autoFocus value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Ex: GR Jardim das Flores"
              onKeyDown={e => e.key === "Enter" && createGroup()}
              className="w-full px-4 py-3 rounded-xl mb-5 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-text)" }} />
            <button onClick={createGroup} disabled={!newGroupName.trim()}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: newGroupName.trim() ? "var(--c-accent)" : "var(--c-surface-2)", color: newGroupName.trim() ? "#FFFFFF" : "var(--c-faint)", fontFamily: "Inter" }}>
              Criar grupo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatScreen;
