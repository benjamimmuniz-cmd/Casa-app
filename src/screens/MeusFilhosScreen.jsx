import React, { useContext, useEffect, useState } from "react";
import { Baby, ChevronRight, Heart, Printer, ShieldCheck, Users, X } from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { UserContext } from "../context/contexts.js";
import { colorFor, initials } from "../utils/helpers.js";
import { AGE_GROUPS } from "../data/constants.js";
import { groupIdForAge } from "../data/kidsBadges.js";
import { compressImage } from "../utils/imageCompress.js";
import CheckinLabelCard from "../components/CheckinLabelCard.jsx";

const generateCheckinCode = () => String(Math.floor(1000 + Math.random() * 9000));

// Tela própria "Meus Filhos" — cadastro, detalhes e check-in de segurança dos
// seus filhos, fora da Área Infantil pra ficar de acesso mais rápido, como
// pedido. A mesma lista/cadastro que já existe dentro de Área Infantil.
function MeusFilhosScreen({ onBack }) {
  const me = useContext(UserContext);
  const [children, setChildren] = useState([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [openChildId, setOpenChildId] = useState(null);
  const [childForm, setChildForm] = useState({ name: "", age: "", diet: "", neurodivergente: false, childPhoto: null, parentsPhoto: null });
  const [childFormError, setChildFormError] = useState("");
  const [savingChild, setSavingChild] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState(false);

  useEffect(() => {
    if (!me.uid) { setChildren([]); return; }
    const q = query(collection(db, "kids"), where("parentUid", "==", me.uid));
    const unsub = onSnapshot(q, snap => {
      setChildren(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [me.uid]);

  useEffect(() => { setShowPrintLabel(false); }, [openChildId]);

  const openChild = children.find(c => c.id === openChildId);

  const handleChildPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => compressImage(reader.result, 700, 0.7).then(img => setChildForm(f => ({ ...f, childPhoto: img })));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleParentsPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => compressImage(reader.result, 700, 0.7).then(img => setChildForm(f => ({ ...f, parentsPhoto: img })));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddChild = async () => {
    setChildFormError("");
    if (!childForm.name.trim()) { setChildFormError("Digite o nome da criança."); return; }
    if (!childForm.age.trim()) { setChildFormError("Digite a idade da criança."); return; }
    if (savingChild) return;
    setSavingChild(true);
    try {
      await addDoc(collection(db, "kids"), {
        parentUid: me.uid,
        name: childForm.name.trim(),
        age: childForm.age.trim(),
        diet: childForm.diet.trim(),
        neurodivergente: childForm.neurodivergente,
        childPhoto: childForm.childPhoto,
        parentsPhoto: childForm.parentsPhoto,
        attendance: [],
        createdAt: serverTimestamp(),
      });
      setChildForm({ name: "", age: "", diet: "", neurodivergente: false, childPhoto: null, parentsPhoto: null });
      setShowAddChild(false);
    } catch (err) {
      console.error("KID_ADD_ERR", err.code, err.message);
      setChildFormError("Não deu pra cadastrar agora. Tenta de novo.");
    }
    setSavingChild(false);
  };

  const doCheckin = (childId) => {
    const code = generateCheckinCode();
    updateDoc(doc(db, "kids", childId), { checkinActive: true, checkinCode: code, checkinAt: serverTimestamp() })
      .catch(err => console.error("KID_CHECKIN_ERR", err.code, err.message));
  };

  const cancelCheckin = (childId) => {
    updateDoc(doc(db, "kids", childId), { checkinActive: false, checkinCode: null })
      .catch(err => console.error("KID_CHECKIN_CANCEL_ERR", err.code, err.message));
  };

  if (openChild) {
    return (
      <>
      <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
        <div className="px-6 pt-6 pb-2">
          <button onClick={() => setOpenChildId(null)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Meus Filhos</button>
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
            {openChild.neurodivergente && (
              <div className="flex items-center gap-3" style={{ borderTop: "1px solid #F5EBDA", paddingTop: 12 }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#5A4BC71E" }}>
                  <span style={{ fontSize: 15 }}>♾️</span>
                </div>
                <p style={{ fontFamily: "Inter", color: "#5A4BC7", fontWeight: 600 }} className="text-[13px]">Criança neurodivergente</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-8">
          <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12px] mb-3">Check-in de segurança</p>
          {openChild.checkinActive ? (
            <div className="rounded-2xl p-4" style={{ background: "#2FA8A0", boxShadow: "0 2px 8px rgba(180,140,80,0.1)" }}>
              <p style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.85)" }} className="text-[11.5px] mb-2">Mostre esse código pra quem for buscar a criança</p>
              <p style={{ fontFamily: "IBM Plex Mono", color: "#FFFFFF", fontWeight: 700, letterSpacing: 4 }} className="text-[32px] text-center mb-3">{openChild.checkinCode}</p>
              <div className="flex gap-2">
                <button onClick={() => setShowPrintLabel(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#2FA8A0" }}>
                  <Printer size={13} /> Imprimir etiqueta
                </button>
                <button onClick={() => cancelCheckin(openChild.id)}
                  className="flex-1 py-2.5 rounded-full text-[12px] font-semibold" style={{ fontFamily: "Inter", background: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}>
                  Cancelar check-in
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => doCheckin(openChild.id)}
              className="w-full flex items-center gap-3 rounded-2xl p-4 text-left" style={{ background: "#FFFFFF", boxShadow: "0 2px 8px rgba(180,140,80,0.1)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#2FA8A01E" }}>
                <ShieldCheck size={17} color="#2FA8A0" />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[13px]">Fazer check-in</p>
                <p style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[11px]">Gera um código pra confirmar quem vai buscar a criança depois</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {showPrintLabel && (() => {
        const [firstName, ...restName] = (openChild.name || "").trim().split(/\s+/);
        const lastName = restName.join(" ");
        const [respFirst, ...respRest] = (me.name || "").trim().split(/\s+/);
        const respLast = respRest.join(" ");
        const childGroup = AGE_GROUPS.find(g => g.id === groupIdForAge(openChild.age));
        const qrValue = `CASA-CHECKIN:${openChild.id}:${openChild.checkinCode}`;
        return (
          <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "#FFF8EE" }}>
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #casa-print-label, #casa-print-label * { visibility: visible; }
                #casa-print-label { position: fixed; top: 0; left: 0; }
                #casa-print-label > *:first-child { break-after: page; page-break-after: always; }
                .casa-no-print { display: none !important; }
                @page { size: 80mm 30mm; margin: 0; }
              }
            `}</style>
            <div className="casa-no-print px-6 pt-6 pb-3 flex items-center justify-between shrink-0">
              <button onClick={() => setShowPrintLabel(false)} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Voltar</button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-full" style={{ background: "#2FA8A0" }}>
                <Printer size={13} color="#FFFFFF" />
                <span style={{ fontFamily: "Inter", color: "#FFFFFF", fontWeight: 600 }} className="text-[12.5px]">Imprimir as 2 etiquetas</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-4 p-6">
              <div id="casa-print-label" className="flex flex-col items-center gap-4">
                <CheckinLabelCard
                  kicker="Criança" nameLeft={firstName} nameRight={lastName} code={openChild.checkinCode} qrValue={qrValue}
                  groupEmoji={childGroup?.emoji} diet={openChild.diet} neuro={openChild.neurodivergente}
                  footerLeft={`Turma ${childGroup?.label || ""}`} />
                <CheckinLabelCard
                  kicker="Responsável" nameLeft={respFirst} nameRight={respLast} code={openChild.checkinCode} qrValue={qrValue}
                  groupEmoji={childGroup?.emoji} diet={openChild.diet} neuro={openChild.neurodivergente}
                  footerLeft={`Buscar: ${openChild.name}`} />
              </div>
            </div>
          </div>
        );
      })()}
      </>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#FFF8EE" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#8A7F6E" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5">
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#3A2E22" }} className="text-[22px]">Meus Filhos</h1>
        <p style={{ fontFamily: "Inter", color: "#9A8B76" }} className="text-[12px] mt-1">Cadastro, detalhes e check-in de segurança</p>
      </div>

      <div className="px-6 pb-10">
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontFamily: "Inter", color: "#6B6255", fontWeight: 600 }} className="text-[12px]">Meus filhos cadastrados</p>
          <button onClick={() => setShowAddChild(true)} className="text-[12px] flex items-center gap-1" style={{ fontFamily: "Inter", color: "#4B7D5C", fontWeight: 700 }}>
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
                {c.checkinActive && (
                  <span className="flex items-center gap-1 text-[9.5px] px-2 py-1 rounded-full shrink-0" style={{ fontFamily: "Inter", background: "#2FA8A01E", color: "#2FA8A0" }}>
                    <ShieldCheck size={10} /> check-in
                  </span>
                )}
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
          O cadastro é feito só uma vez por criança. Toque em um nome para ver detalhes e fazer o check-in.
        </p>
      </div>

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

            <label className="flex items-center gap-3 mb-4 cursor-pointer rounded-2xl p-3.5" style={{ background: "#FFFFFF", border: "1px solid #E8DCC4" }}>
              <input type="checkbox" checked={childForm.neurodivergente} onChange={e => setChildForm({ ...childForm, neurodivergente: e.target.checked })}
                className="w-4 h-4 rounded shrink-0" style={{ accentColor: "#5A4BC7" }} />
              <span>
                <span style={{ fontFamily: "Inter", color: "#3A2E22", fontWeight: 600 }} className="text-[12.5px] block">Criança neurodivergente</span>
                <span style={{ fontFamily: "Inter", color: "#B0A18A" }} className="text-[10.5px] block mt-0.5">Ex: TEA, TDAH — ajuda a equipe a acolher melhor</span>
              </span>
            </label>

            {childFormError && (
              <p style={{ fontFamily: "Inter", color: "#C24C33" }} className="text-[12px] mb-4 text-center">{childFormError}</p>
            )}

            <button onClick={handleAddChild} disabled={savingChild}
              className="w-full py-3.5 rounded-full font-semibold text-[14px] active:scale-[0.98] transition-transform"
              style={{ background: "#4B7D5C", color: "#FFFFFF", fontFamily: "Inter", opacity: savingChild ? 0.7 : 1 }}>
              {savingChild ? "Cadastrando..." : "Cadastrar criança"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeusFilhosScreen;
