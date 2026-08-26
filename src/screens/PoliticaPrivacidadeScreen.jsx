import React from "react";
import { ShieldCheck } from "lucide-react";

const SECOES = [
  {
    title: "Quais dados coletamos",
    body: "Nome, e-mail, data de nascimento, celular, profissão e foto de perfil, informados no cadastro. Se você cadastrar filhos, também guardamos nome, idade, foto, restrição alimentar e informações de check-in deles. Mensagens de chat, posts do Feed, Stories e reações ficam salvos enquanto a conta existir.",
  },
  {
    title: "Como usamos esses dados",
    body: "Só para o funcionamento do app: identificar você na comunidade, mostrar seu perfil pra outros membros, permitir check-in seguro das crianças na Área Infantil, organizar escalas de voluntários e enviar notificações do que acontece na igreja.",
  },
  {
    title: "Quem pode ver o quê",
    body: "Seu nome, foto e profissão aparecem no Diretório de Membros pra qualquer pessoa com conta no app. Celular e data de nascimento também ficam visíveis pra outros membros logados, pra facilitar contato dentro da comunidade. Informações de crianças (restrição alimentar, código de check-in) só ficam visíveis pra você e pra equipe da Área Infantil.",
  },
  {
    title: "Onde os dados ficam guardados",
    body: "Tudo é armazenado no Firebase (Google Cloud), com acesso protegido por regras de segurança — cada pessoa só acessa o que tem permissão de acessar.",
  },
  {
    title: "Seus direitos",
    body: "Você pode editar a maior parte dos seus dados direto no Perfil. Pra pedir a exclusão da sua conta ou de dados específicos, fale com a liderança da igreja.",
  },
  {
    title: "Contato",
    body: "Dúvidas sobre esta política podem ser encaminhadas diretamente à liderança da Igreja do Nazareno A Casa.",
  },
];

function PoliticaPrivacidadeScreen({ onBack }) {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Perfil</button>
      </div>
      <div className="px-6 mt-1 mb-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#3E5FBF1E" }}>
          <ShieldCheck size={20} color="#3E5FBF" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">Política de Privacidade</h1>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mt-0.5">Igreja do Nazareno A Casa</p>
        </div>
      </div>

      <div className="px-6 pb-10 flex flex-col gap-5">
        {SECOES.map((s, i) => (
          <div key={i}>
            <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[14px] mb-1.5">{s.title}</p>
            <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[12.5px] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PoliticaPrivacidadeScreen;
