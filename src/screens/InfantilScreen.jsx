import React, { useState, useEffect, useContext } from "react";
import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Keyboard,
  Lock,
  Palette,
  PartyPopper,
  PenLine,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { collection, query, where, onSnapshot, updateDoc, doc, arrayUnion, increment } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials } from "../utils/helpers.js";
import { AGE_GROUPS, ATIVIDADES_PDF } from "../data/constants.js";
import { BIBLE_STORIES, todaysStoryFor } from "../data/kidsActivities.js";
import { COLORING_PAGES } from "../data/coloringPages.js";
import { HANGMAN_WORDS, VERSE_FILLS } from "../data/kidsGames.js";
import { MEMORY_SETS, COUNTING_GAMES } from "../data/kidsGamesInfantil.js";
import { BADGES_BY_GROUP, badgeProgress, groupIdForAge } from "../data/kidsBadges.js";
import ColoringCanvas from "../components/ColoringCanvas.jsx";
import HangmanGame from "../components/HangmanGame.jsx";
import VerseFillGame from "../components/VerseFillGame.jsx";
import MemoryGame from "../components/MemoryGame.jsx";
import CountingGame from "../components/CountingGame.jsx";

const CRAYONS = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#00897B", "#1E88E5", "#5E35B1", "#D81B60", "#6D4C41", "#FFFFFF"];
const TABS = [
  { id: "historias", label: "Histórias", icon: BookOpen },
  { id: "atividades", label: "Atividades", icon: Palette },
  { id: "conquistas", label: "Conquistas", icon: Award },
];

function InfantilScreen({ onBack }) {
  const me = useContext(UserContext);
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeTab, setActiveTab] = useState("historias");
  const [children, setChildren] = useState([]);
  const [openStoryId, setOpenStoryId] = useState(null);
  const [coloringFills, setColoringFills] = useState({});
  const [openColoringId, setOpenColoringId] = useState(null);
  const [activeCrayon, setActiveCrayon] = useState(CRAYONS[0]);
  const [openHangmanId, setOpenHangmanId] = useState(null);
  const [openVerseFillId, setOpenVerseFillId] = useState(null);
  const [openMemoryId, setOpenMemoryId] = useState(null);
  const [openCountingId, setOpenCountingId] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [openBadge, setOpenBadge] = useState(null);
  const group = AGE_GROUPS[activeGroup];
  const todayStory = todaysStoryFor(group.id);
  const groupStories = BIBLE_STORIES.filter(s => s.groupId === group.id);
  const openStory = openStoryId ? groupStories.find(s => s.id === openStoryId) : null;
  const coloringPages = COLORING_PAGES.filter(p => p.groupIds.includes(group.id));
  const openColoringPage = COLORING_PAGES.find(p => p.id === openColoringId);
  const groupHangman = HANGMAN_WORDS.filter(w => w.groupId === group.id);
  const openHangman = groupHangman.find(w => w.id === openHangmanId);
  const groupVerseFills = VERSE_FILLS.filter(v => v.groupId === group.id);
  const openVerseFill = groupVerseFills.find(v => v.id === openVerseFillId);
  const groupMemorySets = MEMORY_SETS.filter(s => s.groupId === group.id);
  const openMemorySet = groupMemorySets.find(s => s.id === openMemoryId);
  const groupCountingGames = COUNTING_GAMES.filter(g => g.groupId === group.id);
  const openCounting = groupCountingGames.find(g => g.id === openCountingId);

  const paintRegion = (pageId, regionId) => {
    setColoringFills(prev => ({ ...prev, [pageId]: { ...(prev[pageId] || {}), [regionId]: activeCrayon } }));
  };
  const clearColoring = (pageId) => {
    setColoringFills(prev => ({ ...prev, [pageId]: {} }));
  };

  useEffect(() => {
    if (!me.uid) { setChildren([]); return; }
    const q = query(collection(db, "kids"), where("parentUid", "==", me.uid));
    const unsub = onSnapshot(q, snap => {
      setChildren(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [me.uid]);

  useEffect(() => {
    if (children.length === 0) { setSelectedChildId(null); return; }
    if (!children.some(c => c.id === selectedChildId)) setSelectedChildId(children[0].id);
  }, [children]);

  useEffect(() => { setOpenStoryId(null); setOpenHangmanId(null); setOpenVerseFillId(null); setOpenMemoryId(null); setOpenCountingId(null); }, [activeGroup]);

  const selectedChild = children.find(c => c.id === selectedChildId);

  const markStoryReadFor = (childId, storyId) => {
    updateDoc(doc(db, "kids", childId), { storiesRead: arrayUnion(storyId) })
      .catch(err => console.error("KID_STORY_READ_ERR", err.code, err.message));
  };

  const recordHangmanWin = () => {
    if (!selectedChildId) return;
    updateDoc(doc(db, "kids", selectedChildId), { hangmanWins: increment(1) })
      .catch(err => console.error("KID_HANGMAN_WIN_ERR", err.code, err.message));
  };

  const recordVerseCorrect = () => {
    if (!selectedChildId) return;
    updateDoc(doc(db, "kids", selectedChildId), { versesCorrect: increment(1) })
      .catch(err => console.error("KID_VERSE_CORRECT_ERR", err.code, err.message));
  };

  const recordMemoryWin = () => {
    if (!selectedChildId) return;
    updateDoc(doc(db, "kids", selectedChildId), { memoryWins: increment(1) })
      .catch(err => console.error("KID_MEMORY_WIN_ERR", err.code, err.message));
  };

  const recordCountingCorrect = () => {
    if (!selectedChildId) return;
    updateDoc(doc(db, "kids", selectedChildId), { countingCorrect: increment(1) })
      .catch(err => console.error("KID_COUNTING_CORRECT_ERR", err.code, err.message));
  };

  if (openColoringPage) {
    const fills = coloringFills[openColoringPage.id] || {};
    return (
      <div className="absolute inset-0 z-50 flex flex-col" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0">
          <button onClick={() => setOpenColoringId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Área Infantil</button>
          <button onClick={() => clearColoring(openColoringPage.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
            <RotateCcw size={12} color="#8A7F6E" />
            <span style={{ fontFamily: "Inter", color: "#8A7F6E" }} className="text-[11px] font-semibold">Limpar</span>
          </button>
        </div>
        <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[17px] px-6 mt-1 mb-2 shrink-0">{openColoringPage.emoji} {openColoringPage.title}</p>
        <div className="flex-1 min-h-0 px-6 pb-3">
          <div className="w-full h-full rounded-3xl" style={{ background: "#FFFFFF", boxShadow: "0 2px 10px rgba(180,140,80,0.12)" }}>
            <ColoringCanvas page={openColoringPage} fills={fills} onRegionClick={(regionId) => paintRegion(openColoringPage.id, regionId)} />
          </div>
        </div>
        <div className="px-6 py-4 flex items-center gap-2.5 overflow-x-auto shrink-0" style={{ borderTop: "1px solid #F0E4CF" }}>
          {CRAYONS.map(c => (
            <button key={c} onClick={() => setActiveCrayon(c)}
              className="w-9 h-9 rounded-full shrink-0 active:scale-90 transition-transform"
              style={{
                background: c,
                border: c === "#FFFFFF" ? "1px solid #E0D6C2" : "none",
                boxShadow: activeCrayon === c ? "0 0 0 3px #FFF8EE, 0 0 0 5px #3A2E22" : "0 1px 3px rgba(0,0,0,0.15)",
              }} />
          ))}
        </div>
      </div>
    );
  }

  if (openHangman) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenHangmanId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Atividades</button>
        </div>
        <div className="px-6 mt-2 mb-6">
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[18px]">{openHangman.emoji} Jogo da Forca</p>
        </div>
        <div className="px-6 pb-8">
          <HangmanGame item={openHangman} color={group.color} onWin={recordHangmanWin} />
        </div>
      </div>
    );
  }

  if (openVerseFill) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenVerseFillId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Atividades</button>
        </div>
        <div className="px-6 mt-2 mb-6">
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[18px]">📖 Complete o Versículo</p>
        </div>
        <div className="px-6 pb-8">
          <VerseFillGame item={openVerseFill} color={group.color} onCorrect={recordVerseCorrect} />
        </div>
      </div>
    );
  }

  if (openMemorySet) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenMemoryId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Atividades</button>
        </div>
        <div className="px-6 mt-2 mb-6">
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[18px]">{openMemorySet.emoji} {openMemorySet.title}</p>
        </div>
        <div className="px-6 pb-8">
          <MemoryGame set={openMemorySet} color={group.color} onWin={recordMemoryWin} />
        </div>
      </div>
    );
  }

  if (openCounting) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenCountingId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Atividades</button>
        </div>
        <div className="px-6 mt-2 mb-6">
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[18px]">🔢 Quantos Você Vê?</p>
        </div>
        <div className="px-6 pb-8">
          <CountingGame item={openCounting} color={group.color} onCorrect={recordCountingCorrect} />
        </div>
      </div>
    );
  }

  if (openStory) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenStoryId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Histórias</button>
        </div>
        <div className="px-6 mt-2 mb-5">
          <div className="rounded-3xl p-5 mb-3" style={{ background: "#FFFFFF", boxShadow: "0 2px 10px rgba(180,140,80,0.12)", border: `2px solid ${group.color}33` }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${group.color}1E`, fontSize: 30 }}>
                {openStory.emoji}
              </div>
              <div>
                <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[16px] leading-tight">{openStory.title}</p>
                <p style={{ fontFamily: "IBM Plex Mono", color: group.color }} className="text-[10px] mt-1">{openStory.verse}</p>
              </div>
            </div>
            <p style={{ fontFamily: "Inter", color: "#5A5045" }} className="text-[13px] leading-relaxed mb-3">{openStory.text}</p>
            <div className="rounded-2xl p-3 flex items-start gap-2" style={{ background: `${group.color}14` }}>
              <PartyPopper size={15} color={group.color} className="shrink-0 mt-0.5" />
              <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[12px] leading-snug">{openStory.moral}</p>
            </div>
          </div>

          {children.length > 0 && (
            <div className="rounded-2xl p-3.5" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
              <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[10.5px] mb-2">Marcar como lida pra:</p>
              <div className="flex flex-wrap gap-2">
                {children.map(c => {
                  const read = (c.storiesRead || []).includes(openStory.id);
                  return (
                    <button key={c.id} onClick={() => { setSelectedChildId(c.id); if (!read) markStoryReadFor(c.id, openStory.id); }}
                      className="flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full"
                      style={{ background: read ? "#2FA8A01E" : "#FFF8EE" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                        <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontSize: 9, fontWeight: 700 }}>{initials(c.name)}</span>
                      </div>
                      <span style={{ fontFamily: "Inter", color: read ? "#1D7A72" : "#3A2E22", fontWeight: 600 }} className="text-[11.5px]">{c.name}</span>
                      {read && <Check size={12} color="#1D7A72" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Início</button>
      </div>

      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[22px]">Área Infantil</h1>
        <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12px] mt-1">Histórias, atividades e o desenvolvimento do seu filho na igreja</p>
      </div>

      <div className="flex gap-2 px-6 mb-4">
        {AGE_GROUPS.map((g, i) => (
          <button key={g.id} onClick={() => setActiveGroup(i)}
            className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            style={{
              fontFamily: "Inter",
              background: activeGroup === i ? g.color : "#FFFFFF",
              color: activeGroup === i ? "#FFFFFF" : "#6B6255",
              boxShadow: activeGroup === i ? `0 4px 12px ${g.color}55` : "0 1px 3px rgba(180,140,80,0.08)",
            }}>
            <span>{g.emoji}</span>{g.label}
          </button>
        ))}
      </div>

      <div className="mx-6 rounded-3xl p-4 mb-5 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}CC)` }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.25)", fontSize: 22 }}>
          {group.emoji}
        </div>
        <p style={{ fontFamily: "Fraunces", fontStyle: "italic", color: "#FFFFFF" }} className="text-[13.5px] leading-snug">
          {group.intro}
        </p>
      </div>

      <div className="flex gap-2 px-6 mb-5">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex-1 py-2.5 rounded-2xl text-[11.5px] font-semibold flex items-center justify-center gap-1.5"
              style={{
                fontFamily: "Inter",
                background: active ? "#3A2E22" : "#FFFFFF",
                color: active ? "#FFFFFF" : "#6B6255",
                boxShadow: "0 1px 3px rgba(180,140,80,0.08)",
              }}>
              <Icon size={13} />{t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "historias" && (
        <div className="px-6 mb-8">
          {todayStory && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} color={group.color} />
                <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px]">História de hoje</p>
              </div>
              <button onClick={() => setOpenStoryId(todayStory.id)} className="w-full text-left rounded-3xl p-4 mb-6 flex items-center gap-3 active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 2px 10px rgba(180,140,80,0.12)", border: `2px solid ${group.color}33` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${group.color}1E`, fontSize: 28 }}>
                  {todayStory.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[15px] leading-tight">{todayStory.title}</p>
                  <p style={{ fontFamily: "IBM Plex Mono", color: group.color }} className="text-[10px] mt-1">{todayStory.verse}</p>
                </div>
                <ChevronRight size={16} color="#D8CBB4" />
              </button>
            </>
          )}

          <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px] mb-3">Todas as histórias · {group.label}</p>
          {groupStories.length === 0 ? (
            <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Nenhuma história cadastrada pra essa faixa ainda.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {groupStories.map(s => (
                <button key={s.id} onClick={() => setOpenStoryId(s.id)}
                  className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${group.color}1E`, fontSize: 20 }}>
                    {s.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[13px]">{s.title}</p>
                    <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[11px]">{s.verse}</p>
                  </div>
                  <ChevronRight size={16} color="#D8CBB4" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "atividades" && group.id === "p" && (
        <div className="px-6 mb-8">
          {children.length > 0 && (
            <div className="rounded-2xl p-3 mb-5 flex items-center gap-2 overflow-x-auto" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
              <span style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[10.5px] shrink-0">Jogando como:</span>
              {children.map(c => (
                <button key={c.id} onClick={() => setSelectedChildId(c.id)}
                  className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full shrink-0"
                  style={{ background: selectedChildId === c.id ? `${group.color}1E` : "#FFF8EE" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                    <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontSize: 8, fontWeight: 700 }}>{initials(c.name)}</span>
                  </div>
                  <span style={{ fontFamily: "Inter", color: selectedChildId === c.id ? group.color : "#9A8B76", fontWeight: 600 }} className="text-[11px]">{c.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: 14 }}>🧩</span>
            <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px]">Jogo da memória</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {groupMemorySets.map(s => (
              <button key={s.id} onClick={() => setOpenMemoryId(s.id)}
                className="rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
                <span style={{ fontSize: 26 }}>{s.emoji}</span>
                <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[12px] mt-2">{s.title}</p>
                <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[10.5px] mt-1">{s.pieces.length} pares</p>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: 14 }}>🔢</span>
            <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px]">Quantos você vê?</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {groupCountingGames.map(g => (
              <button key={g.id} onClick={() => setOpenCountingId(g.id)}
                className="rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
                style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
                <span style={{ fontSize: 26 }}>{g.emoji}</span>
                <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[12px] mt-2">Contar {g.emoji}</p>
              </button>
            ))}
          </div>

          {coloringPages.length === 0 ? (
            <div className="rounded-2xl p-4 text-center mb-5" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Nenhuma atividade pra essa faixa ainda.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: 14 }}>🖍️</span>
                <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px]">Pra colorir agora, direto no app</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {coloringPages.map(p => (
                  <button key={p.id} onClick={() => setOpenColoringId(p.id)}
                    className="rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                    style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
                    <div className="rounded-xl mb-2 overflow-hidden" style={{ background: "#FFF8EE", aspectRatio: "1 / 1" }}>
                      <ColoringCanvas page={p} fills={coloringFills[p.id] || {}} interactive={false} />
                    </div>
                    <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[12px]">{p.emoji} {p.title}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="rounded-3xl p-4" style={{ background: "linear-gradient(135deg, #7C6CE8, #5A4BC7)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                <BookOpen size={19} color="#FFFFFF" />
              </div>
              <div>
                <p style={{ fontFamily: "Fraunces", color: "#FFFFFF", fontWeight: 600 }} className="text-[14px]">Prefere imprimir?</p>
                <p style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.75)" }} className="text-[11px] mt-0.5">60 páginas em PDF: colorir, ligar pontos e mais</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={ATIVIDADES_PDF} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-full text-center text-[12px] font-semibold"
                style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#5A4BC7" }}>
                Abrir PDF
              </a>
              <a href={ATIVIDADES_PDF} download="atividades-biblicas-infantis.pdf"
                className="flex-1 py-2.5 rounded-full text-center text-[12px] font-semibold"
                style={{ fontFamily: "Inter", background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.35)" }}>
                Baixar
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === "atividades" && group.id !== "p" && (
        <div className="px-6 mb-8">
          {children.length > 0 && (
            <div className="rounded-2xl p-3 mb-5 flex items-center gap-2 overflow-x-auto" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
              <span style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[10.5px] shrink-0">Jogando como:</span>
              {children.map(c => (
                <button key={c.id} onClick={() => setSelectedChildId(c.id)}
                  className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full shrink-0"
                  style={{ background: selectedChildId === c.id ? `${group.color}1E` : "#FFF8EE" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                    <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontSize: 8, fontWeight: 700 }}>{initials(c.name)}</span>
                  </div>
                  <span style={{ fontFamily: "Inter", color: selectedChildId === c.id ? group.color : "#9A8B76", fontWeight: 600 }} className="text-[11px]">{c.name}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            <Keyboard size={14} color={group.color} />
            <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px]">Jogo da forca</p>
          </div>
          {groupHangman.length === 0 ? (
            <div className="rounded-2xl p-4 text-center mb-6" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Nenhum jogo pra essa faixa ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {groupHangman.map(w => (
                <button key={w.id} onClick={() => setOpenHangmanId(w.id)}
                  className="rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
                  <span style={{ fontSize: 26 }}>{w.emoji}</span>
                  <p style={{ fontFamily: "IBM Plex Mono", color: group.color, letterSpacing: 2 }} className="text-[13px] mt-2">
                    {w.word.replace(/./g, "_ ").trim()}
                  </p>
                  <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[10.5px] mt-1">{w.word.length} letras</p>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <PenLine size={14} color={group.color} />
            <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px]">Complete o versículo</p>
          </div>
          {groupVerseFills.length === 0 ? (
            <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Nenhum versículo pra essa faixa ainda.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {groupVerseFills.map(v => (
                <button key={v.id} onClick={() => setOpenVerseFillId(v.id)}
                  className="w-full flex items-center gap-3 rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${group.color}1E` }}>
                    <PenLine size={16} color={group.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[12.5px]">{v.reference}</p>
                    <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[11px] truncate">{v.before} ___{v.after}</p>
                  </div>
                  <ChevronRight size={16} color="#D8CBB4" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "conquistas" && (
        <div className="px-6 mb-8">
          {children.length === 0 ? (
            <div className="rounded-2xl p-5 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
              <Award size={22} color="#D8CBB4" className="mx-auto mb-2" />
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Cadastre uma criança na tela Meus Filhos pra começar a colecionar medalhas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {children.map(c => {
                const childGroupId = groupIdForAge(c.age);
                const totalGroupStories = BIBLE_STORIES.filter(s => s.groupId === childGroupId).length;
                const badges = BADGES_BY_GROUP[childGroupId] || [];
                const unlockedCount = badges.filter(b => badgeProgress(b, c, totalGroupStories).unlocked).length;
                return (
                  <div key={c.id} className="rounded-3xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(180,140,80,0.1)" }}>
                    <div className="flex items-center gap-3 mb-4">
                      {c.childPhoto ? (
                        <img src={c.childPhoto} alt={c.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                          <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[12px]">{initials(c.name)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[13px]">{c.name}</p>
                        <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[11px]">{unlockedCount} de {badges.length} medalhas</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {badges.map(b => {
                        const { unlocked } = badgeProgress(b, c, totalGroupStories);
                        return (
                          <button key={b.id} onClick={() => setOpenBadge({ child: c, badge: b })}
                            className="flex flex-col items-center gap-1 py-2.5 rounded-2xl active:scale-[0.95] transition-transform"
                            style={{ background: unlocked ? `${group.color}14` : "#FFF8EE" }}>
                            <span style={{ fontSize: 22, opacity: unlocked ? 1 : 0.25, filter: unlocked ? "none" : "grayscale(1)" }}>{b.emoji}</span>
                            {!unlocked && <Lock size={9} color="#D8CBB4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {openBadge && (() => {
        const childGroupId = groupIdForAge(openBadge.child.age);
        const totalGroupStories = BIBLE_STORIES.filter(s => s.groupId === childGroupId).length;
        const { value, need, unlocked } = badgeProgress(openBadge.badge, openBadge.child, totalGroupStories);
        return (
          <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setOpenBadge(null)}>
            <div className="w-full rounded-t-3xl p-6" style={{ background: "#FFF8EE" }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: unlocked ? `${group.color}1E` : "#F0E8D8" }}>
                  <span style={{ fontSize: 32, opacity: unlocked ? 1 : 0.3, filter: unlocked ? "none" : "grayscale(1)" }}>{openBadge.badge.emoji}</span>
                </div>
                <button onClick={() => setOpenBadge(null)}><X size={18} color="#B0A18A" /></button>
              </div>
              <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[17px] mb-1">{openBadge.badge.label}</p>
              <p style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[12.5px] mb-4">{openBadge.badge.desc}</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F0E8D8" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / need) * 100)}%`, background: unlocked ? "#2FA8A0" : group.color }} />
                </div>
                <span style={{ fontFamily: "IBM Plex Mono", color: "#6B6255" }} className="text-[11px] shrink-0">{Math.min(value, need)}/{need}</span>
              </div>
              <p style={{ fontFamily: "Inter", color: unlocked ? "#1D7A72" : "#B0A18A" }} className="text-[12px] mt-3 text-center font-semibold">
                {unlocked ? `Conquistada por ${openBadge.child.name}! 🎉` : `${openBadge.child.name} ainda não conquistou essa medalha.`}
              </p>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default InfantilScreen;
