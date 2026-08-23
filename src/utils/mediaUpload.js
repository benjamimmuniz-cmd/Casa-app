import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.js";

// Sobe midia pro Firebase Storage em vez de guardar como base64 dentro do
// documento do Firestore. Isso evita que o Firestore reenvie a foto/audio/video
// inteiro de novo toda vez que o post recebe uma curtida ou comentario — só o
// link (uma URL curtinha) fica no documento.
function uploadBlob(blob, path, maxMB, onProgress, timeoutMs) {
  return new Promise((resolve, reject) => {
    if (blob.size > maxMB * 1024 * 1024) {
      reject(new Error(`Arquivo muito grande — o máximo é ${maxMB}MB.`));
      return;
    }
    const task = uploadBytesResumable(ref(storage, path), blob);
    let settled = false;
    // Sem isso, se a conexao cair no meio do envio, o app pode ficar preso
    // pra sempre em "Publicando..." sem nunca dar erro nem sucesso.
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      task.cancel();
      reject(new Error("Demorou demais pra enviar. Verifica sua internet e tenta de novo."));
    }, timeoutMs);
    task.on("state_changed",
      (snap) => onProgress?.(snap.bytesTransferred / snap.totalBytes),
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      },
      async () => {
        if (settled) return;
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(url);
        } catch (err) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      });
  });
}

export function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then(res => res.blob());
}

export function uploadVideo(file, path, onProgress) {
  return uploadBlob(file, path, 60, onProgress, 120000);
}

export async function uploadImageDataUrl(dataUrl, path, onProgress) {
  const blob = await dataUrlToBlob(dataUrl);
  return uploadBlob(blob, path, 10, onProgress, 30000);
}

export async function uploadAudioDataUrl(dataUrl, path, onProgress) {
  const blob = await dataUrlToBlob(dataUrl);
  return uploadBlob(blob, path, 15, onProgress, 45000);
}
