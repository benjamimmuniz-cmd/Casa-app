import React, { useState, useMemo, useContext } from "react";
import {
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import ProgressRing from "../components/ProgressRing.jsx";
import ReadingHeatmap from "../components/ReadingHeatmap.jsx";
import VerseReader from "../components/VerseReader.jsx";
import CelebrationOverlay from "../components/CelebrationOverlay.jsx";
import { TOTAL_READING_DAYS, TOTAL_CHAPTERS, PLAN_TYPES, getDayReading, chaptersReadThrough, formatReadingLabel } from "../data/readingPlan.js";
import { loadReadingProgress, saveReadingProgress } from "../utils/readingProgress.js";
import { READING_ACHIEVEMENTS } from "../data/constants.js";
import { FeedContext, UserContext } from "../context/contexts.js";

function PlanoLeituraScreen({ onBack }) {
  const me = useContext(UserContext).name || "Você";
  const { addPost } = useContext(FeedContext);
  const [view, setView] = useState("plano"); // plano | leitura
  const [progress, setProgress] = useState(loadReadingProgress);
  const [highlightedByChapter, setHighlightedByChapter] = useState({});
  const [newAchievement, setNewAchievement] = useState(null);
  const [shared, setShared] = useState(false);

  const activePlan = progress.activePlan;
  const planProgress = progress[activePlan];
  const currentDay = Math.min(planProgress.currentDay, TOTAL_READING_DAYS);
  const planFinished = planProgress.currentDay > TOTAL_READING_DAYS;
  const todaysReading = useMemo(() => getDayReading(currentDay, activePlan), [currentDay, activePlan]);
  const readingLabel = useMemo(() => formatReadingLabel(todaysReading), [todaysReading]);

  const pct = Math.round(((currentDay - 1) / TOTAL_READING_DAYS) * 100);
  const chaptersRead = chaptersReadThrough(currentDay - 1, activePlan);

  const chapterKey = (r) => `${r.book}-${r.chapter}`;

  const toggleVerse = (r, n) => {
    const key = chapterKey(r);
    setHighlightedByChapter(prev => {
      const next = new Set(prev[key] || []);
      next.has(n) ? next.delete(n) : next.add(n);
      return { ...prev, [key]: next };
    });
  };

  const markDayComplete = () => {
    const completedDays = planProgress.completedDays + 1;
    const next = { ...progress, [activePlan]: { currentDay: planProgress.currentDay + 1, completedDays } };
    setProgress(next);
    saveReadingProgress(next);
    setHighlightedByChapter({});
    setView("plano");
    const unlocked = READING_ACHIEVEMENTS.find(a => a.days === completedDays);
    if (unlocked) { setNewAchievement(unlocked); setShared(false); }
  };

  const switchPlan = (planId) => {
    if (planId === activePlan) return;
    const next = { ...progress, activePlan: planId };
    setProgress(next);
    saveReadingProgress(next);
    setHighlightedByChapter({});
  };

  const shareAchievement = () => {
    if (!newAchievement) return;
    addPost({
      author: me,
      text: `Desbloqueei a conquista "${newAchievement.title}" no Plano de Leitura! ${newAchievement.desc}. 🙌`,
      kind: "conquista",
    }).catch(err => console.error("CONQUISTA_FEED_POST_ERR", err.code, err.message));
    setShared(true);
  };

  if (view === "leitura") {
    return (
      <div className="flex-1 flex flex-col relative" style={{ background: "#F2F2F2" }}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <button onClick={() => setView("plano")} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>
            ← Plano
          </button>
          <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#0000000F", color: "#616161" }}>
            Dia {currentDay} de {TOTAL_READING_DAYS}
          </span>
        </div>
        <div className="px-6 mb-4">
          <h2 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[24px]">{readingLabel}</h2>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-1">Toque em um versículo para marcá-lo</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-28">
          {todaysReading.map((r) => (
            <div key={chapterKey(r)} className="mb-8">
              {todaysReading.length > 1 && (
                <h3 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px] mb-2">
                  {r.book} {r.chapter}
                </h3>
              )}
              <VerseReader book={r.book} chapter={r.chapter}
                highlighted={highlightedByChapter[chapterKey(r)] || new Set()}
                toggleVerse={(n) => toggleVerse(r, n)} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: "linear-gradient(180deg, transparent, #F2F2F2 30%)" }}>
          <button onClick={markDayComplete}
            className="w-full py-4 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
            style={{ background: "#2B2B2B", color: "#F2F2F2", fontFamily: "Inter" }}>
            Marcar dia como concluído
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>
          ← Início
        </button>
        <ProgressRing pct={pct} />
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px]">Plano de Leitura Anual</h1>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mt-1">
          {PLAN_TYPES.find(p => p.id === activePlan)?.desc}
        </p>
      </div>

      <div className="px-6 mb-5 flex gap-2">
        {PLAN_TYPES.map(p => (
          <button key={p.id} onClick={() => switchPlan(p.id)}
            className="flex-1 py-2.5 rounded-full text-[12px] font-semibold"
            style={{
              fontFamily: "Inter",
              background: activePlan === p.id ? "#000000" : "#FFFFFF",
              color: activePlan === p.id ? "#FFFFFF" : "#4D4D4D",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="mx-6 rounded-3xl p-4 mb-5" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] mb-3">Seu ano de leitura</p>
        <div className="overflow-x-auto pb-1">
          <ReadingHeatmap daysRead={planProgress.completedDays} />
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-[2px]" style={{ background: "#2B2B2B" }} />
            <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[10px]">Lido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-[2px]" style={{ border: "1px solid #D6D6D6" }} />
            <span style={{ fontFamily: "Inter", color: "#707070" }} className="text-[10px]">Pendente</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-6 mb-5">
        {[[`${pct}%`, "do ano"], [String(planProgress.completedDays), "dias concluídos"], [`${chaptersRead}/${TOTAL_CHAPTERS}`, "capítulos"]].map(([v, l]) => (
          <div key={l} className="rounded-2xl py-3 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[16px]">{v}</p>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[10px] mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] mb-2 px-6">Conquistas</p>
        <div className="flex gap-3 overflow-x-auto px-6 pb-1">
          {READING_ACHIEVEMENTS.map(a => {
            const unlocked = planProgress.completedDays >= a.days;
            const Icon = a.icon;
            return (
              <div key={a.days} className="flex flex-col items-center shrink-0" style={{ width: 70 }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1.5"
                  style={{ background: unlocked ? a.color + "22" : "#00000009" }}>
                  <Icon size={22} color={unlocked ? a.color : "#C4C4C4"} />
                </div>
                <p style={{ fontFamily: "Inter", color: unlocked ? "#000000" : "#B0B0B0", fontWeight: unlocked ? 600 : 400 }} className="text-[9.5px] text-center leading-tight">{a.title}</p>
                <p style={{ fontFamily: "IBM Plex Mono", color: "#9E9E9E" }} className="text-[8.5px] mt-0.5">{a.days}d</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-8">
        {planFinished ? (
          <div className="w-full rounded-2xl p-4 text-center" style={{ background: "#000000" }}>
            <p style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[16px]">
              🎉 Você completou o plano de leitura!
            </p>
            <p style={{ fontFamily: "Inter", color: "rgba(242,242,242,0.7)" }} className="text-[11px] mt-1">
              Toda a Bíblia, do Gênesis ao Apocalipse.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] mb-3">Leitura de hoje</p>
            <button onClick={() => setView("leitura")}
              className="w-full rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
              style={{ background: "#000000" }}>
              <div className="text-left">
                <p style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[16px]">{readingLabel}</p>
                <p style={{ fontFamily: "Inter", color: "#FFFFFF" }} className="text-[11px] mt-1">Abrir leitura de hoje</p>
              </div>
              <ChevronRight size={18} color="#FFFFFF" />
            </button>
            <button onClick={markDayComplete}
              className="w-full mt-3 py-3.5 rounded-full font-semibold text-[13.5px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#2B2B2B", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <CheckCircle2 size={16} />
              Marcar leitura de hoje como concluída
            </button>
          </>
        )}
      </div>

      {newAchievement && (
        <CelebrationOverlay
          icon={newAchievement.icon}
          title={newAchievement.title}
          desc={newAchievement.desc}
          accent={newAchievement.color}
          buttonLabel="Continuar"
          secondaryLabel="Compartilhar no Feed"
          onSecondary={shareAchievement}
          secondaryDone={shared}
          secondaryDoneLabel="Compartilhado no Feed! 🎉"
          onDismiss={() => setNewAchievement(null)}
        />
      )}
    </div>
  );
}

export default PlanoLeituraScreen;
