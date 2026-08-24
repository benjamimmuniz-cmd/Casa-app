import React, { useContext, useEffect, useState } from "react";
import { BookOpen, ChevronRight, Play, Plus, Search, Trash2, X } from "lucide-react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { fmtDateBR } from "../utils/helpers.js";
import { extractYoutubeId, youtubeThumbUrl, youtubeWatchEmbedUrl } from "../utils/youtube.js";

// Biblioteca de mensagens/pregacoes: igual o Shorts (cola o link do YouTube),
// mas em formato de lista pesquisavel, feita pra assistir de proposito, nao
// rolar rapido.
function MensagensScreen({ onBack }) {
  const me = useContext(UserContext);
  const [mensagens, setMensagens] = useState([]);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSpeaker, setNewSpeaker] = useState("");
  const [newDate, setNewDate] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "mensagens"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setMensagens(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  const videoId = extractYoutubeId(newUrl.trim());
  const filtered = search.trim()
    ? mensagens.filter(m => (m.title || "").toLowerCase().includes(search.trim().toLowerCase()) || (m.speaker || "").toLowerCase().includes(search.trim().toLowerCase()))
    : mensagens;
  const aberta = mensagens.find(m => m.id === openId);

  const publish = async () => {
    if (!videoId || !newTitle.trim() || publishing) return;
    setPublishing(true);
    setError("");
    try {
      await addDoc(collection(db, "mensagens"), {
        title: newTitle.trim(), speaker: newSpeaker.trim(), date: newDate || "",
        videoId, sourceUrl: newUrl.trim(),
        addedByUid: me.uid, addedByName: me.name,
        createdAt: serverTimestamp(),
      });
      setNewUrl(""); setNewTitle(""); setNewSpeaker(""); setNewDate("");
      setShowAdd(false);
    } catch (err) {
      console.error("MENSAGEM_ADD_ERR", err.code, err.message);
      setError("Não consegui salvar agora. Tenta de novo.");
    }
    setPublishing(false);
  };

  const removeMensagem = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "mensagens", confirmDelete.id));
    } catch (err) {
      console.error("MENSAGEM_DELETE_ERR", err.code, err.message);
    }
    setConfirmDelete(null);
    setOpenId(null);
  };

  if (aberta) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#000000" }}>
        <div className="px-6 pt-6 pb-3 flex items-center justify-between">
          <button onClick={() => setOpenId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }}>← Mensagens</button>
          {aberta.addedByUid === me.uid && (
            <button onClick={() => setConfirmDelete(aberta)}><Trash2 size={16} color="rgba(242,242,242,0.7)" /></button>
          )}
        </div>
        <div style={{ aspectRatio: "16 / 9", background: "#000000" }}>
          <iframe src={youtubeWatchEmbedUrl(aberta.videoId)} title={aberta.title}
            className="w-full h-full" style={{ border: "none" }}
            allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        </div>
        <div className="px-6 py-5">
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#F2F2F2" }} className="text-[18px] leading-tight">{aberta.title}</h1>
          <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.65)" }} className="text-[12.5px] mt-1.5">
            {[aberta.speaker, aberta.date && fmtDateBR(aberta.date)].filter(Boolean).join(" · ") || "Igreja do Nazareno A Casa"}
          </p>
        </div>

        {confirmDelete && (
          <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setConfirmDelete(null)}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-1.5">Excluir essa mensagem?</p>
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-5">Só remove da biblioteca do app, não do YouTube. Não dá pra desfazer.</p>
              <div className="flex gap-2.5">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D" }}>Cancelar</button>
                <button onClick={removeMensagem} className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#B33B3B", color: "#FFFFFF" }}>Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Mensagens</h1>
        <p style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[12px] mt-1">Reveja as pregações e cultos passados</p>
      </div>

      <div className="px-6 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Search size={15} color="#9E9E9E" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título ou pregador"
            className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#000000" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} color="#9E9E9E" /></button>}
        </div>
      </div>

      <div className="px-6 pb-28">
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-6 text-center flex flex-col items-center gap-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <BookOpen size={22} color="#9E9E9E" />
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">
              {search ? "Nenhuma mensagem encontrada." : "Nenhuma mensagem cadastrada ainda."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(m => (
              <button key={m.id} onClick={() => setOpenId(m.id)}
                className="w-full flex items-center gap-3 rounded-2xl p-2.5 text-left active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div className="relative shrink-0 rounded-xl overflow-hidden" style={{ width: 96, height: 64 }}>
                  <img src={youtubeThumbUrl(m.videoId)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
                    <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[13px] truncate">{m.title}</p>
                  <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] truncate">
                    {[m.speaker, m.date && fmtDateBR(m.date)].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <ChevronRight size={15} color="#9E9E9E" />
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setShowAdd(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#2B2B2B", boxShadow: "0 6px 16px rgba(43,43,43,0.4)" }}>
        <Plus size={24} color="#F2F2F2" />
      </button>

      {showAdd && (
        <div className="absolute inset-0 flex items-end z-40" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#F2F2F2" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[17px] mb-1">Nova mensagem</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mb-4">Cole o link do vídeo (YouTube), igual no Shorts</p>

            {videoId ? (
              <div className="relative mb-3 rounded-2xl overflow-hidden" style={{ height: 160 }}>
                <img src={youtubeThumbUrl(videoId)} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setNewUrl("")} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <X size={13} color="#F2F2F2" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 mb-3 rounded-2xl" style={{ height: 90, background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
                <BookOpen size={20} color="#9E9E9E" />
                <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Cole o link abaixo</span>
              </div>
            )}
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            {newUrl.trim() && !videoId && (
              <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[11px] mb-3 -mt-1.5">Não reconheci esse link do YouTube.</p>
            )}

            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título da mensagem"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input value={newSpeaker} onChange={e => setNewSpeaker(e.target.value)} placeholder="Pregador (opcional)"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            {error && <p style={{ fontFamily: "Inter", color: "#B33B3B" }} className="text-[12px] mb-3 text-center">{error}</p>}

            <button onClick={publish} disabled={!videoId || !newTitle.trim() || publishing}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: videoId && newTitle.trim() && !publishing ? "#000000" : "#E3E3E3", color: videoId && newTitle.trim() && !publishing ? "#FFFFFF" : "#9E9E9E", fontFamily: "Inter" }}>
              {publishing ? "Salvando..." : "Adicionar à biblioteca"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MensagensScreen;
