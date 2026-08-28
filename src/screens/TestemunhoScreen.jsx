import React, { useContext, useEffect, useState } from "react";
import { Award } from "lucide-react";
import { collection, addDoc, doc, updateDoc, onSnapshot, query, where, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext, FeedContext } from "../context/contexts.js";
import { colorFor, initials, timeAgo } from "../utils/helpers.js";
import { containsBlockedContent, BLOCKED_CONTENT_MESSAGE } from "../utils/contentFilter.js";

// Mural de testemunhos: diferente do mural de Oração (que e pedido), aqui e
// pra compartilhar o que Deus ja fez — sempre publico, ja que o objetivo e
// encorajar outras pessoas com a historia.
function TestemunhoScreen({ onBack }) {
  const me = useContext(UserContext);
  const meName = me.name || "Você";
  const { addPost } = useContext(FeedContext);
  const [testemunhos, setTestemunhos] = useState([]);
  const [text, setText] = useState("");
  const [postToFeed, setPostToFeed] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "testemunhos"), where("isPublic", "==", true));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, time: timeAgo(data.createdAt) };
      });
      list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setTestemunhos(list);
    }, err => console.error("TESTEMUNHO_LOAD_ERR", err.code, err.message));
    return () => unsub();
  }, []);

  const submit = async () => {
    if (!text.trim() || sending) return;
    if (containsBlockedContent(text)) { setConfirmation(BLOCKED_CONTENT_MESSAGE); setTimeout(() => setConfirmation(""), 3000); return; }
    setSending(true);
    try {
      const docRef = await addDoc(collection(db, "testemunhos"), {
        author: meName, authorUid: me.uid, text: text.trim(), isPublic: true, amenBy: [], createdAt: serverTimestamp(),
      });
      if (postToFeed) {
        addPost({ author: meName, authorUid: me.uid, text: `🙌 Testemunho de ${meName}: ${text.trim()}`, kind: "testemunho", testemunhoId: docRef.id })
          .catch(err => console.error("TESTEMUNHO_FEED_POST_ERR", err.code, err.message));
      }
      setConfirmation("Testemunho publicado! Que essa história encoraje outras pessoas. 🙌");
      setText("");
      setPostToFeed(false);
    } catch (err) {
      console.error("TESTEMUNHO_ADD_ERR", err.code, err.message);
      setConfirmation("Não consegui enviar agora. Tenta de novo.");
    }
    setSending(false);
    setTimeout(() => setConfirmation(""), 3000);
  };

  const toggleAmem = (t) => {
    const amenando = (t.amenBy || []).includes(meName);
    updateDoc(doc(db, "testemunhos", t.id), { amenBy: amenando ? arrayRemove(meName) : arrayUnion(meName) })
      .catch(err => console.error("TESTEMUNHO_AMEM_ERR", err.code, err.message));
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#8A6D3B1E" }}>
          <Award size={20} color="#8A6D3B" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">Testemunhos</h1>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mt-0.5">O que Deus tem feito na sua vida</p>
        </div>
      </div>

      <div className="mx-6 rounded-3xl p-4 mb-6" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Conte o que Deus fez na sua vida..." rows={3}
          className="w-full outline-none text-[13.5px] resize-none bg-transparent"
          style={{ fontFamily: "Inter", color: "#000000" }} />

        <label className="flex items-center gap-2.5 mt-3 pt-3 cursor-pointer" style={{ borderTop: "1px solid #E8E8E8" }}>
          <input type="checkbox" checked={postToFeed} onChange={e => setPostToFeed(e.target.checked)}
            className="w-4 h-4 rounded" style={{ accentColor: "#000000" }} />
          <span style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12px]">Publicar também no Feed</span>
        </label>

        <button onClick={submit} disabled={!text.trim() || sending}
          className="w-full mt-3 py-3 rounded-full font-semibold text-[13.5px] active:scale-[0.98] transition-transform"
          style={{ fontFamily: "Inter", background: text.trim() ? "#000000" : "#E3E3E3", color: text.trim() ? "#FFFFFF" : "#9E9E9E" }}>
          {sending ? "Enviando..." : "Compartilhar testemunho"}
        </button>

        {confirmation && (
          <p style={{ fontFamily: "Inter", color: "#5C6B45" }} className="text-[12px] text-center mt-3">{confirmation}</p>
        )}
      </div>

      <div className="px-6 mb-3">
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px]">Mural de testemunhos da igreja</p>
      </div>

      <div className="px-6 pb-10 flex flex-col gap-3">
        {testemunhos.length === 0 ? (
          <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Nenhum testemunho ainda. Seja o primeiro a compartilhar!</p>
          </div>
        ) : testemunhos.map(t => {
          const amenando = (t.amenBy || []).includes(meName);
          return (
            <div key={t.id} className="rounded-2xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(t.author) }}>
                  <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[10px]">{initials(t.author)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px] truncate">{t.author}</p>
                  <p style={{ fontFamily: "IBM Plex Mono", color: "#9E9E9E" }} className="text-[10px]">{t.time}</p>
                </div>
              </div>
              <p style={{ fontFamily: "Fraunces", color: "#000000" }} className="text-[14.5px] leading-snug mb-3">{t.text}</p>
              <button onClick={() => toggleAmem(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={{ fontFamily: "Inter", background: amenando ? "#8A6D3B" : "#F2F2F2", color: amenando ? "#FFFFFF" : "#4D4D4D" }}>
                🙌 {amenando ? "Amém!" : "Dar um Amém"} {(t.amenBy || []).length > 0 && `· ${t.amenBy.length}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TestemunhoScreen;
