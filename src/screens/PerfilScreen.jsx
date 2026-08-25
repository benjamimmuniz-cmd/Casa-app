import React, { useContext, useEffect, useState } from "react";
import {
  Baby,
  Bell,
  BellOff,
  CalendarDays,
  Camera,
  Car,
  Check,
  MessageCircle,
  Moon,
  Pencil,
  Sun,
  Tag,
  Type as TextIcon,
} from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext, ThemeContext, FeedContext } from "../context/contexts.js";
import { colorFor, fmtDateBR, initials } from "../utils/helpers.js";
import { compressImage } from "../utils/imageCompress.js";

function PerfilScreen({ onBack, onLogout }) {
  const user = useContext(UserContext);
  const { theme, setTheme, textLarge, setTextLarge } = useContext(ThemeContext);
  const { posts } = useContext(FeedContext);
  const myPosts = posts.filter(p => (p.authorUid ? p.authorUid === user.uid : p.author === user.name));
  const inputRef = React.useRef(null);
  const [myChildren, setMyChildren] = useState([]);

  useEffect(() => {
    if (!user.uid) { setMyChildren([]); return; }
    const q = query(collection(db, "kids"), where("parentUid", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      setMyChildren(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [user.uid]);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(user.bio);
  const [editingProfissao, setEditingProfissao] = useState(false);
  const [profissaoDraft, setProfissaoDraft] = useState(user.profissao);
  const [editingPlaca, setEditingPlaca] = useState(false);
  const [placaDraft, setPlacaDraft] = useState(user.placa);

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed) user.setName(trimmed);
    setEditingName(false);
  };

  const saveBio = () => {
    user.setBio(bioDraft.trim());
    setEditingBio(false);
  };

  const saveProfissao = () => {
    user.setProfissao(profissaoDraft.trim());
    setEditingProfissao(false);
  };

  const savePlaca = () => {
    user.setPlaca(placaDraft.trim().toUpperCase());
    setEditingPlaca(false);
  };

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => user.setPhoto(await compressImage(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "var(--c-bg)" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "var(--c-muted)" }}>← Início</button>
      </div>

      <div className="flex flex-col items-center px-6 mt-3 mb-6">
        <button onClick={() => inputRef.current?.click()} className="relative mb-3">
          <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden" style={{ background: colorFor(user.name || "V") }}>
            {user.photo ? (
              <img src={user.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[22px]">{initials(user.name || "V")}</span>
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--c-accent)", border: "2px solid var(--c-bg)" }}>
            <Camera size={12} color="#FFFFFF" />
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
        </button>
        {editingName ? (
          <div className="flex items-center gap-2">
            <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveName()}
              className="text-center outline-none px-3 py-1.5 rounded-full text-[16px]"
              style={{ fontFamily: "Fraunces", fontWeight: 600, background: "var(--c-surface)", color: "var(--c-text)", border: "1px solid var(--c-border)" }} />
            <button onClick={saveName} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-accent)" }}>
              <Check size={14} color="#FFFFFF" />
            </button>
          </div>
        ) : (
          <button onClick={() => { setNameDraft(user.name); setEditingName(true); }} className="flex items-center gap-1.5">
            <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "var(--c-text)" }} className="text-[19px]">{user.name}</h1>
            <Pencil size={13} color="var(--c-faint)" />
          </button>
        )}
        {user.profissao && (
          <span className="mt-2 text-[11px] px-3 py-1 rounded-full" style={{ fontFamily: "IBM Plex Mono", background: "#5A5A5A1E", color: "#5C6B45" }}>
            {user.profissao}
          </span>
        )}
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] uppercase tracking-wide font-semibold">Bio</p>
          {!editingBio && (
            <button onClick={() => { setBioDraft(user.bio); setEditingBio(true); }} className="flex items-center gap-1">
              <Pencil size={11} color="var(--c-faint)" />
            </button>
          )}
        </div>
        {editingBio ? (
          <div className="rounded-2xl p-3.5" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
            <textarea autoFocus value={bioDraft} onChange={e => setBioDraft(e.target.value)} placeholder="Conte um pouco sobre você..." rows={3} maxLength={200}
              className="w-full outline-none text-[13px] resize-none bg-transparent mb-2"
              style={{ fontFamily: "Inter", color: "var(--c-text)" }} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingBio(false)} className="px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold" style={{ fontFamily: "Inter", background: "var(--c-surface-2)", color: "var(--c-muted)" }}>Cancelar</button>
              <button onClick={saveBio} className="px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold" style={{ fontFamily: "Inter", background: "var(--c-accent)", color: "#FFFFFF" }}>Salvar</button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-3.5" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
            <p style={{ fontFamily: "Inter", color: user.bio ? "var(--c-text)" : "var(--c-faint)" }} className="text-[13px] leading-relaxed">
              {user.bio || "Nenhuma bio ainda — toque no lápis pra adicionar."}
            </p>
          </div>
        )}
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] uppercase tracking-wide font-semibold">Suas publicações</p>
          <span style={{ fontFamily: "IBM Plex Mono", color: "var(--c-faint)" }} className="text-[10px]">{myPosts.length}</span>
        </div>
        {myPosts.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
            <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[12px]">Você ainda não publicou nada no Feed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {myPosts.map(p => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden relative" style={{ background: p.image ? "#00000010" : colorFor(p.text || p.id) + "22" }}>
                {p.image ? (
                  <img src={p.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <p style={{ fontFamily: "Fraunces", color: "var(--c-text)" }} className="text-[10px] leading-snug line-clamp-4 text-center">{p.text || "🎵"}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 mb-6">
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#7070701E" }}>
              <MessageCircle size={15} color="var(--c-muted)" />
            </div>
            <div>
              <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[10.5px]">E-mail (login)</p>
              <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">{user.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3" style={{ borderTop: "1px solid var(--c-divider)", paddingTop: 12 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#2B2B2B1E" }}>
              <CalendarDays size={15} color="var(--c-text-2)" />
            </div>
            <div>
              <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[10.5px]">Data de nascimento</p>
              <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">{fmtDateBR(user.nascimento) || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3" style={{ borderTop: "1px solid var(--c-divider)", paddingTop: 12 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#5A5A5A1E" }}>
              <Tag size={15} color="#5A5A5A" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[10.5px]">Profissão</p>
              {editingProfissao ? (
                <div className="flex items-center gap-2 mt-1">
                  <input autoFocus value={profissaoDraft} onChange={e => setProfissaoDraft(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveProfissao()}
                    placeholder="Ex: Advogada, Eletricista..."
                    className="flex-1 min-w-0 outline-none px-2.5 py-1.5 rounded-lg text-[13px]"
                    style={{ fontFamily: "Inter", background: "var(--c-bg)", color: "var(--c-text)", border: "1px solid var(--c-border)" }} />
                  <button onClick={saveProfissao} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-accent)" }}>
                    <Check size={12} color="#FFFFFF" />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setProfissaoDraft(user.profissao); setEditingProfissao(true); }} className="flex items-center gap-1.5">
                  <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">{user.profissao || "Não informada"}</p>
                  <Pencil size={11} color="var(--c-faint)" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3" style={{ borderTop: "1px solid var(--c-divider)", paddingTop: 12 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#3B6D8A1E" }}>
              <Car size={15} color="#3B6D8A" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[10.5px]">Possui carro?</p>
              <div className="flex gap-2 mt-1">
                <button onClick={() => user.setPossuiCarro(true)}
                  className="px-3 py-1 rounded-full text-[11.5px] font-semibold"
                  style={{ fontFamily: "Inter", background: user.possuiCarro ? "#3B6D8A" : "var(--c-bg)", color: user.possuiCarro ? "#FFFFFF" : "var(--c-muted)", border: "1px solid " + (user.possuiCarro ? "#3B6D8A" : "var(--c-border)") }}>
                  Sim
                </button>
                <button onClick={() => user.setPossuiCarro(false)}
                  className="px-3 py-1 rounded-full text-[11.5px] font-semibold"
                  style={{ fontFamily: "Inter", background: !user.possuiCarro ? "#3B6D8A" : "var(--c-bg)", color: !user.possuiCarro ? "#FFFFFF" : "var(--c-muted)", border: "1px solid " + (!user.possuiCarro ? "#3B6D8A" : "var(--c-border)") }}>
                  Não
                </button>
              </div>
            </div>
          </div>
          {user.possuiCarro && (
            <div className="flex items-center gap-3" style={{ borderTop: "1px solid var(--c-divider)", paddingTop: 12 }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#3B6D8A1E" }}>
                <Tag size={15} color="#3B6D8A" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[10.5px]">Placa</p>
                {editingPlaca ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input autoFocus value={placaDraft} onChange={e => setPlacaDraft(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === "Enter" && savePlaca()}
                      placeholder="Ex: ABC1D23"
                      maxLength={8}
                      className="flex-1 min-w-0 outline-none px-2.5 py-1.5 rounded-lg text-[13px] uppercase"
                      style={{ fontFamily: "IBM Plex Mono", background: "var(--c-bg)", color: "var(--c-text)", border: "1px solid var(--c-border)" }} />
                    <button onClick={savePlaca} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--c-accent)" }}>
                      <Check size={12} color="#FFFFFF" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setPlacaDraft(user.placa); setEditingPlaca(true); }} className="flex items-center gap-1.5">
                    <p style={{ fontFamily: "IBM Plex Mono", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">{user.placa || "Não informada"}</p>
                    <Pencil size={11} color="var(--c-faint)" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3" style={{ borderTop: "1px solid var(--c-divider)", paddingTop: 12 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#4B7D5C1E" }}>
              <Baby size={15} color="#4B7D5C" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "Inter", color: "var(--c-muted)" }} className="text-[10.5px]">Filhos</p>
              {myChildren.length === 0 ? (
                <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">Nenhum cadastrado</p>
              ) : (
                <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">
                  {myChildren.map(c => c.name).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
        <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10.5px] mt-3 leading-relaxed px-1">
          ⓘ Sua profissão fica visível pra outros membros da igreja, caso alguém precise de um serviço que você oferece. A placa fica guardada no seu cadastro pra ajudar a identificar o dono do carro, caso seja preciso no estacionamento. Gerencie seus filhos em Área Infantil → Meus Filhos.
        </p>
      </div>

      <div className="px-6 mb-6">
        <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] uppercase tracking-wide font-semibold mb-2 px-1">Aparência</p>
        <div className="flex gap-2">
          <button onClick={() => setTheme("light")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold"
            style={{
              fontFamily: "Inter",
              background: theme === "light" ? "var(--c-accent)" : "var(--c-surface)",
              color: theme === "light" ? "#FFFFFF" : "var(--c-text-2)",
              boxShadow: "0 1px 3px var(--c-shadow)",
            }}>
            <Sun size={15} /> Claro
          </button>
          <button onClick={() => setTheme("dark")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold"
            style={{
              fontFamily: "Inter",
              background: theme === "dark" ? "var(--c-accent)" : "var(--c-surface)",
              color: theme === "dark" ? "#FFFFFF" : "var(--c-text-2)",
              boxShadow: "0 1px 3px var(--c-shadow)",
            }}>
            <Moon size={15} /> Escuro
          </button>
        </div>
      </div>

      <div className="px-6 mb-6">
        <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] uppercase tracking-wide font-semibold mb-2 px-1">Acessibilidade</p>
        <button onClick={() => setTextLarge(!textLarge)}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl"
          style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: textLarge ? "var(--c-accent)" : "var(--c-bg)" }}>
            <TextIcon size={16} color={textLarge ? "#FFFFFF" : "var(--c-faint)"} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">Texto grande</p>
            <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[11px]">Deixa tudo maior e mais fácil de ler</p>
          </div>
          <div className="w-11 h-6 rounded-full flex items-center shrink-0 px-0.5 transition-colors"
            style={{ background: textLarge ? "var(--c-accent)" : "var(--c-border)" }}>
            <div className="w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: textLarge ? "translateX(20px)" : "translateX(0)" }} />
          </div>
        </button>
      </div>

      <div className="px-6 mb-6">
        <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[10px] uppercase tracking-wide font-semibold mb-2 px-1">Notificações</p>
        <button onClick={() => user.setNotificacoesAtivas(!user.notificacoesAtivas)}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl"
          style={{ background: "var(--c-surface)", boxShadow: "0 1px 3px var(--c-shadow)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: user.notificacoesAtivas ? "var(--c-accent)" : "var(--c-bg)" }}>
            {user.notificacoesAtivas
              ? <Bell size={16} color="#FFFFFF" />
              : <BellOff size={16} color="var(--c-faint)" />}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p style={{ fontFamily: "Inter", color: "var(--c-text)", fontWeight: 600 }} className="text-[13px]">Receber notificações</p>
            <p style={{ fontFamily: "Inter", color: "var(--c-faint)" }} className="text-[11px]">Mensagens, chat e novidades da igreja</p>
          </div>
          <div className="w-11 h-6 rounded-full flex items-center shrink-0 px-0.5 transition-colors"
            style={{ background: user.notificacoesAtivas ? "var(--c-accent)" : "var(--c-border)" }}>
            <div className="w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: user.notificacoesAtivas ? "translateX(20px)" : "translateX(0)" }} />
          </div>
        </button>
      </div>

      <div className="px-6 pb-8">
        <button onClick={onLogout}
          className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
          style={{ background: "var(--c-surface)", color: "var(--c-muted)", fontFamily: "Inter", border: "1px solid var(--c-border)" }}>
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export default PerfilScreen;
