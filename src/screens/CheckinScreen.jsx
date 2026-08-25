import React, { useContext, useEffect, useState } from "react";
import { Baby, ChevronRight, ClipboardList, ShieldCheck, UserCheck, X } from "lucide-react";
import { collection, addDoc, doc, getDocs, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials, isStaffRole, todayLabel } from "../utils/helpers.js";
import { compressImage } from "../utils/imageCompress.js";
import MemberPickerSheet from "../components/MemberPickerSheet.jsx";

const EMPTY_CHILD = { name: "", age: "", diet: "", childPhoto: null };
const TABS = [
  { id: "checkin", label: "Check-in", icon: ShieldCheck },
  { id: "cadastrar", label: "Cadastrar", icon: Baby },
  { id: "frequencia", label: "Frequência", icon: ClipboardList },
];

// Hub da equipe de Kids: check-in/check-out de segurança, cadastro de criança
// nova (escolhendo o responsável entre os membros) e marcar presença — tudo
// num lugar só, já que quem tá na recepção ministrando as crianças precisa
// dessas três coisas juntas.
function CheckinScreen({ onBack }) {
  const me = useContext(UserContext);
  const isStaff = isStaffRole(me.role);
  const [activeTab, setActiveTab] = useState("checkin");
  const [kidsList, setKidsList] = useState(null);
  const [checkinSearch, setCheckinSearch] = useState("");
  const [freqSearch, setFreqSearch] = useState("");
  const [confirmCheckoutFor, setConfirmCheckoutFor] = useState(null);

  const [childForm, setChildForm] = useState(EMPTY_CHILD);
  const [responsavel, setResponsavel] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [savingChild, setSavingChild] = useState(false);
  const [childError, setChildError] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const loadKids = () => {
    getDocs(collection(db, "kids")).then(snap => {
      setKidsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).catch(err => {
      console.error("KID_LIST_ERR", err.code, err.message);
      setKidsList([]);
    });
  };

  useEffect(() => {
    if (isStaff) loadKids();
  }, [isStaff]);

  const confirmCheckout = (childId) => {
    updateDoc(doc(db, "kids", childId), { checkinActive: false, checkinCode: null })
      .then(() => {
        setKidsList(prev => prev ? prev.map(c => c.id === childId ? { ...c, checkinActive: false, checkinCode: null } : c) : prev);
      })
      .catch(err => console.error("KID_CHECKOUT_ERR", err.code, err.message));
    setConfirmCheckoutFor(null);
  };

  const handleChildPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => compressImage(reader.result, 700, 0.7).then(img => setChildForm(f => ({ ...f, childPhoto: img })));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddChild = async () => {
    setChildError("");
    setJustAdded(false);
    if (!childForm.name.trim()) { setChildError("Digite o nome da criança."); return; }
    if (!childForm.age.trim()) { setChildError("Digite a idade da criança."); return; }
    if (!responsavel) { setChildError("Escolha o responsável pela criança."); return; }
    setSavingChild(true);
    try {
      await addDoc(collection(db, "kids"), {
        parentUid: responsavel.uid,
        name: childForm.name.trim(),
        age: childForm.age.trim(),
        diet: childForm.diet.trim(),
        childPhoto: childForm.childPhoto,
        parentsPhoto: responsavel.photo || null,
        attendance: [],
        createdAt: serverTimestamp(),
      });
      setChildForm(EMPTY_CHILD);
      setResponsavel(null);
      setJustAdded(true);
      loadKids();
    } catch (err) {
      console.error("KID_ADD_ERR", err.code, err.message);
      setChildError("Não deu pra cadastrar agora. Tenta de novo.");
    }
    setSavingChild(false);
  };

  const markAttendance = (childId) => {
    const label = todayLabel();
    const child = (kidsList || []).find(c => c.id === childId);
    if (!child || (child.attendance || []).includes(label)) return;
    updateDoc(doc(db, "kids", childId), { attendance: arrayUnion(label) })
      .then(() => setKidsList(prev => prev.map(c => c.id === childId ? { ...c, attendance: [...(c.attendance || []), label] } : c)))
      .catch(err => console.error("KID_ATTEND_ERR", err.code, err.message));
  };

  if (!isStaff) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Início</button>
        </div>
        <div className="px-6 mt-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#2FA8A01E" }}>
            <ShieldCheck size={24} color="#2FA8A0" />
          </div>
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[16px] mb-1.5">Acesso restrito</p>
          <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12.5px] leading-relaxed">Essa área é só pra quem tem cargo Junta ou Liderança. Peça pra alguém da liderança liberar seu cargo no Painel de cadastros.</p>
        </div>
      </div>
    );
  }

  const cq = checkinSearch.trim().toLowerCase();
  const filteredCheckin = (kidsList || []).filter(c => !cq || (c.name || "").toLowerCase().includes(cq));
  const aguardando = filteredCheckin.filter(c => c.checkinActive).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  const semCheckin = filteredCheckin.filter(c => !c.checkinActive).sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const fq = freqSearch.trim().toLowerCase();
  const filteredFreq = (kidsList || [])
    .filter(c => !fq || (c.name || "").toLowerCase().includes(fq))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  const todayL = todayLabel();

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-4">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[22px]">Check-in</h1>
        <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12px] mt-1">Ferramentas da equipe de Kids</p>
      </div>

      <div className="flex gap-2 px-6 mb-5">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex-1 py-2.5 rounded-2xl text-[11.5px] font-semibold flex items-center justify-center gap-1.5"
              style={{ fontFamily: "Inter", background: active ? "#3A2E22" : "#FFFFFF", color: active ? "#FFFFFF" : "#6B6255", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
              <Icon size={13} />{t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "checkin" && (
        <>
          <div className="px-6 mb-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
              <ShieldCheck size={15} color="#9A8B76" />
              <input value={checkinSearch} onChange={e => setCheckinSearch(e.target.value)} placeholder="Buscar criança por nome"
                className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#3A2E22" }} />
              <button onClick={loadKids} style={{ fontFamily: "Inter", color: "#2FA8A0" }} className="text-[11px] font-semibold shrink-0">Atualizar</button>
            </div>
          </div>

          <div className="px-6 pb-10">
            {kidsList === null ? (
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px] text-center py-8">Carregando...</p>
            ) : (
              <>
                <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px] mb-3">Aguardando busca ({aguardando.length})</p>
                {aguardando.length === 0 ? (
                  <div className="rounded-2xl p-4 text-center mb-6" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
                    <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Ninguém com check-in ativo agora.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 mb-6">
                    {aguardando.map(c => (
                      <button key={c.id} onClick={() => setConfirmCheckoutFor(c)}
                        className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                        style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)", border: "1.5px solid #2FA8A055" }}>
                        {c.childPhoto ? (
                          <img src={c.childPhoto} alt={c.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                            <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[12px]">{initials(c.name)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[13px]">{c.name}</p>
                          <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[11px]">{c.age} anos</p>
                        </div>
                        <span style={{ fontFamily: "IBM Plex Mono", color: "#2FA8A0", fontWeight: 700, letterSpacing: 2 }} className="text-[16px]">{c.checkinCode}</span>
                      </button>
                    ))}
                  </div>
                )}

                <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px] mb-3">Sem check-in ({semCheckin.length})</p>
                {semCheckin.length === 0 ? (
                  <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Nenhuma criança.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {semCheckin.map(c => (
                      <div key={c.id} className="flex items-center gap-3 rounded-2xl p-2.5" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
                        {c.childPhoto ? (
                          <img src={c.childPhoto} alt={c.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                            <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[10px]">{initials(c.name)}</span>
                          </div>
                        )}
                        <p style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[12.5px]">{c.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {activeTab === "cadastrar" && (
        <div className="px-6 pb-10">
          <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12px] mb-4">Cadastre uma criança nova e escolha quem é o responsável entre os membros com conta.</p>

          {justAdded && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-2xl" style={{ background: "#2FA8A01E" }}>
              <UserCheck size={14} color="#2FA8A0" />
              <span style={{ fontFamily: "Inter", color: "#2FA8A0", fontWeight: 600 }} className="text-[12px]">Criança cadastrada!</span>
            </div>
          )}

          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: "#F0E8D8", border: "1px dashed #D8CBB4" }}>
              {childForm.childPhoto ? <img src={childForm.childPhoto} alt="Prévia" className="w-full h-full object-cover" /> : <Baby size={20} color="#B0A18A" />}
            </div>
            <div>
              <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[12.5px]">{childForm.childPhoto ? "Trocar foto" : "Foto da criança"}</p>
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[11px]">Opcional</p>
            </div>
            <input type="file" accept="image/*" onChange={handleChildPhoto} className="hidden" />
          </label>

          <input value={childForm.name} onChange={e => setChildForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome da criança"
            className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #E8DCC4", color: "#3A2E22" }} />
          <input value={childForm.age} onChange={e => setChildForm(f => ({ ...f, age: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="Idade" inputMode="numeric"
            className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #E8DCC4", color: "#3A2E22" }} />
          <input value={childForm.diet} onChange={e => setChildForm(f => ({ ...f, diet: e.target.value }))} placeholder="Restrição alimentar (opcional)"
            className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #E8DCC4", color: "#3A2E22" }} />

          <p style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[11px] block mb-1.5">Responsável</p>
          {responsavel ? (
            <button onClick={() => setShowPicker(true)} className="w-full flex items-center gap-3 p-3 rounded-xl mb-4 text-left"
              style={{ background: "#FFFFFF", border: "1px solid #E8DCC4" }}>
              {responsavel.photo ? (
                <img src={responsavel.photo} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(responsavel.nome) }}>
                  <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[10px]">{initials(responsavel.nome)}</span>
                </div>
              )}
              <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[13px] flex-1">{responsavel.nome}</p>
              <button onClick={(e) => { e.stopPropagation(); setResponsavel(null); }}><X size={14} color="#B0A18A" /></button>
            </button>
          ) : (
            <button onClick={() => setShowPicker(true)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl mb-4 text-left" style={{ background: "#FFFFFF", border: "1px dashed #D8CBB4" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#2FA8A01E" }}>
                <UserCheck size={16} color="#2FA8A0" />
              </div>
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[13px]">Escolher entre os membros</p>
            </button>
          )}

          {childError && <p style={{ fontFamily: "Inter", color: "#C24C33" }} className="text-[12px] mb-4 text-center">{childError}</p>}

          <button onClick={handleAddChild} disabled={savingChild}
            className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
            style={{ background: "#3A2E22", color: "#FFFFFF", fontFamily: "Inter", opacity: savingChild ? 0.7 : 1 }}>
            {savingChild ? "Cadastrando..." : "Cadastrar criança"}
          </button>
        </div>
      )}

      {activeTab === "frequencia" && (
        <div className="px-6 pb-10">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-4" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.1)" }}>
            <ClipboardList size={15} color="#9A8B76" />
            <input value={freqSearch} onChange={e => setFreqSearch(e.target.value)} placeholder="Buscar criança por nome"
              className="flex-1 outline-none text-[13px] bg-transparent" style={{ fontFamily: "Inter", color: "#3A2E22" }} />
          </div>

          {kidsList === null ? (
            <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px] text-center py-8">Carregando...</p>
          ) : filteredFreq.length === 0 ? (
            <div className="rounded-2xl p-4 text-center" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
              <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[12px]">Nenhuma criança encontrada.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredFreq.map(c => {
                const presentToday = (c.attendance || []).includes(todayL);
                return (
                  <div key={c.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(180,140,80,0.08)" }}>
                    {c.childPhoto ? (
                      <img src={c.childPhoto} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: colorFor(c.name) }}>
                        <span style={{ fontFamily: "Fraunces", color: "#F2F2F2", fontWeight: 600 }} className="text-[11px]">{initials(c.name)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[13px]">{c.name}</p>
                      <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[11px]">{(c.attendance || []).length} {(c.attendance || []).length === 1 ? "presença" : "presenças"}</p>
                    </div>
                    <button onClick={() => markAttendance(c.id)} disabled={presentToday}
                      className="px-3 py-2 rounded-full text-[11px] font-semibold shrink-0"
                      style={{ fontFamily: "Inter", background: presentToday ? "#F0E8D8" : "#2FA8A0", color: presentToday ? "#B0A18A" : "#FFFFFF" }}>
                      {presentToday ? "Presente ✓" : "Marcar presença"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {confirmCheckoutFor && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setConfirmCheckoutFor(null)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: "#FFF8EE" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[17px] mb-1">Confirmar saída de {confirmCheckoutFor.name}</p>
            <p style={{ fontFamily: "Inter", color: "#6B6255" }} className="text-[12.5px] mb-4">Confira se a pessoa que veio buscar sabe o código abaixo antes de confirmar.</p>
            <p style={{ fontFamily: "IBM Plex Mono", color: "#2FA8A0", fontWeight: 700, letterSpacing: 4 }} className="text-[36px] text-center mb-5">{confirmCheckoutFor.checkinCode}</p>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmCheckoutFor(null)} className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#6B6255" }}>Cancelar</button>
              <button onClick={() => confirmCheckout(confirmCheckoutFor.id)} className="flex-1 py-3.5 rounded-full font-semibold text-[13.5px]" style={{ fontFamily: "Inter", background: "#2FA8A0", color: "#FFFFFF" }}>Confirmar saída</button>
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <MemberPickerSheet title="Escolher responsável" excludeSelf={false} onClose={() => setShowPicker(false)}
          onPick={(u) => { setResponsavel(u); setShowPicker(false); }} />
      )}
    </div>
  );
}

export default CheckinScreen;
