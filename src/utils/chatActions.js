import { doc, setDoc, addDoc, collection, serverTimestamp, arrayUnion, arrayRemove, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { getChatId } from "./chatId.js";

// base = "chats" ou "chatGroups" — funções genéricas usadas pelos dois tipos de conversa.
export function markChatRead(base, chatId, myUid) {
  return updateDoc(doc(db, base, chatId), { [`readAt.${myUid}`]: serverTimestamp() }).catch(() => {});
}

export function setTyping(base, chatId, myUid, isTyping) {
  return updateDoc(doc(db, base, chatId), { typingUids: isTyping ? arrayUnion(myUid) : arrayRemove(myUid) }).catch(() => {});
}

export function deleteChatMessage(base, chatId, messageId) {
  return deleteDoc(doc(db, base, chatId, "messages", messageId));
}

// Garante que a conversa exista e adiciona a mensagem — usado tanto pelo Chat
// quanto pelo "encaminhar" de um post do Feed.
export async function sendChatMessage({ myUid, myName, otherUid, otherName, text, sharedPost, image, audio }) {
  const chatId = getChatId(myUid, otherUid);
  const chatRef = doc(db, "chats", chatId);
  const preview = text?.trim() || (sharedPost ? `📎 post de ${sharedPost.author}` : (audio ? "🎤 Áudio" : (image ? "📷 Foto" : "")));
  await setDoc(chatRef, {
    participants: [myUid, otherUid],
    participantNames: { [myUid]: myName, [otherUid]: otherName },
    updatedAt: serverTimestamp(),
    lastMessage: { text: preview, senderUid: myUid },
    readAt: { [myUid]: serverTimestamp() },
    typingUids: arrayRemove(myUid),
  }, { merge: true });
  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderUid: myUid, senderName: myName, text: text?.trim() || "",
    image: image || null, audio: audio || null, sharedPost: sharedPost || null, createdAt: serverTimestamp(),
  });
  await addDoc(collection(db, "notifications"), {
    toUid: otherUid, text: `${myName}: ${preview || "nova mensagem"}`, read: false, createdAt: serverTimestamp(),
  });
  return chatId;
}
