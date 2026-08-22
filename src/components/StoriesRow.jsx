import React, { useContext, useRef, useState } from "react";
import { Camera, Clapperboard, CircleDot, Film, ImageIcon, Plus, SquarePen, X } from "lucide-react";
import { StoryContext, UserContext, ConnectionsContext } from "../context/contexts.js";
import StoryViewer from "./StoryViewer.jsx";
import StoryEditor from "./StoryEditor.jsx";
import Avatar from "./Avatar.jsx";
import { compressImage } from "../utils/imageCompress.js";
import { uploadVideo, uploadImageDataUrl } from "../utils/mediaUpload.js";
import { friendUidsOf } from "../utils/helpers.js";

function StoriesRow({ onPublish, onShorts }) {
  const meUser = useContext(UserContext);
  const me = meUser.name || "Você";
  const { stories: allStories, viewedIds, addStory, markViewed } = useContext(StoryContext);
  const { connections } = useContext(ConnectionsContext);
  const friends = friendUidsOf(meUser.uid, connections);
  const stories = allStories.filter(s => !s.authorUid || s.authorUid === meUser.uid || friends.has(s.authorUid));
  const [viewerGroup, setViewerGroup] = useState(null);
  const [showChoice, setShowChoice] = useState(false);
  const [showPhotoSource, setShowPhotoSource] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoError, setVideoError] = useState("");
  const [videoProgress, setVideoProgress] = useState(null);
  const storyPhotoInputRef = useRef(null);
  const storyCameraInputRef = useRef(null);
  const storyVideoInputRef = useRef(null);

  const handleStoryImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => setEditingImage(await compressImage(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const publishEditedStory = async ({ zoom, focus, overlays, musicName, musicUrl }) => {
    const localImage = editingImage;
    setEditingImage(null);
    try {
      const url = await uploadImageDataUrl(localImage, `story-images/${meUser.uid}/${Date.now()}.jpg`);
      addStory({ author: me, image: url, text: "", zoom, focus, overlays, musicName, musicUrl });
    } catch (err) {
      console.error("STORY_IMAGE_UPLOAD_ERR", err.message);
    }
  };

  const handleStoryVideoPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setVideoError("");
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const cancelVideoStory = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
    setVideoError("");
    setVideoProgress(null);
  };

  const publishVideoStory = async () => {
    if (!videoFile) return;
    setVideoError("");
    try {
      setVideoProgress(0);
      const url = await uploadVideo(videoFile, `story-videos/${meUser.uid}/${Date.now()}-${videoFile.name}`, setVideoProgress);
      addStory({ author: me, video: url, text: "" });
      cancelVideoStory();
    } catch (err) {
      setVideoError(err.message || "Não consegui enviar o vídeo. Tenta de novo.");
      setVideoProgress(null);
    }
  };

  const myStories = stories.filter(s => s.author === me);
  const otherStoriesGrouped = [];
  const seenAuthors = new Set();
  stories.forEach(s => {
    if (s.author === me || seenAuthors.has(s.author)) return;
    seenAuthors.add(s.author);
    otherStoriesGrouped.push(stories.filter(x => x.author === s.author));
  });

  const openViewer = (group) => {
    markViewed(group[0]);
    setViewerGroup(group);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto px-6 mb-6 pb-1">
        <div role="button" tabIndex={0} onClick={() => myStories.length ? openViewer(myStories) : setShowChoice(true)} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" style={{ width: 64 }}>
          <div className="relative w-14 h-14">
            {myStories.length ? (
              <div className="absolute inset-0 rounded-full" style={{ padding: 2.5, boxSizing: "border-box", background: myStories.every(s => viewedIds.has(s.id)) ? "var(--c-border)" : "linear-gradient(45deg, #F3D18A, #6E93F2, #3E5FBF)" }}>
                <div className="w-full h-full rounded-full overflow-hidden" style={{ padding: 2, boxSizing: "border-box", background: "var(--c-bg)" }}>
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Avatar name={me} uid={meUser.uid} size="100%" fontSize={13} />
                  </div>
                </div>
              </div>
            ) : (
              <Avatar name={me} uid={meUser.uid} size={56} fontSize={13} />
            )}
            <button type="button" onClick={e => { e.stopPropagation(); setShowChoice(true); }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--c-accent)", border: "2px solid var(--c-bg)" }}>
              <Plus size={12} color="#FFFFFF" />
            </button>
          </div>
          <span style={{ fontFamily: "Inter", color: "var(--c-text-2)" }} className="text-[10px] truncate w-full text-center">Seu story</span>
        </div>
        {otherStoriesGrouped.map(group => {
          const s = group[0];
          const viewed = group.every(x => viewedIds.has(x.id));
          return (
            <button key={s.author} onClick={() => openViewer(group)} className="flex flex-col items-center gap-1.5 shrink-0" style={{ width: 64 }}>
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full" style={{ padding: 2.5, boxSizing: "border-box", background: viewed ? "var(--c-border)" : "linear-gradient(45deg, #F3D18A, #6E93F2, #3E5FBF)" }}>
                  <div className="w-full h-full rounded-full overflow-hidden" style={{ padding: 2, boxSizing: "border-box", background: "var(--c-bg)" }}>
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Avatar name={s.author} uid={s.authorUid} size="100%" fontSize={13} />
                    </div>
                  </div>
                </div>
              </div>
              <span style={{ fontFamily: "Inter", color: "var(--c-text-2)" }} className="text-[10px] truncate w-full text-center">{s.author.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {showChoice && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowChoice(false)}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: "var(--c-bg)" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px] mb-4 px-1">O que você quer fazer?</p>
            <button onClick={() => { setShowChoice(false); setShowPhotoSource(true); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl mb-2.5 text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#8A4B6D1E" }}>
                <CircleDot size={18} color="#8A4B6D" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Story</p>
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Aparece no topo, em bolinha</p>
              </div>
            </button>
            <button onClick={() => { setShowChoice(false); storyVideoInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl mb-2.5 text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#5C6B451E" }}>
                <Film size={18} color="#5C6B45" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Story em vídeo</p>
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Um vídeo curto, some em 24h</p>
              </div>
            </button>
            <button onClick={() => { setShowChoice(false); onPublish ? onPublish() : null; }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
                <SquarePen size={18} color="var(--c-text)" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Publicar</p>
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Fica no mural do Feed</p>
              </div>
            </button>
            {onShorts && (
              <button onClick={() => { setShowChoice(false); onShorts(); }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl mt-2.5 text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
                  <Clapperboard size={18} color="var(--c-text)" />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Shorts</p>
                  <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[11px]">Vídeo curto e vertical</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      <input ref={storyPhotoInputRef} type="file" accept="image/*" onChange={handleStoryImagePick} className="hidden" />
      <input ref={storyCameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleStoryImagePick} className="hidden" />

      {showPhotoSource && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowPhotoSource(false)}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: "var(--c-bg)" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[16px] mb-4 px-1">Foto do story</p>
            <button onClick={() => { setShowPhotoSource(false); storyCameraInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl mb-2.5 text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
                <Camera size={18} color="var(--c-text)" />
              </div>
              <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Tirar foto</p>
            </button>
            <button onClick={() => { setShowPhotoSource(false); storyPhotoInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left active:scale-[0.98] transition-transform" style={{ background: "var(--c-surface)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0000000F" }}>
                <ImageIcon size={18} color="var(--c-text)" />
              </div>
              <p style={{ fontFamily: "Inter", fontWeight: 600, color: "var(--c-text)" }} className="text-[13.5px]">Escolher da galeria</p>
            </button>
          </div>
        </div>
      )}
      <input ref={storyVideoInputRef} type="file" accept="video/*" onChange={handleStoryVideoPick} className="hidden" />

      {viewerGroup && (
        <StoryViewer stories={viewerGroup} startIndex={0} onClose={() => setViewerGroup(null)} />
      )}

      {editingImage && (
        <StoryEditor image={editingImage} onCancel={() => setEditingImage(null)} onPublish={publishEditedStory} />
      )}

      {videoPreview && (
        <div className="absolute inset-0 z-50 flex flex-col" style={{ background: "#000000" }}>
          <div className="flex items-center justify-between px-5 pt-6 pb-3">
            <button onClick={cancelVideoStory}><X size={22} color="#FFFFFF" /></button>
            <p style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[13px] font-semibold">Story em vídeo</p>
            <div style={{ width: 22 }} />
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <video src={videoPreview} className="max-w-full max-h-full" controls playsInline />
          </div>
          {videoError && (
            <p style={{ fontFamily: "Inter", color: "#FF8A73" }} className="text-[12px] text-center px-5 mb-2">{videoError}</p>
          )}
          <div className="px-5 pb-8 pt-2">
            <button onClick={publishVideoStory} disabled={videoProgress !== null}
              className="w-full py-4 rounded-full font-semibold text-[15px] active:scale-[0.98] transition-transform"
              style={{ background: "#FFFFFF", color: "#000000", fontFamily: "Inter" }}>
              {videoProgress !== null ? `Enviando ${Math.round(videoProgress * 100)}%...` : "Publicar story"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default StoriesRow;
