import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmqsdfWwUVK5koxlOnW_-k_TsMLGVCQ7o",
  authDomain: "inspiramais-6f73b.firebaseapp.com",
  projectId: "inspiramais-6f73b",
  storageBucket: "inspiramais-6f73b.firebasestorage.app",
  messagingSenderId: "747123918474",
  appId: "1:747123918474:web:bd55b098fd2f2c2ec0cf73",
  measurementId: "G-EBE8DRQ48E"
};

// Initialize Firebase (using compat app to ensure initializeApp is found during type resolution)
const app = firebase.initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;