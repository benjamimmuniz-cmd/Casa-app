import React, { useContext, useEffect } from "react";
import { Users } from "lucide-react";
import { UserContext, UsersDirectoryContext } from "../context/contexts.js";
import { colorFor, initials } from "../utils/helpers.js";

// Avatar padrão do app: mostra a foto de perfil de quem publicou, buscando no diretório
// de membros pelo uid (atualiza em tempo real se a pessoa trocar de foto depois).
// Sem uid (casos legados), cai pra comparar só com o usuário logado; sem foto, iniciais.
// `photo` força uma foto específica (usado por grupos, que não têm uid de usuário).
// `isGroup` troca as iniciais por um ícone de grupo quando não há foto.
function Avatar({ name, uid, photo: photoOverride, isGroup, size = 36, fontSize = 11, textColor = "#F2F2F2" }) {
  const me = useContext(UserContext);
  const { byUid, ensureUser } = useContext(UsersDirectoryContext);
  useEffect(() => { if (uid && uid !== me.uid) ensureUser(uid); }, [uid]);
  const dirPhoto = uid ? (byUid[uid]?.photo || (uid === me.uid ? me.photo : null)) : (name === me.name ? me.photo : null);
  const photo = photoOverride || dirPhoto;
  const showPhoto = !!photo;
  return (
    <div className="rounded-full flex items-center justify-center shrink-0 overflow-hidden"
      style={{ width: size, height: size, background: colorFor(name || "?") }}>
      {showPhoto ? (
        <img src={photo} alt="" className="w-full h-full object-cover" />
      ) : isGroup ? (
        <Users size={typeof size === "number" ? size * 0.45 : 16} color={textColor} />
      ) : (
        <span style={{ fontFamily: "Fraunces", color: textColor, fontWeight: 600, fontSize }}>{initials(name || "?")}</span>
      )}
    </div>
  );
}

export default Avatar;
