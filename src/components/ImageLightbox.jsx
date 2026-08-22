import React from "react";
import { X } from "lucide-react";

// Visualizador de foto em tela cheia — usado no Feed e no Chat.
function ImageLightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.92)" }} onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center z-10" style={{ background: "rgba(242,242,242,0.15)" }}>
        <X size={18} color="#F2F2F2" />
      </button>
      <img src={src} alt="" className="max-w-full max-h-full object-contain" onClick={e => e.stopPropagation()} />
    </div>
  );
}

export default ImageLightbox;
