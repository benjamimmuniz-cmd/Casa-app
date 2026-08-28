import React, { useState } from "react";
import { Baby, Check, Eye, EyeOff, Plus } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { compressImage } from "../utils/imageCompress.js";
import { getInviteCode, clearInviteCode } from "../utils/inviteCode.js";
import PhotoPickerField from "../components/PhotoPickerField.jsx";

function PasswordField({ value, onChange, placeholder, className, style }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder}
        className={className} style={{ ...style, paddingRight: 44 }} />
      <button type="button" onClick={() => setVisible(v => !v)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2" tabIndex={-1}>
        {visible ? <EyeOff size={16} color="#9E9E9E" /> : <Eye size={16} color="#9E9E9E" />}
      </button>
    </div>
  );
}

function mapAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use": return "Já existe uma conta com esse e-mail.";
    case "auth/invalid-email": return "Digite um e-mail válido.";
    case "auth/weak-password": return "A senha precisa ter pelo menos 6 caracteres.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "E-mail ou senha incorretos.";
    case "auth/network-request-failed": return "Sem conexão com a internet. Tente novamente.";
    case "auth/too-many-requests": return "Muitas tentativas. Aguarde um pouco e tente de novo.";
    case "auth/missing-email": return "Digite seu e-mail ali em cima primeiro.";
    case "permission-denied": return "Sem permissão para acessar seus dados. Fale com a liderança da igreja.";
    default: return "Algo deu errado. Tente novamente.";
  }
}

const EMPTY_CHILD = { name: "", age: "", diet: "", neurodivergente: false, childPhoto: null };

function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState("cadastro"); // cadastro | login
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: "", nascimento: "", email: "", telefone: "", senha: "", confirmaSenha: "", profissao: "", membro: null, receberMensagens: true, photo: null });
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [step, setStep] = useState("form"); // form | filhos
  const [pendingUser, setPendingUser] = useState(null);
  const [childForm, setChildForm] = useState(EMPTY_CHILD);
  const [childrenAdded, setChildrenAdded] = useState(0);
  const [savingChild, setSavingChild] = useState(false);
  const [childError, setChildError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setChild = (k, v) => setChildForm(f => ({ ...f, [k]: v }));

  const handleChildPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => compressImage(reader.result, 700, 0.7).then(img => setChild("childPhoto", img));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const childFormHasData = childForm.name.trim() || childForm.age.trim();

  const saveChildDoc = () => addDoc(collection(db, "kids"), {
    parentUid: pendingUser.uid,
    name: childForm.name.trim(),
    age: childForm.age.trim(),
    diet: childForm.diet.trim(),
    neurodivergente: childForm.neurodivergente,
    childPhoto: childForm.childPhoto,
    parentsPhoto: pendingUser.photo || null,
    attendance: [],
    createdAt: serverTimestamp(),
  });

  const addAnotherChild = async () => {
    setChildError("");
    if (!childForm.name.trim()) { setChildError("Digite o nome da criança."); return; }
    if (!childForm.age.trim()) { setChildError("Digite a idade da criança."); return; }
    setSavingChild(true);
    try {
      await saveChildDoc();
      setChildrenAdded(n => n + 1);
      setChildForm(EMPTY_CHILD);
    } catch (e) {
      setChildError("Não deu pra salvar agora. Tenta de novo.");
    }
    setSavingChild(false);
  };

  const finishOnboarding = async () => {
    setChildError("");
    if (childFormHasData) {
      if (!childForm.name.trim() || !childForm.age.trim()) {
        setChildError("Preencha nome e idade da criança, ou limpe os campos pra pular.");
        return;
      }
      setSavingChild(true);
      try {
        await saveChildDoc();
      } catch (e) {
        setChildError("Não deu pra salvar agora. Tenta de novo, ou pule por enquanto.");
        setSavingChild(false);
        return;
      }
      setSavingChild(false);
    }
    onSuccess(pendingUser);
  };

  const skipChildren = () => onSuccess(pendingUser);

  const handleCadastro = async () => {
    setError("");
    if (!form.nome.trim() || !form.nascimento || !form.email.trim() || !form.senha) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.membro === null) {
      setError("Informe se você já é membro da igreja.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (form.senha.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (form.senha !== form.confirmaSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.senha);
      const invitedBy = getInviteCode();
      const profile = {
        nome: form.nome.trim(), nascimento: form.nascimento, email: form.email.trim(), telefone: form.telefone.trim(),
        profissao: form.profissao.trim(), membro: form.membro, receberMensagens: form.receberMensagens,
        photo: form.photo || null, role: "member", createdAt: serverTimestamp(),
        invitedBy: invitedBy && invitedBy !== cred.user.uid ? invitedBy : null,
      };
      await setDoc(doc(db, "users", cred.user.uid), profile);
      clearInviteCode();
      setPendingUser({ uid: cred.user.uid, ...profile });
      setStep("filhos");
    } catch (e) {
      setError(mapAuthError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginForm.email.trim(), loginForm.senha);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      onSuccess({ uid: cred.user.uid, email: cred.user.email, ...(snap.exists() ? snap.data() : {}) });
    } catch (e) {
      setError(mapAuthError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setResetSent(false);
    if (!loginForm.email.trim()) { setError(mapAuthError("auth/missing-email")); return; }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, loginForm.email.trim());
      setResetSent(true);
    } catch (e) {
      setError(mapAuthError(e.code));
    } finally {
      setResetLoading(false);
    }
  };

  if (step === "filhos") {
    return (
      <div className="relative w-full h-full overflow-hidden flex flex-col" style={{ background: "#F2F2F2" }}>
        <div className="flex-1 overflow-y-auto px-7 pt-8 pb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#4B7D5C1E" }}>
            <Baby size={24} color="#4B7D5C" />
          </div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px] mb-1">Você tem filhos?</h1>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12.5px] mb-6 leading-relaxed">
            Cadastre agora e já vinculamos ao seu perfil como responsável. Se preferir, você pode fazer isso depois em Área Infantil.
          </p>

          {childrenAdded > 0 && (
            <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-2xl" style={{ background: "#4B7D5C1E" }}>
              <Check size={14} color="#4B7D5C" />
              <span style={{ fontFamily: "Inter", color: "#4B7D5C", fontWeight: 600 }} className="text-[12px]">
                {childrenAdded} {childrenAdded === 1 ? "criança adicionada" : "crianças adicionadas"}
              </span>
            </div>
          )}

          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: "#E8E8E8", border: "1px dashed #D6D6D6" }}>
              {childForm.childPhoto ? <img src={childForm.childPhoto} alt="Prévia" className="w-full h-full object-cover" /> : <Baby size={20} color="#9E9E9E" />}
            </div>
            <div>
              <p style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px]">{childForm.childPhoto ? "Trocar foto" : "Foto da criança"}</p>
              <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11px]">Opcional</p>
            </div>
            <input type="file" accept="image/*" onChange={handleChildPhoto} className="hidden" />
          </label>

          <input value={childForm.name} onChange={e => setChild("name", e.target.value)} placeholder="Nome da criança"
            className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
          <input value={childForm.age} onChange={e => setChild("age", e.target.value.replace(/[^0-9]/g, ""))} placeholder="Idade" inputMode="numeric"
            className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
          <input value={childForm.diet} onChange={e => setChild("diet", e.target.value)} placeholder="Restrição alimentar (opcional)"
            className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-[13px]"
            style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

          <label className="flex items-center gap-3 mb-4 cursor-pointer rounded-2xl p-3.5" style={{ background: "#FFFFFF", border: "1px solid #D6D6D6" }}>
            <input type="checkbox" checked={childForm.neurodivergente} onChange={e => setChild("neurodivergente", e.target.checked)}
              className="w-4 h-4 rounded shrink-0" style={{ accentColor: "#5A4BC7" }} />
            <span>
              <span style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px] block">Criança neurodivergente</span>
              <span style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] block mt-0.5">Ex: TEA, TDAH — ajuda a equipe a acolher melhor</span>
            </span>
          </label>

          <button onClick={addAnotherChild} disabled={savingChild}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl mb-5 text-[12.5px] font-semibold"
            style={{ fontFamily: "Inter", background: "#FFFFFF", color: "#4D4D4D", border: "1px solid #D6D6D6", opacity: savingChild ? 0.6 : 1 }}>
            <Plus size={14} /> Adicionar e cadastrar outra criança
          </button>

          {childError && <p style={{ fontFamily: "Inter", color: "#8A8A8A" }} className="text-[12px] mb-4 text-center">{childError}</p>}

          <button onClick={finishOnboarding} disabled={savingChild}
            className="w-full py-4 rounded-full font-semibold text-[15px] active:scale-[0.98] transition-transform mb-2.5"
            style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter", opacity: savingChild ? 0.6 : 1 }}>
            {savingChild ? "Salvando..." : childFormHasData ? "Salvar e continuar" : "Continuar"}
          </button>
          <button onClick={skipChildren} disabled={savingChild}
            className="w-full py-3 rounded-full font-semibold text-[13px]"
            style={{ fontFamily: "Inter", color: "#707070" }}>
            Pular por enquanto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col" style={{ background: "#F2F2F2" }}>
      <div className="flex-1 overflow-y-auto px-7 pt-4 pb-8">
        <div className="flex justify-center mb-5">
          <svg width="34" height="46" viewBox="0 0 46 64" fill="none">
            <rect x="19" y="0" width="8" height="64" rx="2" fill="#000000" />
            <rect x="0" y="16" width="46" height="8" rx="2" fill="#000000" />
          </svg>
        </div>
        <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[22px] text-center mb-1">
          {mode === "cadastro" ? "Criar conta" : "Entrar"}
        </h1>
        <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12px] text-center mb-6">
          {mode === "cadastro" ? "Faça parte da comunidade da igreja" : "Que bom ter você de volta"}
        </p>

        <div className="flex gap-2 mb-6">
          <button onClick={() => { setMode("cadastro"); setError(""); }} className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: mode === "cadastro" ? "#000000" : "#FFFFFF", color: mode === "cadastro" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Criar conta
          </button>
          <button onClick={() => { setMode("login"); setError(""); }} className="flex-1 py-2.5 rounded-2xl text-[12px] font-semibold"
            style={{ fontFamily: "Inter", background: mode === "login" ? "#000000" : "#FFFFFF", color: mode === "login" ? "#FFFFFF" : "#4D4D4D", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            Entrar
          </button>
        </div>

        {mode === "cadastro" ? (
          <>
            <PhotoPickerField photo={form.photo} onChange={p => set("photo", p)} label="Foto de perfil (opcional)" />

            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Nome completo</label>
            <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Data de nascimento</label>
            <input type="date" value={form.nascimento} onChange={e => set("nascimento", e.target.value)}
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">E-mail (será seu login)</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="voce@email.com"
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Celular / WhatsApp <span style={{ color: "#9E9E9E" }}>(opcional)</span></label>
            <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 90000-0000"
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Senha</label>
            <PasswordField value={form.senha} onChange={e => set("senha", e.target.value)} placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Confirme sua senha</label>
            <PasswordField value={form.confirmaSenha} onChange={e => set("confirmaSenha", e.target.value)} placeholder="Repita a senha"
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Você já é membro da igreja?</label>
            <div className="flex gap-2 mb-4">
              <button type="button" onClick={() => set("membro", true)}
                className="flex-1 py-3 rounded-xl text-[13px] font-semibold"
                style={{ fontFamily: "Inter", background: form.membro === true ? "#000000" : "#FFFFFF", color: form.membro === true ? "#FFFFFF" : "#4D4D4D", border: "1px solid " + (form.membro === true ? "#000000" : "#D6D6D6") }}>
                Sim, sou membro
              </button>
              <button type="button" onClick={() => set("membro", false)}
                className="flex-1 py-3 rounded-xl text-[13px] font-semibold"
                style={{ fontFamily: "Inter", background: form.membro === false ? "#000000" : "#FFFFFF", color: form.membro === false ? "#FFFFFF" : "#4D4D4D", border: "1px solid " + (form.membro === false ? "#000000" : "#D6D6D6") }}>
                Ainda não
              </button>
            </div>

            <label className="flex items-start gap-3 mb-5 cursor-pointer rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid #D6D6D6" }}>
              <input type="checkbox" checked={form.receberMensagens} onChange={e => set("receberMensagens", e.target.checked)}
                className="w-4 h-4 rounded mt-0.5 shrink-0" style={{ accentColor: "#000000" }} />
              <span>
                <span style={{ fontFamily: "Inter", color: "#000000", fontWeight: 600 }} className="text-[12.5px] block">Quero receber mensagens durante a semana</span>
                <span style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[11px] leading-relaxed block mt-0.5">Avisos, devocionais e novidades enviados pela nossa equipe.</span>
              </span>
            </label>

            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Profissão <span style={{ color: "#9E9E9E" }}>(opcional)</span></label>
            <input value={form.profissao} onChange={e => set("profissao", e.target.value)} placeholder="Ex: Eletricista, Advogado, Cabeleireira..."
              className="w-full px-4 py-3 rounded-xl mb-2 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />
            <p style={{ fontFamily: "Inter", color: "#9E9E9E" }} className="text-[10.5px] leading-relaxed mb-5">
              ⓘ Sua profissão aparece no seu perfil, visível pra outros membros da igreja — assim, se alguém precisar de um serviço que você oferece, já sabe a quem procurar.
            </p>

            {error && <p style={{ fontFamily: "Inter", color: "#8A8A8A" }} className="text-[12px] mb-4 text-center">{error}</p>}

            <button onClick={handleCadastro} disabled={loading}
              className="w-full py-4 rounded-full font-semibold text-[15px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Criando conta..." : "Criar minha conta"}
            </button>
          </>
        ) : (
          <>
            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">E-mail</label>
            <input type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} placeholder="voce@email.com"
              className="w-full px-4 py-3 rounded-xl mb-4 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <label style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[11px] block mb-1.5">Senha</label>
            <PasswordField value={loginForm.senha} onChange={e => setLoginForm(f => ({ ...f, senha: e.target.value }))} placeholder="Sua senha"
              className="w-full px-4 py-3 rounded-xl mb-2 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

            <button onClick={handleResetPassword} disabled={resetLoading} className="text-[11.5px] mb-5 block" style={{ fontFamily: "Inter", color: "#616161" }}>
              {resetLoading ? "Enviando..." : "Esqueci minha senha"}
            </button>

            {resetSent && (
              <p style={{ fontFamily: "Inter", color: "#4B7D5C" }} className="text-[12px] mb-4 text-center">Enviamos um link pra redefinir sua senha no e-mail informado.</p>
            )}
            {error && <p style={{ fontFamily: "Inter", color: "#8A8A8A" }} className="text-[12px] mb-4 text-center">{error}</p>}

            <button onClick={handleLogin} disabled={loading}
              className="w-full py-4 rounded-full font-semibold text-[15px] active:scale-[0.98] transition-transform"
              style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthScreen;
