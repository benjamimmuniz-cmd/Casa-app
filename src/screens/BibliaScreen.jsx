import React, { useState, useEffect, useContext, createContext } from "react";
import { NT_BOOKS, OT_BOOKS } from "../data/constants.js";
import VerseReader from "../components/VerseReader.jsx";
import PlanoLeituraScreen from "./PlanoLeituraScreen.jsx";

function BibliaScreen({ onBack, initialSection = "livros" }) {
  const [section, setSection] = useState(initialSection); // livros | plano
  const [bookSel, setBookSel] = useState(null);
  const [chapterSel, setChapterSel] = useState(null);
  const [highlighted, setHighlighted] = useState(new Set());
  const [done, setDone] = useState(false);

  if (section === "plano") {
    return <PlanoLeituraScreen onBack={() => setSection("livros")} />;
  }

  const toggleVerse = (n) => {
    setHighlighted(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  const openChapter = (book, chapter) => {
    setHighlighted(new Set());
    setDone(false);
    setBookSel(book);
    setChapterSel(chapter);
  };

  if (bookSel && chapterSel) {
    return (
      <div className="flex-1 flex flex-col relative min-h-0" style={{ background: "var(--c-bg)" }}>
        <div className="px-6 pt-6 pb-4">
          <button onClick={() => setChapterSel(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>
            ← {bookSel}
          </button>
        </div>
        <div className="px-6 mb-4">
          <h2 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[24px]">{bookSel} {chapterSel}</h2>
          <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] mt-1">Toque em um versículo para marcá-lo</p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-28">
          <VerseReader book={bookSel} chapter={chapterSel} highlighted={highlighted} toggleVerse={toggleVerse} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: "linear-gradient(180deg, transparent, var(--c-bg) 30%)" }}>
          {done ? (
            <div className="w-full py-4 rounded-full text-center text-[14px]" style={{ background: "var(--c-accent)", color: "#FFFFFF", fontFamily: "Inter" }}>
              🔥 Leitura concluída!
            </div>
          ) : (
            <button onClick={() => setDone(true)}
              className="w-full py-4 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "var(--c-accent-2)", color: "#F2F2F2", fontFamily: "Inter" }}>
              Marcar capítulo como concluído
            </button>
          )}
        </div>
      </div>
    );
  }

  if (bookSel) {
    const count = [...OT_BOOKS, ...NT_BOOKS].find(([n]) => n === bookSel)?.[1] || 1;
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "var(--c-bg)" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setBookSel(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>← Livros</button>
        </div>
        <div className="px-6 mt-1 mb-5">
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[22px]">{bookSel}</h1>
          <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] mt-1">{count} capítulo{count > 1 ? "s" : ""} — escolha um</p>
        </div>
        <div className="px-6 pb-10 grid grid-cols-5 gap-2.5">
          {Array.from({ length: count }, (_, i) => i + 1).map(c => (
            <button key={c} onClick={() => openChapter(bookSel, c)}
              className="aspect-square rounded-xl flex items-center justify-center active:scale-95 transition-transform"
              style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
              <span style={{ fontFamily: "IBM Plex Mono", color: "var(--c-text)" }} className="text-[13px]">{c}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "var(--c-bg)" }}>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[22px]">A Bíblia</h1>
        <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[12px] mt-1">Todos os livros, do Gênesis ao Apocalipse.</p>
      </div>

      <div className="px-6 mb-5 flex gap-2">
        <button onClick={() => setSection("livros")}
          className="flex-1 py-2.5 rounded-full text-[13px] font-semibold"
          style={{ fontFamily: "Inter", background: "var(--c-accent)", color: "#FFFFFF" }}>
          Livros
        </button>
        <button onClick={() => setSection("plano")}
          className="flex-1 py-2.5 rounded-full text-[13px] font-semibold"
          style={{ fontFamily: "Inter", background: "var(--c-surface)", color: "var(--c-text-2)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
          Plano de Leitura
        </button>
      </div>

      <div className="px-6 mb-2">
        <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[11px] font-semibold mb-2 uppercase tracking-wide">Antigo Testamento</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {OT_BOOKS.map(([name, count]) => (
            <button key={name} onClick={() => setBookSel(name)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left active:scale-[0.98] transition-transform"
              style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
              <span style={{ fontFamily: "Inter", color: "var(--c-text)" }} className="text-[12px] truncate pr-1">{name}</span>
              <span style={{ fontFamily: "IBM Plex Mono", color: "var(--c-faint)" }} className="text-[10px] shrink-0">{count}</span>
            </button>
          ))}
        </div>
        <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[11px] font-semibold mb-2 uppercase tracking-wide">Novo Testamento</p>
        <div className="grid grid-cols-2 gap-2 pb-10">
          {NT_BOOKS.map(([name, count]) => (
            <button key={name} onClick={() => setBookSel(name)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left active:scale-[0.98] transition-transform"
              style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
              <span style={{ fontFamily: "Inter", color: "var(--c-text)" }} className="text-[12px] truncate pr-1">{name}</span>
              <span style={{ fontFamily: "IBM Plex Mono", color: "var(--c-faint)" }} className="text-[10px] shrink-0">{count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BibliaScreen;
