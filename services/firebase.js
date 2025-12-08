// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDmqsdfWwUVK5koxlOnW_-k_TsMLGVCQ7o",
  authDomain: "inspiramais-6f73b.firebaseapp.com",
  projectId: "inspiramais-6f73b",
  storageBucket: "inspiramais-6f73b.firebasestorage.app",
  messagingSenderId: "747123918474",
  appId: "1:747123918474:web:bd55b098fd2f2c2ec0cf73",
  measurementId: "G-EBE8DRQ48E"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que você vai usar
export const db = getFirestore(app);        // ← Banco de dados (Firestore)
export const auth = getAuth(app);           // ← Login (Google, email, etc)
export const analytics = getAnalytics(app); // ← Opcional (pode apagar se não usar)