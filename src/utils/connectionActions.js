import { doc, setDoc, addDoc, collection, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { getChatId } from "./chatId.js";

function notify(toUid, text) {
  return addDoc(collection(db, "notifications"), { toUid, text, read: false, createdAt: serverTimestamp() });
}

export async function sendConnectionRequest({ myUid, myName, otherUid, otherName }) {
  const id = getChatId(myUid, otherUid);
  await setDoc(doc(db, "connections", id), {
    participants: [myUid, otherUid],
    fromUid: myUid, fromName: myName,
    toUid: otherUid, toName: otherName,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  await notify(otherUid, `${myName} te enviou um pedido de amizade.`);
}

export async function respondConnectionRequest(connection, accept) {
  if (accept) {
    await updateDoc(doc(db, "connections", connection.id), { status: "accepted" });
    await notify(connection.fromUid, `${connection.toName} aceitou seu pedido de amizade.`);
  } else {
    await deleteDoc(doc(db, "connections", connection.id));
  }
}

export function cancelConnectionRequest(id) {
  return deleteDoc(doc(db, "connections", id));
}
