import React, { useContext } from "react";
import { Clapperboard, Radio, Youtube } from "lucide-react";
import { LIVE_STREAM_URL, LIVE_STREAM_SCHEDULE, YOUTUBE_SHORTS_URL } from "../data/constants.js";
import { LiveContext, NotificationsContext } from "../context/contexts.js";

function TransmissaoScreen({ onBack }) {
  const { liveActive, setLiveActive } = useContext(LiveContext);
  const { addNotification } = useContext(NotificationsContext);

  const openYoutube = () => {
    window.open(LIVE_STREAM_URL, "_blank", "noopener,noreferrer");
  };

  const openYoutubeShorts = () => {
    window.open(YOUTUBE_SHORTS_URL, "_blank", "noopener,noreferrer");
  };

  const toggleLive = () => {
    if (!liveActive) {
      setLiveActive(true);
      addNotification({ text: "🔴 A transmissão ao vivo começou! Toque para assistir." });
    } else {
      setLiveActive(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: "#000000" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }}>← Início</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: liveActive ? "#B33B3B33" : "rgba(242,242,242,0.12)" }}>
          <Radio size={32} color={liveActive ? "#E15B4A" : "#F2F2F2"} />
        </div>

        {liveActive ? (
          <>
            <div className="flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full" style={{ background: "#B33B3B" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F2F2F2" }} />
              <span style={{ fontFamily: "Inter", color: "#F2F2F2", letterSpacing: 1 }} className="text-[11px] font-semibold uppercase">Ao vivo agora</span>
            </div>
            <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#F2F2F2" }} className="text-[24px] leading-tight mb-3">
              A transmissão já começou
            </h1>
            <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }} className="text-[13.5px] leading-relaxed">
              Toque no botão abaixo pra assistir direto no YouTube, ao lado da sua igreja.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.6)", letterSpacing: 2 }} className="text-[12px] uppercase font-semibold mb-2">
              Transmissão
            </p>
            <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#F2F2F2" }} className="text-[24px] leading-tight mb-3">
              Nenhuma transmissão agora
            </h1>
            <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }} className="text-[13.5px] leading-relaxed">
              A próxima transmissão ao vivo é {LIVE_STREAM_SCHEDULE}. Quando começar, esta tela avisa e o botão abaixo te leva direto pro YouTube.
            </p>
          </>
        )}
      </div>

      <div className="px-6 pb-3 flex flex-col gap-2.5">
        <button onClick={openYoutube}
          className="w-full py-4 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ background: "#F2F2F2", color: "#000000", fontFamily: "Inter" }}>
          <Youtube size={18} />
          {liveActive ? "Assistir no YouTube" : "Ver canal no YouTube"}
        </button>
        <button onClick={openYoutubeShorts}
          className="w-full py-4 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ background: "rgba(242,242,242,0.1)", color: "#F2F2F2", fontFamily: "Inter", border: "1px solid rgba(242,242,242,0.2)" }}>
          <Clapperboard size={18} />
          Ver Shorts no YouTube
        </button>
      </div>

      <div className="px-6 pb-10">
        <button onClick={toggleLive}
          className="w-full py-3 rounded-full font-semibold text-[12.5px] active:scale-[0.98] transition-transform"
          style={{ fontFamily: "Inter", background: "transparent", color: "rgba(242,242,242,0.55)", border: "1px solid rgba(242,242,242,0.25)" }}>
          {liveActive ? "Encerrar transmissão ao vivo" : "Sinalizar início da transmissão"}
        </button>
        <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.4)" }} className="text-[10.5px] text-center mt-2">
          Quando o vídeo estiver no ar, use este botão pra avisar a igreja e acender o sininho de transmissão.
        </p>
      </div>
    </div>
  );
}

export default TransmissaoScreen;
