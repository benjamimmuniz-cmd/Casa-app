import { addDoc, arrayRemove, arrayUnion, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export async function createGroupChat({ name, photo, members, createdByUid, createdByName }) {
  const participants = [createdByUid, ...members.map(m => m.uid)];
  const participantNames = { [createdByUid]: createdByName };
  members.forEach(m => { participantNames[m.uid] = m.nome; });
  const ref = await addDoc(collection(db, "chatGroups"), {
    name, photo: photo || null, participants, participantNames,
    createdBy: createdByUid,
    updatedAt: serverTimestamp(),
    lastMessage: { text: "Grupo criado", senderUid: createdByUid },
    readAt: { [createdByUid]: serverTimestamp() },
    typingUids: [],
  });
  await Promise.all(members.map(m => addDoc(collection(db, "notifications"), {
    toUid: m.uid, text: `${createdByName} te adicionou no grupo "${name}".`, read: false, createdAt: serverTimestamp(),
  })));
  return ref.id;
}

export async function addMembersToGroup({ groupId, groupName, members, addedByName }) {
  const groupRef = doc(db, "chatGroups", groupId);
  const namesUpdate = {};
  members.forEach(m => { namesUpdate[`participantNames.${m.uid}`] = m.nome; });
  await updateDoc(groupRef, {
    participants: arrayUnion(...members.map(m => m.uid)),
    ...namesUpdate,
  });
  await Promise.all(members.map(m => addDoc(collection(db, "notifications"), {
    toUid: m.uid, text: `${addedByName} te adicionou no grupo "${groupName}".`, read: false, createdAt: serverTimestamp(),
  })));
}

export async function removeMemberFromGroup(groupId, uid) {
  await updateDoc(doc(db, "chatGroups", groupId), { participants: arrayRemove(uid) });
}

export async function updateGroupPhoto(groupId, photo) {
  await updateDoc(doc(db, "chatGroups", groupId), { photo });
}

export async function sendGroupMessage({ groupId, myUid, myName, text, image, audio, sharedPost }) {
  const preview = text?.trim() || (sharedPost ? `📎 post de ${sharedPost.author}` : (audio ? "🎤 Áudio" : (image ? "📷 Foto" : "")));
  await updateDoc(doc(db, "chatGroups", groupId), {
    updatedAt: serverTimestamp(),
    lastMessage: { text: `${myName}: ${preview}`, senderUid: myUid },
    [`readAt.${myUid}`]: serverTimestamp(),
    typingUids: arrayRemove(myUid),
  });
  await addDoc(collection(db, "chatGroups", groupId, "messages"), {
    senderUid: myUid, senderName: myName, text: text?.trim() || "",
    image: image || null, audio: audio || null, sharedPost: sharedPost || null, createdAt: serverTimestamp(),
  });
}
