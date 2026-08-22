import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { loadChapter } from "../data/bibleLoader.js";

function VerseReader({ book, chapter, highlighted, toggleVerse }) {
  const [verses, setVerses] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setVerses(null);
    loadChapter(book, chapter).then(v => {
      if (active) { setVerses(v); setLoading(false); }
    });
    return () => { active = false; };
  }, [book, chapter]);

  if (loading) {
    return (
      <div className="text-center mt-10">
        <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[12px]">Carregando...</p>
      </div>
    );
  }

  if (!verses || !verses.length) {
    return (
      <div className="rounded-2xl p-5 text-center mt-4" style={{ background: "#FFFFFF", border: "1px dashed #D6D6D6" }}>
        <BookOpen size={22} color="#9E9E9E" className="mx-auto mb-3" />
        <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[14px] mb-1">
          Não foi possível carregar {book} {chapter}
        </p>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] leading-relaxed">
          Tente voltar e abrir o capítulo novamente.
        </p>
      </div>
    );
  }

  return (
    <>
      {verses.map(v => (
        <p key={v.n} onClick={() => toggleVerse(v.n)}
          className="text-[16px] leading-[1.8] mb-1 px-2 py-1 rounded-lg cursor-pointer transition-colors"
          style={{
            fontFamily: "Fraunces", color: "var(--c-text)",
            background: highlighted.has(v.n) ? "#F3D18A88" : "transparent",
          }}>
          <span style={{ fontFamily: "IBM Plex Mono", fontSize: 10, color: "var(--c-faint)", marginRight: 6, verticalAlign: "super" }}>{v.n}</span>
          {v.text}
        </p>
      ))}
      <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] mt-6 text-center">
        Tradução Brasileira (1917) — domínio público.
      </p>
    </>
  );
}

export default VerseReader;
