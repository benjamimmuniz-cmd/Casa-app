import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { todayLabel } from "./helpers.js";

// Um documento por pessoa por dia (id determinístico), pra escanear o QR
// mais de uma vez no mesmo dia não criar presença duplicada.
export function markAttendance(uid, name) {
  const dateLabel = todayLabel();
  const id = `${uid}_${dateLabel.replace(/\//g, "-")}`;
  return setDoc(doc(db, "presencas", id), { uid, name, dateLabel, at: serverTimestamp() }, { merge: true });
}
