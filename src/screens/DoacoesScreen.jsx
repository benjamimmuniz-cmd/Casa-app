import React from "react";
import { Gift } from "lucide-react";
import PixGiving from "../components/PixGiving.jsx";

function DoacoesScreen({ onBack }) {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "#F2F2F2" }}>
      <div className="px-6 pt-6 pb-2">
        <button onClick={onBack} className="text-[13px]" style={{ fontFamily: "Inter", color: "#616161" }}>← Início</button>
      </div>
      <div className="px-6 mt-1 mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#5C6B451E" }}>
          <Gift size={20} color="#5C6B45" />
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[20px]">Doações</h1>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[11.5px] mt-0.5">Ajude em campanhas e necessidades da Casa</p>
        </div>
      </div>

      <div className="px-6 mb-5">
        <p style={{ fontFamily: "Inter", color: "#4D4D4D" }} className="text-[13px] leading-relaxed">
          Sua doação ajuda em campanhas especiais, reformas, ações sociais e tudo que a igreja precisa pra continuar servindo a comunidade.
        </p>
      </div>

      <div className="px-6 pb-10">
        <PixGiving />
      </div>
    </div>
  );
}

export default DoacoesScreen;
