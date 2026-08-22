import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase.js";
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
    case "permission-denied": return "Sem permissão para acessar seus dados. Fale com a liderança da igreja.";
    default: return "Algo deu errado. Tente novamente.";
  }
}

function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState("cadastro"); // cadastro | login
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: "", nascimento: "", email: "", senha: "", confirmaSenha: "", profissao: "", membro: null, receberMensagens: true, photo: null });
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
      const profile = {
        nome: form.nome.trim(), nascimento: form.nascimento, email: form.email.trim(),
        profissao: form.profissao.trim(), membro: form.membro, receberMensagens: form.receberMensagens,
        photo: form.photo || null, role: "member", createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", cred.user.uid), profile);
      onSuccess({ uid: cred.user.uid, ...profile });
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
              className="w-full px-4 py-3 rounded-xl mb-5 outline-none text-[13px]"
              style={{ fontFamily: "Inter", background: "#FFFFFF", border: "1px solid #D6D6D6", color: "#000000" }} />

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
