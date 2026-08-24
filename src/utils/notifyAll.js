import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

// Manda uma notificação (linha na coleção "notifications") pra todo mundo
// cadastrado, menos quem desativou notificações nas configs do perfil e,
// opcionalmente, menos quem disparou a ação (excludeUid).
export function broadcastNotification(text, { excludeUid } = {}) {
  return getDocs(collection(db, "users")).then(snap => {
    snap.docs.forEach(d => {
      if (excludeUid && d.id === excludeUid) return;
      const u = d.data();
      if (u.notificacoesAtivas === false) return;
      addDoc(collection(db, "notifications"), {
        toUid: d.id, text, read: false, createdAt: serverTimestamp(),
      }).catch(() => {});
    });
  });
}
