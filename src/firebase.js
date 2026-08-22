import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWWGo2RDqkrfD5GwFLrGWEc-VRLbatrj8",
  authDomain: "casa-app-fca78.firebaseapp.com",
  projectId: "casa-app-fca78",
  storageBucket: "casa-app-fca78.firebasestorage.app",
  messagingSenderId: "803173281458",
  appId: "1:803173281458:web:199349ffcd190e983ce3ab",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
