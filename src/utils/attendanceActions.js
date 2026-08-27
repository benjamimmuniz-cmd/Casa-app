import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { todayLabel } from "./helpers.js";

const DAY_NAMES = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

// So sabemos os horarios de domingo por enquanto (17h e 19h30) — os outros
// dias da semana ainda nao tem horario definido, entao ficam so com o nome
// do dia ate isso ser combinado.
export function getCultoInfo(date = new Date()) {
  const day = date.getDay();
  if (day === 0) {
    const minutes = date.getHours() * 60 + date.getMinutes();
    const cutoff = 18 * 60 + 15; // meio do caminho entre 17h e 19h30
    return minutes < cutoff
      ? { key: "dom-17h", label: "Culto de domingo · 17h" }
      : { key: "dom-19h30", label: "Culto de domingo · 19h30" };
  }
  return { key: `dia-${day}`, label: DAY_NAMES[day] };
}

// Um documento por pessoa, por dia, por culto (id determinístico) — assim
// escanear de novo no mesmo culto não duplica, mas os dois cultos de domingo
// ficam separados.
export function markAttendance(uid, name) {
  const now = new Date();
  const dateLabel = todayLabel();
  const { key: cultoKey, label: culto } = getCultoInfo(now);
  const id = `${uid}_${dateLabel.replace(/\//g, "-")}_${cultoKey}`;
  return setDoc(doc(db, "presencas", id), { uid, name, dateLabel, culto, cultoKey, at: serverTimestamp() }, { merge: true });
}
