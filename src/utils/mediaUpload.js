import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.js";

// Sobe midia pro Firebase Storage em vez de guardar como base64 dentro do
// documento do Firestore. Isso evita que o Firestore reenvie a foto/audio/video
// inteiro de novo toda vez que o post recebe uma curtida ou comentario — só o
// link (uma URL curtinha) fica no documento.
function uploadBlob(blob, path, maxMB, onProgress) {
  return new Promise((resolve, reject) => {
    if (blob.size > maxMB * 1024 * 1024) {
      reject(new Error(`Arquivo muito grande — o máximo é ${maxMB}MB.`));
      return;
    }
    const task = uploadBytesResumable(ref(storage, path), blob);
    task.on("state_changed",
      (snap) => onProgress?.(snap.bytesTransferred / snap.totalBytes),
      (err) => reject(err),
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (err) {
          reject(err);
        }
      });
  });
}

export function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then(res => res.blob());
}

export function uploadVideo(file, path, onProgress) {
  return uploadBlob(file, path, 60, onProgress);
}

export async function uploadImageDataUrl(dataUrl, path, onProgress) {
  const blob = await dataUrlToBlob(dataUrl);
  return uploadBlob(blob, path, 10, onProgress);
}

export async function uploadAudioDataUrl(dataUrl, path, onProgress) {
  const blob = await dataUrlToBlob(dataUrl);
  return uploadBlob(blob, path, 15, onProgress);
}
