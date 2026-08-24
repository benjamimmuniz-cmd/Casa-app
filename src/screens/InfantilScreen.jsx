import React, { useState, useEffect, useContext } from "react";
import {
  Baby,
  BookOpen,
  ChevronRight,
  Heart,
  Keyboard,
  Palette,
  PartyPopper,
  PenLine,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials } from "../utils/helpers.js";
import { AGE_GROUPS, ATIVIDADES_PDF } from "../data/constants.js";
import { BIBLE_STORIES, todaysStoryFor } from "../data/kidsActivities.js";
import { COLORING_PAGES } from "../data/coloringPages.js";
import { HANGMAN_WORDS, VERSE_FILLS } from "../data/kidsGames.js";
import ColoringCanvas from "../components/ColoringCanvas.jsx";
import HangmanGame from "../components/HangmanGame.jsx";
import VerseFillGame from "../components/VerseFillGame.jsx";

const CRAYONS = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#00897B", "#1E88E5", "#5E35B1", "#D81B60", "#6D4C41", "#FFFFFF"];
const TABS = [
  { id: "historias", label: "Histórias", icon: BookOpen },
  { id: "atividades", label: "Atividades", icon: Palette },
  { id: "frequencia", label: "Frequência", icon: Users },
];

function InfantilScreen({ onBack }) {
  const me = useContext(UserContext);
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeTab, setActiveTab] = useState("historias");
  const [children, setChildren] = useState([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [openChildId, setOpenChildId] = useState(null);
  const [childForm, setChildForm] = useState({ name: "", age: "", diet: "", childPhoto: null, parentsPhoto: null });
  const [childFormError, setChildFormError] = useState("");
  const [openStoryId, setOpenStoryId] = useState(null);
  const [coloringFills, setColoringFills] = useState({});
  const [openColoringId, setOpenColoringId] = useState(null);
  const [activeCrayon, setActiveCrayon] = useState(CRAYONS[0]);
  const [openHangmanId, setOpenHangmanId] = useState(null);
  const [openVerseFillId, setOpenVerseFillId] = useState(null);
  const group = AGE_GROUPS[activeGroup];
  const openChild = children.find(c => c.id === openChildId);
  const todayStory = todaysStoryFor(group.id);
  const groupStories = BIBLE_STORIES.filter(s => s.groupId === group.id);
  const openStory = openStoryId ? groupStories.find(s => s.id === openStoryId) : null;
  const coloringPages = COLORING_PAGES.filter(p => p.groupIds.includes(group.id));
  const openColoringPage = COLORING_PAGES.find(p => p.id === openColoringId);
  const groupHangman = HANGMAN_WORDS.filter(w => w.groupId === group.id);
  const openHangman = groupHangman.find(w => w.id === openHangmanId);
  const groupVerseFills = VERSE_FILLS.filter(v => v.groupId === group.id);
  const openVerseFill = groupVerseFills.find(v => v.id === openVerseFillId);

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

  useEffect(() => { setOpenStoryId(null); setOpenHangmanId(null); setOpenVerseFillId(null); }, [activeGroup]);

  const todayLabel = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const handleChildPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setChildForm(f => ({ ...f, childPhoto: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleParentsPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setChildForm(f => ({ ...f, parentsPhoto: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAddChild = () => {
    setChildFormError("");
    if (!childForm.name.trim()) { setChildFormError("Digite o nome da criança."); return; }
    if (!childForm.age.trim()) { setChildFormError("Digite a idade da criança."); return; }
    addDoc(collection(db, "kids"), {
      parentUid: me.uid,
      name: childForm.name.trim(),
      age: childForm.age.trim(),
      diet: childForm.diet.trim(),
      childPhoto: childForm.childPhoto,
      parentsPhoto: childForm.parentsPhoto,
      attendance: [],
      createdAt: serverTimestamp(),
    }).catch(err => console.error("KID_ADD_ERR", err.code, err.message));
    setChildForm({ name: "", age: "", diet: "", childPhoto: null, parentsPhoto: null });
    setShowAddChild(false);
  };

  const markAttendance = (childId) => {
    const label = todayLabel();
    const child = children.find(c => c.id === childId);
    if (!child || child.attendance.includes(label)) return;
    updateDoc(doc(db, "kids", childId), { attendance: arrayUnion(label) })
      .catch(err => console.error("KID_ATTEND_ERR", err.code, err.message));
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
          <HangmanGame item={openHangman} color={group.color} />
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
          <VerseFillGame item={openVerseFill} color={group.color} />
        </div>
      </div>
    );
  }

  if (openChild) {
    const presentToday = openChild.attendance.includes(todayLabel());
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenChildId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Frequência</button>
        </div>

        <div className="flex flex-col items-center px-6 mt-3 mb-5">
          {openChild.childPhoto ? (
            <img src={openChild.childPhoto} alt={openChild.name} className="w-24 h-24 rounded-full object-cover mb-3" style={{ border: "4px solid #FFFFFF", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }} />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3" style={{ background: colorFor(openChild.name), border: "4px solid #FFFFFF", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}>
              <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[24px]">{initials(openChild.name)}</span>
            </div>
          )}
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[19px]">{openChild.name}</h1>
          <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12.5px] mt-1">{openChild.age} anos</p>
        </div>

        <div className="px-6 mb-5">
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(180,140,80,0.1)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#7C6CE81E" }}>
                <Users size={15} color="#7C6CE8" />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[10.5px]">Pais/responsável</p>
                {openChild.parentsPhoto ? (
                  <img src={openChild.parentsPhoto} alt="Responsável" className="w-10 h-10 rounded-full object-cover mt-1" />
                ) : (
                  <p style={{ fontFamily: "Inter", color: "#3A2E22" }} className="text-[13px] font-semibold">Foto não enviada</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3" style={{ borderTop: "1px solid #F5EBDA", paddingTop: 12 }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FF7A591E" }}>
                <Heart size={15} color="#FF7A59" />
              </div>
              <div>
                <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[10.5px]">Restrição alimentar</p>
                <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[13px]">{openChild.diet || "Nenhuma informada"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-8">
          <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12px] mb-3">Frequência</p>
          <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(180,140,80,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontFamily: "Fraunces", color: "#3A2E22", fontWeight: 600 }} className="text-[15px]">
                {openChild.attendance.length} {openChild.attendance.length === 1 ? "presença registrada" : "presenças registradas"}
              </p>
              <button onClick={() => markAttendance(openChild.id)} disabled={presentToday}
                className="px-4 py-2 rounded-full text-[12px] font-semibold"
                style={{ fontFamily: "Inter", background: presentToday ? "#F0E8D8" : "#2FA8A0", color: presentToday ? "#B0A18A" : "#FFFFFF" }}>
                {presentToday ? "Presente hoje ✓" : "Marcar presença hoje"}
              </button>
            </div>
            {openChild.attendance.length === 0 ? (
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Nenhuma presença registrada ainda.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {openChild.attendance.map((d, i) => (
                  <span key={i} className="text-[11px] px-3 py-1.5 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#FFF8EE", color: "#8A7F6E" }}>
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
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

      {activeTab === "frequencia" && (
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px]">Meus filhos cadastrados</p>
            <button onClick={() => setShowAddChild(true)} className="text-[12px] flex items-center gap-1" style={{ fontFamily: "Inter", color: group.color, fontWeight: 700 }}>
              + Cadastrar
            </button>
          </div>
          {children.length === 0 ? (
            <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Nenhuma criança cadastrada ainda</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {children.map(c => (
                <button key={c.id} onClick={() => setOpenChildId(c.id)}
                  className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                  style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
                  {c.childPhoto ? (
                    <img src={c.childPhoto} alt={c.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                      <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[12px]">{initials(c.name)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[13px]">{c.name}</p>
                    <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[11px]">
                      {c.age} anos · {c.attendance.length} {c.attendance.length === 1 ? "presença" : "presenças"}
                    </p>
                  </div>
                  {c.diet && (
                    <span className="text-[9.5px] px-2 py-1 rounded-full shrink-0" style={{ fontFamily: "Inter", background: "#FF7A591E", color: "#FF7A59" }}>
                      restrição
                    </span>
                  )}
                  <ChevronRight size={16} color="#D8CBB4" />
                </button>
              ))}
            </div>
          )}
          <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[10.5px] mt-2">
            O cadastro é feito só uma vez por criança. Toque em um nome para ver detalhes e frequência.
          </p>
        </div>
      )}

      {showAddChild && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowAddChild(false)}>
          <div className="w-full rounded-t-3xl p-6 max-h-[85%] overflow-y-auto" style={{ background: "#FFF8EE" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[17px] mb-1">Cadastrar criança</p>
            <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[11.5px] mb-4">Esse cadastro é feito só uma vez para cada criança.</p>

            <div className="flex gap-3 mb-4">
              <label className="flex-1 flex flex-col items-center gap-2 cursor-pointer">
                <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "#F0E8D8", border: "1px dashed #D8CBB4" }}>
                  {childForm.childPhoto ? <img src={childForm.childPhoto} alt="Prévia" className="w-full h-full object-cover" /> : <Baby size={20} color="#B0A18A" />}
                </div>
                <span style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[11px] text-center">Foto da criança</span>
                <input type="file" accept="image/*" onChange={handleChildPhoto} className="hidden" />
              </label>
              <label className="flex-1 flex flex-col items-center gap-2 cursor-pointer">
                <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "#F0E8D8", border: "1px dashed #D8CBB4" }}>
                  {childForm.parentsPhoto ? <img src={childForm.parentsPhoto} alt="Prévia" className="w-full h-full object-cover" /> : <Users size={20} color="#B0A18A" />}
                </div>
                <span style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[11px] text-center">Foto dos pais/responsável</span>
                <input type="file" accept="image/*" onChange={handleParentsPhoto} className="hidden" />
              </label>
            </div>

            <input value={childForm.name} onChange={e => setChildForm({ ...childForm, name: e.target.value })} placeholder="Nome da criança"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #E8DCC4", color: "#3A2E22" }} />

            <input value={childForm.age} onChange={e => setChildForm({ ...childForm, age: e.target.value.replace(/[^0-9]/g, "") })} placeholder="Idade"
              inputMode="numeric"
              className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #E8DCC4", color: "#3A2E22" }} />

            <label style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[11px] block mb-1.5">Restrição alimentar <span style={{ color: "#B0A18A" }}>(opcional)</span></label>
            <input value={childForm.diet} onChange={e => setChildForm({ ...childForm, diet: e.target.value })} placeholder="Ex: alergia a amendoim, intolerância à lactose..."
              className="w-full px-4 py-3 rounded-xl mb-2 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #E8DCC4", color: "#3A2E22" }} />
            <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[10.5px] mb-4">Deixe em branco se não houver nenhuma restrição.</p>

            {childFormError && (
              <p style={{ fontFamily: "Inter", color: "#C24C33" }} className="text-[12px] mb-4 text-center">{childFormError}</p>
            )}

            <button onClick={handleAddChild}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: group.color, color: "#FFFFFF", fontFamily: "Inter" }}>
              Cadastrar criança
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InfantilScreen;
