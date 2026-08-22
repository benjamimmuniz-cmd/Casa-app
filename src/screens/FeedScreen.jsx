import React, { useState, useEffect, useContext, createContext } from "react";
import {
  Bookmark,
  Crop,
  Home,
  ImageIcon,
  MessageCircle,
  Music2,
  Play,
  Send,
  Share2,
  Trash2,
  Video,
  X
} from "lucide-react";
import PostCarousel from "../components/PostCarousel.jsx";
import ImageFramer from "../components/ImageFramer.jsx";
import ImageLightbox from "../components/ImageLightbox.jsx";
import Avatar from "../components/Avatar.jsx";
import { FeedContext, UserContext, ConnectionsContext, ProfileNavContext } from "../context/contexts.js";
import { KIND_LABELS, ME_FEED } from "../data/constants.js";
import { compressImage } from "../utils/imageCompress.js";
import { uploadVideo } from "../utils/mediaUpload.js";
import { visiblePosts } from "../utils/helpers.js";
import { sendChatMessage } from "../utils/chatActions.js";
import AudioPlayButton from "../components/AudioPlayButton.jsx";
import MusicPickerSheet from "../components/MusicPickerSheet.jsx";
import MemberPickerSheet from "../components/MemberPickerSheet.jsx";
import StoriesRow from "../components/StoriesRow.jsx";

function FeedScreen({ onBack }) {
  const meUser = useContext(UserContext);
  const ME_FEED = meUser.name || "Você";
  const meUid = meUser.uid;
  const { posts: allPosts, addPost, toggleLike: ctxToggleLike, likePost: ctxLikePost, toggleSave: ctxToggleSave, addComment: ctxAddComment, deletePost } = useContext(FeedContext);
  const { connections } = useContext(ConnectionsContext);
  const { openProfile } = useContext(ProfileNavContext);
  const posts = visiblePosts(allPosts, meUid, connections);
  const goToProfile = (e, authorUid) => {
    e.stopPropagation();
    if (authorUid) openProfile(authorUid);
  };
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [imagePositions, setImagePositions] = useState([]);
  const [framingIndex, setFramingIndex] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoError, setVideoError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [musicTrack, setMusicTrack] = useState(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [openComments, setOpenComments] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [publishing, setPublishing] = useState(false);

  const handlePhotoPick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    removeVideo();
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = async () => {
        const compressed = await compressImage(reader.result);
        setImages(prev => [...prev, compressed]);
        setImagePositions(prev => [...prev, { x: 50, y: 50 }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePositions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleVideoPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setVideoError("");
    setImages([]);
    setImagePositions([]);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
    setVideoError("");
  };

  const publish = async () => {
    if (!text.trim() && !images.length && !videoFile && !musicTrack) return;
    setPublishing(true);
    let videoUrl = null;
    if (videoFile) {
      try {
        setUploadProgress(0);
        videoUrl = await uploadVideo(videoFile, `feed-videos/${meUid}/${Date.now()}-${videoFile.name}`, setUploadProgress);
      } catch (err) {
        setVideoError(err.message || "Não consegui enviar o vídeo. Tenta de novo.");
        setPublishing(false);
        setUploadProgress(null);
        return;
      }
    }
    const imagePositionStrings = imagePositions.map(p => `${p.x}% ${p.y}%`);
    await addPost({ author: ME_FEED, text: text.trim(), images, imagePositions: imagePositionStrings, video: videoUrl, musicName: musicTrack?.title || "", musicUrl: musicTrack?.url || null });
    setText("");
    setImages([]);
    setImagePositions([]);
    removeVideo();
    setMusicTrack(null);
    setPublishing(false);
    setUploadProgress(null);
  };

  const toggleSave = (postId) => ctxToggleSave(postId, ME_FEED);

  const [shareSheetPost, setShareSheetPost] = useState(null);
  const [forwardTarget, setForwardTarget] = useState(null);
  const [forwardDone, setForwardDone] = useState(false);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const sharePost = (p) => setShareSheetPost(p);

  const confirmDeletePost = async () => {
    if (!deleteConfirmPost) return;
    await deletePost(deleteConfirmPost.id);
    setDeleteConfirmPost(null);
  };

  const shareNative = async (p) => {
    const shareText = `${p.author} — Casa: ${p.text || "Confira essa publicação"}`;
    setShareSheetPost(null);
    if (navigator.share) {
      try { await navigator.share({ title: "Igreja do Nazareno A Casa", text: shareText }); } catch (e) {}
    } else {
      alert("Link copiado! Pronto pra compartilhar: " + shareText);
    }
  };

  const forwardToMember = async (member) => {
    const p = forwardTarget;
    setForwardTarget(null);
    await sendChatMessage({
      myUid: meUid, myName: ME_FEED, otherUid: member.uid, otherName: member.nome,
      sharedPost: { id: p.id, author: p.author, text: p.text, image: p.image || null },
    });
    setForwardDone(true);
    setTimeout(() => setForwardDone(false), 1800);
  };

  const toggleLike = (postId) => ctxToggleLike(postId, ME_FEED);

  const [burstId, setBurstId] = useState(null);
  const likePost = (postId) => {
    ctxLikePost(postId, ME_FEED);
    setBurstId(postId);
    setTimeout(() => setBurstId(prev => (prev === postId ? null : prev)), 700);
  };

  // dblclick não é confiável em toque de celular — detecta 2 toques manualmente
  const lastTapRef = React.useRef({});
  const handleTap = (postId) => {
    const now = Date.now();
    const last = lastTapRef.current[postId] || 0;
    lastTapRef.current[postId] = now;
    if (now - last < 300) likePost(postId);
  };

  const addComment = (postId) => {
    if (!commentDraft.trim()) return;
    ctxAddComment(postId, { id: "c" + Date.now(), author: ME_FEED, text: commentDraft.trim() });
    setCommentDraft("");
  };

  const commentPost = posts.find(p => p.id === openComments);

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "var(--c-bg)" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[22px]">Feed</h1>
        <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] mt-1">O mural da nossa igreja</p>
      </div>

      <StoriesRow />

      <div className="mx-6 rounded-3xl p-4 mb-6" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
        <div className="flex items-start gap-3">
          <Avatar name={ME_FEED} uid={meUid} size={36} fontSize={11} />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Compartilhe algo com a igreja..." rows={2}
            className="flex-1 outline-none text-[13px] resize-none bg-transparent"
            style={{ fontFamily: "Inter", color: "var(--c-text)" }} />
        </div>
        {images.length > 0 && (
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <div key={idx} className="relative shrink-0 rounded-xl overflow-hidden" style={{ width: 84, height: 84 }}>
                <img src={img} alt="Prévia" className="w-full h-full object-cover"
                  style={{ objectPosition: `${imagePositions[idx]?.x ?? 50}% ${imagePositions[idx]?.y ?? 50}%` }} />
                <button onClick={() => setFramingIndex(idx)} className="absolute bottom-1 left-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <Crop size={11} color="#F2F2F2" />
                </button>
                <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <X size={11} color="#F2F2F2" />
                </button>
              </div>
            ))}
            <label className="shrink-0 rounded-xl flex items-center justify-center cursor-pointer" style={{ width: 84, height: 84, background: "var(--c-surface-2)", border: "1px dashed var(--c-border)" }}>
              <ImageIcon size={18} color="var(--c-faint)" />
              <input type="file" accept="image/*" multiple onChange={handlePhotoPick} className="hidden" />
            </label>
          </div>
        )}
        {videoPreview && (
          <div className="relative mt-2 rounded-xl overflow-hidden" style={{ width: 120, height: 120 }}>
            <video src={videoPreview} className="w-full h-full object-cover" muted playsInline />
            <button onClick={removeVideo} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
              <X size={11} color="#F2F2F2" />
            </button>
            {uploadProgress !== null && (
              <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="h-full" style={{ width: `${Math.round(uploadProgress * 100)}%`, background: "var(--c-accent)" }} />
              </div>
            )}
          </div>
        )}
        {videoError && (
          <p style={{ fontFamily: "Inter", color: "#B25B4A" }} className="text-[11.5px] mt-1.5">{videoError}</p>
        )}
        {musicTrack && (
          <div className="flex items-center gap-2.5 mt-2 px-3 py-2 rounded-xl" style={{ background: "var(--c-surface-2)" }}>
            <AudioPlayButton url={musicTrack.url} size={30} iconSize={13} bg="#0000000F" color="var(--c-text)" />
            <span style={{ fontFamily: "Inter", color: "var(--c-text-2)" }} className="text-[12px] flex-1 truncate">{musicTrack.title}</span>
            <button onClick={() => setMusicTrack(null)}><X size={13} color="var(--c-faint)" /></button>
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <ImageIcon size={19} color="var(--c-muted)" />
              <input type="file" accept="image/*" multiple onChange={handlePhotoPick} className="hidden" />
            </label>
            <label className="cursor-pointer">
              <Video size={19} color="var(--c-muted)" />
              <input type="file" accept="video/*" onChange={handleVideoPick} className="hidden" />
            </label>
            <button onClick={() => setShowMusicPicker(true)}>
              <Music2 size={19} color="var(--c-muted)" />
            </button>
          </div>
          <button onClick={publish} disabled={publishing || (!text.trim() && !images.length && !videoFile && !musicTrack)}
            className="px-5 py-2 rounded-full text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: (text.trim() || images.length || videoFile || musicTrack) ? "var(--c-accent)" : "var(--c-surface-2)", color: (text.trim() || images.length || videoFile || musicTrack) ? "#FFFFFF" : "var(--c-faint)" }}>
            {publishing ? (uploadProgress !== null ? `Enviando ${Math.round(uploadProgress * 100)}%...` : "Publicando...") : "Publicar"}
          </button>
        </div>
      </div>

      {showMusicPicker && (
        <MusicPickerSheet onClose={() => setShowMusicPicker(false)} onSelect={(track) => { setMusicTrack(track); setShowMusicPicker(false); }} />
      )}

      {shareSheetPost && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShareSheetPost(null)}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: "var(--c-bg)" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px] mb-4 px-1">Compartilhar post</p>
            <button onClick={() => { setForwardTarget(shareSheetPost); setShareSheetPost(null); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl mb-2.5 text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#3E5FBF1E" }}>
                <Send size={16} color="var(--c-accent-2)" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Enviar no chat</p>
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Encaminha pra alguém da igreja</p>
              </div>
            </button>
            <button onClick={() => shareNative(shareSheetPost)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)", marginBottom: shareSheetPost.authorUid === meUid ? 10 : 0 }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
                <Share2 size={16} color="var(--c-text)" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Compartilhar</p>
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Fora do app</p>
              </div>
            </button>
            {shareSheetPost.authorUid === meUid && (
              <button onClick={() => { setDeleteConfirmPost(shareSheetPost); setShareSheetPost(null); }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#B33B3B1E" }}>
                  <Trash2 size={16} color="#B33B3B" />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", fontWeight: 600, color: "#B33B3B" }} className="text-[13.5px]">Excluir publicação</p>
                  <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Você postou isso, pode remover</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {forwardTarget && (
        <MemberPickerSheet title="Encaminhar pra quem?" onClose={() => setForwardTarget(null)} onPick={forwardToMember} />
      )}

      {deleteConfirmPost && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setDeleteConfirmPost(null)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "var(--c-bg)" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px] mb-1.5">Excluir essa publicação?</p>
            <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] mb-5">Não tem como desfazer depois.</p>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteConfirmPost(null)}
                className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "var(--c-surface)", color: "var(--c-text-2)" }}>
                Cancelar
              </button>
              <button onClick={confirmDeletePost}
                className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />

      {forwardDone && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full z-50" style={{ background: "var(--c-accent)" }}>
          <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[12px] font-semibold">Enviado! ✓</span>
        </div>
      )}

      {framingIndex !== null && (
        <ImageFramer
          image={images[framingIndex]}
          position={imagePositions[framingIndex] || { x: 50, y: 50 }}
          onChange={pos => setImagePositions(prev => prev.map((p, i) => i === framingIndex ? pos : p))}
          onDone={() => setFramingIndex(null)}
        />
      )}

      <div className="px-5 pb-10 flex flex-col gap-7">
        {posts.map(p => {
          const liked = p.likes.includes(ME_FEED);
          const saved = (p.saved || []).includes(ME_FEED);
          const postImages = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
          if (postImages.length || p.video) {
            return (
              <div key={p.id} onClick={() => handleTap(p.id)} className="rounded-[28px] overflow-hidden relative" style={{ height: 480, boxShadow: "0 10px 28px rgba(0,0,0,0.18)" }}>
                {burstId === p.id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Home size={90} className="like-burst" color="#F2F2F2" fill="#F2F2F2" style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} />
                  </div>
                )}
                {p.video ? (
                  <video src={p.video} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <PostCarousel images={postImages} positions={p.imagePositions} onImageClick={setLightboxImage} />
                )}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.9) 100%)" }} />
                <div className="absolute top-4 left-4 right-4 flex items-center gap-2.5">
                  <div onClick={e => goToProfile(e, p.authorUid)} className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Avatar name={p.author} uid={p.authorUid} size={40} fontSize={12} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "Inter", color: "#F2F2F2", fontWeight: 600 }} className="text-[13.5px] truncate">{p.author}</p>
                      <p style={{ fontFamily: "IBM Plex Mono", color: "rgba(242,242,242,0.75)" }} className="text-[10px]">{p.time}</p>
                    </div>
                  </div>
                  {p.video && (
                    <span className="flex items-center gap-1 text-[10.5px] px-2.5 py-1.5 rounded-full shrink-0" style={{ fontFamily: "Inter", background: "rgba(242,242,242,0.18)", color: "#F2F2F2", backdropFilter: "blur(4px)" }}>
                      <Play size={10} color="#F2F2F2" fill="#F2F2F2" /> Vídeo
                    </span>
                  )}
                  {p.kind && (
                    <span className="text-[10.5px] px-3 py-1.5 rounded-full shrink-0" style={{ fontFamily: "Inter", background: "rgba(242,242,242,0.18)", color: "#F2F2F2", backdropFilter: "blur(4px)" }}>
                      {KIND_LABELS[p.kind]}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-16 p-5">
                  {p.text && (
                    <p style={{ fontFamily: "Fraunces", color: "#F2F2F2" }} className="text-[16px] leading-snug mb-3">{p.text}</p>
                  )}
                  {p.musicName && (
                    <div className="flex items-center gap-1.5 mb-1">
                      {p.musicUrl ? (
                        <AudioPlayButton url={p.musicUrl} size={20} iconSize={10} bg="rgba(242,242,242,0.2)" color="#F2F2F2" />
                      ) : (
                        <Music2 size={12} color="#F2F2F2" />
                      )}
                      <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[11.5px] truncate">{p.musicName}</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-5 right-4 flex flex-col items-center gap-4">
                  <button onClick={() => toggleLike(p.id)} className="flex flex-col items-center gap-1">
                    <Home size={24} color="#F2F2F2" fill={liked ? "#2B2B2B" : "none"} />
                    <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[11px]">{p.likes.length}</span>
                  </button>
                  <button onClick={() => setOpenComments(p.id)} className="flex flex-col items-center gap-1">
                    <MessageCircle size={24} color="#F2F2F2" />
                    <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[11px]">{p.comments.length}</span>
                  </button>
                  <button onClick={() => sharePost(p)} className="flex flex-col items-center gap-1">
                    <Share2 size={22} color="#F2F2F2" />
                  </button>
                  <button onClick={() => toggleSave(p.id)} className="flex flex-col items-center gap-1">
                    <Bookmark size={22} color="#F2F2F2" fill={saved ? "#F2F2F2" : "none"} />
                  </button>
                  {p.authorUid === meUid && (
                    <button onClick={() => setDeleteConfirmPost(p)} className="flex flex-col items-center gap-1">
                      <Trash2 size={20} color="#F2F2F2" />
                    </button>
                  )}
                </div>
              </div>
            );
          }
          if (p.musicName) {
            return (
              <div key={p.id} onClick={() => handleTap(p.id)} className="rounded-[28px] p-5 relative" style={{ background: "#000000" }}>
                {burstId === p.id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Home size={90} className="like-burst" color="#F2F2F2" fill="#F2F2F2" style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} />
                  </div>
                )}
                <div onClick={e => goToProfile(e, p.authorUid)} className="flex items-center gap-2.5 mb-4">
                  <Avatar name={p.author} uid={p.authorUid} size={40} fontSize={12} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#F2F2F2", fontWeight: 600 }} className="text-[13.5px] truncate">{p.author}</p>
                    <p style={{ fontFamily: "IBM Plex Mono", color: "rgba(242,242,242,0.6)" }} className="text-[10px]">{p.time}</p>
                  </div>
                </div>
                {p.text && (
                  <p style={{ fontFamily: "Fraunces", color: "#F2F2F2" }} className="text-[17px] leading-snug mb-4">{p.text}</p>
                )}
                <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mb-4" style={{ background: "rgba(242,242,242,0.1)" }}>
                  {p.musicUrl ? (
                    <AudioPlayButton url={p.musicUrl} size={36} iconSize={16} bg="rgba(242,242,242,0.15)" color="#F2F2F2" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(242,242,242,0.15)" }}>
                      <Music2 size={16} color="#F2F2F2" />
                    </div>
                  )}
                  <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[13px] truncate">{p.musicName}</span>
                </div>
                <div className="flex items-center gap-6 pt-3" style={{ borderTop: "1px solid rgba(242,242,242,0.15)" }}>
                  <button onClick={() => toggleLike(p.id)} className="flex items-center gap-2">
                    <Home size={22} color="#F2F2F2" fill={liked ? "#F2F2F2" : "none"} />
                    <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[13.5px]">{p.likes.length}</span>
                  </button>
                  <button onClick={() => setOpenComments(p.id)} className="flex items-center gap-2">
                    <MessageCircle size={22} color="#F2F2F2" />
                    <span style={{ fontFamily: "Inter", color: "#F2F2F2" }} className="text-[13.5px]">{p.comments.length}</span>
                  </button>
                  <button onClick={() => sharePost(p)} className="flex items-center gap-2">
                    <Share2 size={20} color="#F2F2F2" />
                  </button>
                  <button onClick={() => toggleSave(p.id)} className="flex items-center gap-2 ml-auto">
                    <Bookmark size={20} color="#F2F2F2" fill={saved ? "#F2F2F2" : "none"} />
                  </button>
                  {p.authorUid === meUid && (
                    <button onClick={() => setDeleteConfirmPost(p)} className="flex items-center gap-2">
                      <Trash2 size={18} color="#F2F2F2" />
                    </button>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div key={p.id} onClick={() => handleTap(p.id)} className="rounded-[28px] p-5 relative" style={{ background: "var(--c-surface)", boxShadow: "0 6px 20px var(--c-shadow-strong)" }}>
              {burstId === p.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <Home size={90} className="like-burst" color="var(--c-accent-2)" fill="var(--c-accent-2)" style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.2))" }} />
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-4">
                <div onClick={e => goToProfile(e, p.authorUid)} className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Avatar name={p.author} uid={p.authorUid} size={40} fontSize={12} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13.5px] truncate">{p.author}</p>
                    <p style={{ fontFamily: "IBM Plex Mono", color: "var(--c-faint)" }} className="text-[10px]">{p.time}</p>
                  </div>
                </div>
                {p.kind && (
                  <span className="text-[10.5px] px-3 py-1.5 rounded-full shrink-0" style={{ fontFamily: "Inter", background: "#5A5A5A1E", color: "#5C6B45" }}>
                    {KIND_LABELS[p.kind]}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: "Fraunces", color: "var(--c-text)" }} className="text-[18px] leading-snug mb-5">{p.text}</p>
              <div className="flex items-center gap-6 pt-3" style={{ borderTop: "1px solid var(--c-divider)" }}>
                <button onClick={() => toggleLike(p.id)} className="flex items-center gap-2">
                  <Home size={22} color={liked ? "var(--c-accent-2)" : "var(--c-muted)"} fill={liked ? "var(--c-accent-2)" : "none"} />
                  <span style={{ fontFamily: "Inter", color: "var(--c-text-2)" }} className="text-[13.5px]">{p.likes.length}</span>
                </button>
                <button onClick={() => setOpenComments(p.id)} className="flex items-center gap-2">
                  <MessageCircle size={22} color="var(--c-muted)" />
                  <span style={{ fontFamily: "Inter", color: "var(--c-text-2)" }} className="text-[13.5px]">{p.comments.length}</span>
                </button>
                <button onClick={() => sharePost(p)} className="flex items-center gap-2">
                  <Share2 size={20} color="var(--c-muted)" />
                </button>
                <button onClick={() => toggleSave(p.id)} className="flex items-center gap-2 ml-auto">
                  <Bookmark size={20} color="var(--c-muted)" fill={saved ? "var(--c-muted)" : "none"} />
                </button>
                {p.authorUid === meUid && (
                  <button onClick={() => setDeleteConfirmPost(p)} className="flex items-center gap-2">
                    <Trash2 size={18} color="var(--c-muted)" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {commentPost && (
        <div className="absolute inset-0 flex items-end" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setOpenComments(null)}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: "var(--c-bg)", maxHeight: "85%" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-3 flex items-center justify-between">
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px]">Comentários</p>
              <button onClick={() => setOpenComments(null)}><X size={18} color="var(--c-faint)" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-3">
              {commentPost.comments.length === 0 ? (
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] text-center py-8">Seja o primeiro a comentar.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {commentPost.comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <Avatar name={c.author} size={28} fontSize={9} />
                      <div className="rounded-2xl px-3 py-2 flex-1" style={{ background: "var(--c-surface)" }}>
                        <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[11.5px]">{c.author}</p>
                        <p style={{ fontFamily: "Inter", color: "var(--c-text-2)" }} className="text-[12.5px] mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 flex items-center gap-2" style={{ borderTop: "1px solid var(--c-border)" }}>
              <input value={commentDraft} onChange={e => setCommentDraft(e.target.value)} placeholder="Escreva um comentário..."
                onKeyDown={e => e.key === "Enter" && addComment(commentPost.id)}
                className="flex-1 px-4 py-2.5 rounded-full outline-none text-[13px]"
                style={{ fontFamily: "Inter", background: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-text)" }} />
              <button onClick={() => addComment(commentPost.id)} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-accent)" }}>
                <Send size={14} color="#FFFFFF" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedScreen;
