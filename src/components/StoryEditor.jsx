import React, { useRef, useState } from "react";
import { Check, Music, Smile, Type, X } from "lucide-react";
import MusicPickerSheet from "./MusicPickerSheet.jsx";
import AudioPlayButton from "./AudioPlayButton.jsx";

const EMOJIS = ["😀", "😂", "🙏", "❤️", "🔥", "✨", "🎉", "👏", "😍", "🙌", "💛", "⭐"];

// Editor de story estilo Instagram: dá pra dar zoom/arrastar pra enquadrar a foto,
// adicionar texto solto em cima da imagem, colar emojis e escolher uma música —
// tudo arrastável.
function StoryEditor({ image, onCancel, onPublish }) {
  const frameRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState({ x: 50, y: 50 });
  const [overlays, setOverlays] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [musicTrack, setMusicTrack] = useState(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const drag = useRef(null);

  const updateFocusFromEvent = (e) => {
    const rect = frameRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    const x = Math.max(0, Math.min(100, ((point.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((point.clientY - rect.top) / rect.height) * 100));
    setFocus({ x, y });
  };

  const onFrameDown = (e) => {
    drag.current = { kind: "pan" };
    updateFocusFromEvent(e);
  };

  const onFrameMove = (e) => {
    if (!drag.current) return;
    if (drag.current.kind === "pan") {
      updateFocusFromEvent(e);
    } else {
      const rect = frameRef.current.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      const dx = ((point.clientX - drag.current.startX) / rect.width) * 100;
      const dy = ((point.clientY - drag.current.startY) / rect.height) * 100;
      setOverlays(prev => prev.map(o => o.id === drag.current.id
        ? { ...o, x: Math.max(4, Math.min(96, drag.current.startPos.x + dx)), y: Math.max(4, Math.min(96, drag.current.startPos.y + dy)) }
        : o));
    }
  };

  const endDrag = () => { drag.current = null; };

  const startOverlayDrag = (e, o) => {
    e.stopPropagation();
    const point = e.touches ? e.touches[0] : e;
    drag.current = { kind: "overlay", id: o.id, startX: point.clientX, startY: point.clientY, startPos: { x: o.x, y: o.y } };
  };

  const addText = () => {
    const id = "t" + Date.now();
    setOverlays(prev => [...prev, { id, type: "text", content: "", x: 50, y: 45 }]);
    setEditingId(id);
    setShowEmojis(false);
  };

  const addEmoji = (emoji) => {
    const id = "e" + Date.now() + Math.random().toString(36).slice(2, 5);
    setOverlays(prev => [...prev, { id, type: "emoji", content: emoji, x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 }]);
  };

  const updateOverlayContent = (id, content) => setOverlays(prev => prev.map(o => o.id === id ? { ...o, content } : o));
  const removeOverlay = (id) => setOverlays(prev => prev.filter(o => o.id !== id));

  const publish = () => {
    const cleanOverlays = overlays.filter(o => o.type !== "text" || o.content.trim());
    onPublish({ zoom, focus, overlays: cleanOverlays, musicName: musicTrack?.title || "", musicUrl: musicTrack?.url || null });
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: "#000000" }}>
      <div className="flex items-center justify-between px-5 pt-6 pb-3">
        <button onClick={onCancel}><X size={22} color="#FFFFFF" /></button>
        <div className="flex items-center gap-3">
          <button onClick={addText} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Type size={14} color="#FFFFFF" />
            <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[12px]">Aa</span>
          </button>
          <button onClick={() => setShowEmojis(v => !v)} className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: showEmojis ? "#FFFFFF" : "rgba(255,255,255,0.15)" }}>
            <Smile size={16} color={showEmojis ? "#000000" : "#FFFFFF"} />
          </button>
          <button onClick={() => setShowMusicPicker(true)} className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: musicTrack ? "#FFFFFF" : "rgba(255,255,255,0.15)" }}>
            <Music size={16} color={musicTrack ? "#000000" : "#FFFFFF"} />
          </button>
        </div>
      </div>

      {musicTrack && (
        <div className="px-5 pb-1 shrink-0">
          <div className="flex items-center gap-2.5 rounded-full pl-2 pr-3 py-2 w-fit" style={{ background: "rgba(255,255,255,0.15)" }}>
            <AudioPlayButton url={musicTrack.url} size={26} iconSize={12} bg="rgba(255,255,255,0.25)" color="#FFFFFF" />
            <span style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[11.5px] max-w-[160px] truncate">{musicTrack.title}</span>
            <button onClick={() => setMusicTrack(null)}><X size={13} color="rgba(255,255,255,0.7)" /></button>
          </div>
        </div>
      )}

      <div
        ref={frameRef}
        className="flex-1 relative overflow-hidden select-none"
        style={{ touchAction: "none", cursor: "crosshair" }}
        onMouseDown={onFrameDown} onMouseMove={onFrameMove} onMouseUp={endDrag} onMouseLeave={endDrag}
        onTouchStart={onFrameDown} onTouchMove={onFrameMove} onTouchEnd={endDrag}
      >
        <img src={image} alt="" draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${focus.x}% ${focus.y}%`, transform: `scale(${zoom})`, transformOrigin: "center" }} />

        {overlays.map(o => (
          <div key={o.id} className="absolute"
            style={{ left: `${o.x}%`, top: `${o.y}%`, transform: "translate(-50%, -50%)", touchAction: "none" }}
            onMouseDown={e => startOverlayDrag(e, o)} onTouchStart={e => startOverlayDrag(e, o)}>
            {o.type === "emoji" ? (
              <span style={{ fontSize: 44, lineHeight: 1 }}>{o.content}</span>
            ) : editingId === o.id ? (
              <input autoFocus value={o.content}
                onChange={e => updateOverlayContent(o.id, e.target.value)}
                onBlur={() => { setEditingId(null); if (!o.content.trim()) removeOverlay(o.id); }}
                onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
                className="text-center outline-none bg-transparent"
                style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#FFFFFF", fontSize: 24, width: Math.max(60, o.content.length * 15), textShadow: "0 2px 10px rgba(0,0,0,0.6)" }} />
            ) : (
              <p onClick={() => setEditingId(o.id)} className="text-center cursor-text whitespace-nowrap"
                style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#FFFFFF", fontSize: 24, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
                {o.content}
              </p>
            )}
            <button
              onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); removeOverlay(o.id); }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }}>
              <X size={10} color="#FFFFFF" />
            </button>
          </div>
        ))}
      </div>

      {showEmojis && (
        <div className="px-5 py-3 flex gap-3 overflow-x-auto shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => addEmoji(e)} style={{ fontSize: 26 }} className="shrink-0">{e}</button>
          ))}
        </div>
      )}

      <div className="px-5 pt-3 pb-2 shrink-0">
        <p style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.55)" }} className="text-[10.5px] mb-1.5">Zoom · arraste a foto pra enquadrar</p>
        <input type="range" min="1" max="2.5" step="0.05" value={zoom}
          onChange={e => setZoom(parseFloat(e.target.value))}
          className="w-full" style={{ accentColor: "#FFFFFF" }} />
      </div>

      <div className="px-5 pb-8 shrink-0">
        <button onClick={publish}
          className="w-full py-4 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ background: "#FFFFFF", color: "#000000", fontFamily: "Inter" }}>
          <Check size={16} /> Concluído
        </button>
      </div>

      {showMusicPicker && (
        <MusicPickerSheet onClose={() => setShowMusicPicker(false)} onSelect={(track) => { setMusicTrack(track); setShowMusicPicker(false); }} />
      )}
    </div>
  );
}

export default StoryEditor;
