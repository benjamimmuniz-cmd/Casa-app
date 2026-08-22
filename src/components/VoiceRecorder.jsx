import React, { useRef, useState } from "react";
import { Lock, Mic, Send, Trash2 } from "lucide-react";

const LOCK_DRAG_PX = 60;

// Botão de gravar áudio estilo WhatsApp: segura pra gravar, arrasta pra cima
// pra travar (grava sem precisar segurar), solta pra enviar, lixeira cancela.
function VoiceRecorder({ onSend, disabled, onRecordingChange }) {
  const [recording, setRecording] = useState(false);
  const [locked, setLocked] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startYRef = useRef(0);
  const cancelledRef = useRef(false);
  const activeRef = useRef(false);

  const reset = () => {
    setRecording(false);
    setLocked(false);
    setSeconds(0);
    chunksRef.current = [];
    activeRef.current = false;
    onRecordingChange?.(false);
  };

  const startRecording = async (clientY) => {
    if (activeRef.current) return;
    activeRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = window.MediaRecorder && MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      cancelledRef.current = false;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (cancelledRef.current || chunksRef.current.length === 0) { reset(); return; }
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        const dur = seconds;
        const reader = new FileReader();
        reader.onload = () => {
          onSend(reader.result, dur);
          reset();
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      startYRef.current = clientY;
      setRecording(true);
      setLocked(false);
      setSeconds(0);
      onRecordingChange?.(true);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (err) {
      activeRef.current = false;
      console.error("MIC_ERR", err.message);
      alert("Não deu pra acessar o microfone. Verifica as permissões do navegador.");
    }
  };

  const stopRecording = (cancel) => {
    cancelledRef.current = cancel;
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      reset();
    }
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    startRecording(e.clientY);
  };
  const handlePointerMove = (e) => {
    if (!recording || locked) return;
    if (startYRef.current - e.clientY > LOCK_DRAG_PX) setLocked(true);
  };
  const handlePointerUp = () => {
    if (!recording || locked) return;
    stopRecording(false);
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (recording) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <button onClick={() => stopRecording(true)} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-surface)" }}>
          <Trash2 size={16} color="#B33B3B" />
        </button>
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full min-w-0" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#B33B3B" }} />
          <span style={{ fontFamily: "IBM Plex Mono", color: "var(--c-text)" }} className="text-[12px] shrink-0">{fmtTime(seconds)}</span>
          {!locked && (
            <span style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10.5px] ml-auto truncate flex items-center gap-1">
              <Lock size={10} /> arraste pra travar
            </span>
          )}
        </div>
        {locked ? (
          <button onClick={() => stopRecording(false)} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-accent)" }}>
            <Send size={14} color="#FFFFFF" />
          </button>
        ) : (
          <button
            onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-accent)", touchAction: "none" }}>
            <Mic size={16} color="#FFFFFF" />
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
      disabled={disabled}
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ touchAction: "none", opacity: disabled ? 0.4 : 1 }}>
      <Mic size={19} color="var(--c-muted)" />
    </button>
  );
}

export default VoiceRecorder;
