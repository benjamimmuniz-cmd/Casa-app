import React from "react";
import { MapPin, Navigation } from "lucide-react";
import { CHURCH_ADDRESS } from "../data/constants.js";

function LocalizacaoScreen({ onBack }) {
  const encoded = encodeURIComponent(CHURCH_ADDRESS);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  const wazeUrl = `https://waze.com/ul?q=${encoded}&navigate=yes`;

  return (
    <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: "#000000" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }}>← Início</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(242,242,242,0.12)" }}>
          <MapPin size={32} color="#F2F2F2" />
        </div>
        <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.6)", letterSpacing: 2 }} className="text-[12px] uppercase font-semibold mb-2">
          Localização
        </p>
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#F2F2F2" }} className="text-[22px] leading-tight mb-3">
          Venha nos visitar
        </h1>
        <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.75)" }} className="text-[14px] leading-relaxed">
          {CHURCH_ADDRESS}
        </p>
      </div>

      <div className="px-6 pb-10 flex flex-col gap-3">
        <button onClick={() => window.open(googleMapsUrl, "_blank", "noopener,noreferrer")}
          className="w-full py-4 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ background: "#F2F2F2", color: "#000000", fontFamily: "Inter" }}>
          <Navigation size={17} />
          Abrir rota no Google Maps
        </button>
        <button onClick={() => window.open(wazeUrl, "_blank", "noopener,noreferrer")}
          className="w-full py-4 rounded-full font-semibold text-[15px] active:scale-[0.98] transition-transform"
          style={{ background: "rgba(242,242,242,0.12)", color: "#F2F2F2", fontFamily: "Inter" }}>
          Abrir no Waze
        </button>
      </div>
    </div>
  );
}

export default LocalizacaoScreen;
