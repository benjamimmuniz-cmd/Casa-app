import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { searchMusic } from "../utils/musicSearch.js";
import AudioPlayButton from "./AudioPlayButton.jsx";

function MusicPickerSheet({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const term = query.trim();
    if (!term) { setResults([]); setLoading(false); setError(""); return; }
    setLoading(true);
    setError("");
    const timeout = setTimeout(() => {
      searchMusic(term)
        .then(setResults)
        .catch(err => setError(err.message || "Não consegui buscar agora. Tenta de novo."))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const searching = query.trim().length > 0;
  const list = searching ? results : [];

  return (
    <div className="absolute inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="w-full rounded-t-3xl flex flex-col" style={{ background: "#F2F2F2", maxHeight: "80%" }} onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-1 flex items-center justify-between">
          <div>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px]">Escolher música</p>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] mt-0.5">Prévias de 30s de qualquer música</p>
          </div>
          <button onClick={onClose}><X size={18} color="#9E9E9E" /></button>
        </div>

        <div className="px-6 pt-3 pb-1">
          <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: "#FFFFFF", border: "1px solid #D6D6D6" }}>
            <Search size={15} color="#9E9E9E" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar qualquer música ou artista"
              className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#000000" }} />
            {query && (
              <button onClick={() => setQuery("")}><X size={14} color="#9E9E9E" /></button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-3 pb-6 flex flex-col gap-2.5">
          {loading && (
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-6">Buscando...</p>
          )}
          {!loading && error && (
            <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[12px] text-center py-6">{error}</p>
          )}
          {!loading && !error && searching && list.length === 0 && (
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-6">Nenhuma música encontrada.</p>
          )}
          {!loading && !error && !searching && (
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px] text-center py-6">Busque uma música ou artista pra usar.</p>
          )}
          {!loading && !error && list.map(track => (
            <div key={track.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF" }}>
              {track.artwork ? (
                <img src={track.artwork} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
              ) : (
                <AudioPlayButton url={track.url} size={38} iconSize={16} bg="#0000000F" color="#000000" />
              )}
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{track.title}</p>
                <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">{track.artist} · {track.source}</p>
              </div>
              {track.artwork && <AudioPlayButton url={track.url} size={30} iconSize={13} bg="#0000000F" color="#000000" />}
              <button onClick={() => onSelect(track)} className="px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold shrink-0"
                style={{ fontFamily: "Inter", background: "#000000", color: "#FFFFFF" }}>
                Usar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MusicPickerSheet;
