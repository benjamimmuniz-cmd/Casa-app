import React, { useRef, useState } from "react";

// Carrossel de imagens estilo Instagram: swipe horizontal com snap + bolinhas indicadoras.
function PostCarousel({ images, positions, onImageClick, fit = "cover" }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  return (
    <div className="absolute inset-0">
      <div ref={trackRef} onScroll={onScroll}
        className="absolute inset-0 flex overflow-x-auto"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {images.map((img, i) => (
          <img key={i} src={img} alt="" className={`w-full h-full shrink-0 ${fit === "contain" ? "object-contain" : "object-cover"}`}
            onClick={onImageClick ? (e) => { e.stopPropagation(); onImageClick(img); } : undefined}
            style={{ scrollSnapAlign: "start", objectPosition: positions?.[i] || "50% 50%" }} />
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute left-0 right-0 flex items-center justify-center gap-1.5" style={{ top: 62 }}>
          {images.map((_, i) => (
            <div key={i} className="rounded-full transition-all" style={{
              width: i === index ? 14 : 5, height: 5,
              background: i === index ? "#F2F2F2" : "rgba(242,242,242,0.5)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PostCarousel;
