import React, { useRef, useState } from "react";
import { Check } from "lucide-react";

// Deixa a pessoa escolher o ponto de foco da foto antes de publicar,
// arrastando dentro do quadro — assim a prévia e o post final mostram a parte certa da imagem.
function ImageFramer({ image, position, onChange, onDone }) {
  const frameRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const updateFromEvent = (e) => {
    const rect = frameRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    const x = Math.max(0, Math.min(100, ((point.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((point.clientY - rect.top) / rect.height) * 100));
    onChange({ x, y });
  };

  return (
    <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }}>
        <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1">Enquadrar foto</p>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mb-4">Arraste dentro da imagem pra escolher o que fica em destaque</p>
        <div
          ref={frameRef}
          className="relative w-full rounded-2xl overflow-hidden select-none"
          style={{ aspectRatio: "1 / 1", touchAction: "none", cursor: "crosshair" }}
          onMouseDown={e => { setDragging(true); updateFromEvent(e); }}
          onMouseMove={e => { if (dragging) updateFromEvent(e); }}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={e => { setDragging(true); updateFromEvent(e); }}
          onTouchMove={e => { if (dragging) updateFromEvent(e); }}
          onTouchEnd={() => setDragging(false)}
        >
          <img src={image} alt="" draggable={false}
            className="w-full h-full object-cover pointer-events-none"
            style={{ objectPosition: `${position.x}% ${position.y}%` }} />
          <div className="absolute rounded-full pointer-events-none" style={{
            width: 18, height: 18, border: "2px solid #FFFFFF", boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            left: `${position.x}%`, top: `${position.y}%`, transform: "translate(-50%, -50%)",
          }} />
        </div>
        <button onClick={onDone}
          className="w-full mt-5 py-3.5 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
          <Check size={16} /> Concluído
        </button>
      </div>
    </div>
  );
}

export default ImageFramer;
