import React from "react";
import { BookOpenCheck } from "lucide-react";

const SECOES = [
  {
    title: "Sobre o app",
    body: "Este é o aplicativo da comunidade da Igreja do Nazareno A Casa, feito pra conectar membros, organizar a vida da igreja e apoiar o crescimento espiritual de cada um.",
  },
  {
    title: "Sua conta",
    body: "Você é responsável por manter sua senha em segurança e por manter suas informações de cadastro atualizadas. Não compartilhe sua conta com outras pessoas.",
  },
  {
    title: "Convivência na comunidade",
    body: "Feed, Stories, Chat e comentários são espaços da nossa comunidade — trate cada pessoa com respeito. Conteúdo ofensivo, discurso de ódio ou spam pode ser removido pela liderança, e o acesso ao app pode ser suspenso em casos graves.",
  },
  {
    title: "Check-in de crianças",
    body: "O check-in de segurança da Área Infantil existe pra proteger as crianças da igreja. Só o responsável cadastrado ou quem apresentar o código correto pode retirar a criança.",
  },
  {
    title: "Contribuições e generosidade",
    body: "As contribuições feitas via Pix dentro do app são processadas diretamente entre você e a instituição financeira — o app apenas facilita o compartilhamento da chave e QR Code.",
  },
  {
    title: "Mudanças nestes termos",
    body: "Podemos atualizar estes termos conforme o app evolui. Mudanças importantes serão avisadas dentro do próprio app.",
  },
];

function TermosUsoScreen({ onBack }) {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Perfil</button>
      </div>
      <div className="px-6 mt-1 mb-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#6D5C8A1E" }}>
          <BookOpenCheck size={20} color="#6D5C8A" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">Termos de Uso</h1>
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

export default TermosUsoScreen;
