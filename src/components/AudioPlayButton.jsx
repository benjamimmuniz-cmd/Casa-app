import React, { useRef, useState } from "react";
import { AlertCircle, Play, Pause } from "lucide-react";

let currentlyPlaying = null;

function AudioPlayButton({ url, size = 36, iconSize = 16, bg = "rgba(242,242,242,0.15)", color = "#F2F2F2" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const toggle = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    if (currentlyPlaying && currentlyPlaying !== audio) currentlyPlaying.pause();
    setFailed(false);
    audio.play().then(() => { currentlyPlaying = audio; }).catch(() => setFailed(true));
  };

  return (
    <button onClick={toggle} className="rounded-full flex items-center justify-center shrink-0" style={{ width: size, height: size, background: bg }}>
      <audio ref={audioRef} src={url} preload="none"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onError={() => setFailed(true)} />
      {failed ? <AlertCircle size={iconSize} color={color} /> : playing ? <Pause size={iconSize} color={color} fill={color} /> : <Play size={iconSize} color={color} fill={color} />}
    </button>
  );
}

export default AudioPlayButton;
