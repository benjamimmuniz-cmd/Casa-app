import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

export function generateOrderCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function createPedido({ store, buyerUid, buyerName, items, total, code }) {
  return addDoc(collection(db, "pedidos"), {
    store, buyerUid, buyerName, items, total, code, createdAt: serverTimestamp(),
  });
}
