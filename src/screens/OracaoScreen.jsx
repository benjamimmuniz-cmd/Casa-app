import React, { useContext, useEffect, useState } from "react";
import { HandHeart, Lock, Globe } from "lucide-react";
import { collection, addDoc, doc, updateDoc, onSnapshot, orderBy, query, where, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext, FeedContext, ProfileNavContext } from "../context/contexts.js";
import { colorFor, initials, timeAgo } from "../utils/helpers.js";

function OracaoScreen({ onBack }) {
  const me = useContext(UserContext);
  const meName = me.name || "Você";
  const { addPost } = useContext(FeedContext);
  const { openTestemunhos } = useContext(ProfileNavContext);
  const [prayers, setPrayers] = useState([]);
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [postToFeed, setPostToFeed] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "oracoes"), where("isPublic", "==", true));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, time: timeAgo(data.createdAt) };
      });
      list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPrayers(list);
    }, err => console.error("PRAYER_LOAD_ERR", err.code, err.message));
    return () => unsub();
  }, []);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, "oracoes"), {
        author: meName, authorUid: me.uid, text: text.trim(), isPublic, prayingBy: [], createdAt: serverTimestamp(),
      });
      if (isPublic && postToFeed) {
        addPost({ author: meName, text: text.trim(), kind: "oracao" }).catch(err => console.error("PRAYER_FEED_POST_ERR", err.code, err.message));
      }
      setConfirmation(isPublic ? "Seu pedido foi publicado no mural. 🙏" : "Pedido enviado só pra liderança da igreja, em sigilo.");
      setText("");
      setIsPublic(false);
      setPostToFeed(false);
    } catch (err) {
      console.error("PRAYER_ADD_ERR", err.code, err.message);
      setConfirmation("Não consegui enviar agora. Tenta de novo.");
    }
    setSending(false);
    setTimeout(() => setConfirmation(""), 3000);
  };

  const togglePray = (p) => {
    const praying = (p.prayingBy || []).includes(meName);
    updateDoc(doc(db, "oracoes", p.id), { prayingBy: praying ? arrayRemove(meName) : arrayUnion(meName) })
      .catch(err => console.error("PRAYER_PRAY_ERR", err.code, err.message));
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#8A4B6D1E" }}>
          <HandHeart size={20} color="#8A4B6D" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">Oração</h1>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mt-0.5">Compartilhe seu pedido</p>
        </div>
      </div>

      <div className="mx-6 rounded-3xl p-4 mb-6" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Qual é o seu pedido de oração?" rows={3}
          className="w-full outline-none text-[13.5px] resize-none bg-transparent"
          style={{ fontFamily: "Inter", color: "#000000" }} />

        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #E8E8E8" }}>
          <button onClick={() => setIsPublic(false)}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: !isPublic ? "#000000" : "#F2F2F2", color: !isPublic ? "#FFFFFF" : "#4D4D4D" }}>
            <Lock size={13} /> Só a liderança
          </button>
          <button onClick={() => setIsPublic(true)}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: isPublic ? "#000000" : "#F2F2F2", color: isPublic ? "#FFFFFF" : "#4D4D4D" }}>
            <Globe size={13} /> Publicar no mural
          </button>
        </div>

        {isPublic && (
          <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
            <input type="checkbox" checked={postToFeed} onChange={e => setPostToFeed(e.target.checked)}
              className="w-4 h-4 rounded" style={{ accentColor: "#000000" }} />
            <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Publicar também no Feed</span>
          </label>
        )}

        <button onClick={submit} disabled={!text.trim() || sending}
          className="w-full mt-3 py-3 rounded-full font-semibold text-[13.5px] active:scale-[0.98] transition-transform"
          style={{ fontFamily: "Inter", background: text.trim() ? "#000000" : "#E3E3E3", color: text.trim() ? "#FFFFFF" : "#9E9E9E" }}>
          {sending ? "Enviando..." : "Enviar pedido"}
        </button>

        {confirmation && (
          <p style={{ fontFamily: "Inter", color: "#5C6B45" }} className="text-[12px] text-center mt-3">{confirmation}</p>
        )}
      </div>

      <div className="px-6 mb-3">
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Mural de oração da igreja</p>
      </div>

      <div className="px-6 pb-10 flex flex-col gap-3">
        {prayers.length === 0 ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Nenhum pedido público ainda.</p>
          </div>
        ) : prayers.map(p => {
          const praying = (p.prayingBy || []).includes(meName);
          return (
            <div key={p.id} className="rounded-2xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(p.author) }}>
                  <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[10px]">{initials(p.author)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px] truncate">{p.author}</p>
                  <p style={{ fontFamily: "IBM Plex Mono", color: "#9E9E9E" }} className="text-[10px]">{p.time}</p>
                </div>
              </div>
              <p style={{ fontFamily: "Fraunces", color: "#000000" }} className="text-[14.5px] leading-snug mb-3">{p.text}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePray(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                  style={{ fontFamily: "Inter", background: praying ? "#8A4B6D" : "#F2F2F2", color: praying ? "#FFFFFF" : "#4D4D4D" }}>
                  🙏 {praying ? "Orando" : "Orar por isso"} {(p.prayingBy || []).length > 0 && `· ${p.prayingBy.length}`}
                </button>
                {p.authorUid === me.uid && (
                  <button onClick={openTestemunhos}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ fontFamily: "Inter", background: "#F2F2F2", color: "#8A6D3B" }}>
                    🙌 Virou testemunho?
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OracaoScreen;
