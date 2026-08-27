import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

export function createPedido({ store, buyerUid, buyerName, items, total }) {
  return addDoc(collection(db, "pedidos"), {
    store, buyerUid, buyerName, items, total, createdAt: serverTimestamp(),
  });
}
