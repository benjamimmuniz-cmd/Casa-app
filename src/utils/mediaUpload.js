import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.js";

const MAX_VIDEO_MB = 60;

// Sobe um video pro Firebase Storage (fotos/audio continuam como base64 no
// Firestore — video e grande demais pra isso, precisa de um lugar proprio).
// onProgress recebe um numero de 0 a 1.
export function uploadVideo(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      reject(new Error(`Vídeo muito grande — o máximo é ${MAX_VIDEO_MB}MB.`));
      return;
    }
    const task = uploadBytesResumable(ref(storage, path), file);
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
