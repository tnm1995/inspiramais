
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyDmqsdfWwUVK5koxlOnW_-k_TsMLGVCQ7o",
  authDomain: "inspiramais-6f73b.firebaseapp.com",
  projectId: "inspiramais-6f73b",
  storageBucket: "inspiramais-6f73b.firebasestorage.app",
  messagingSenderId: "747123918474",
  appId: "1:747123918474:web:bd55b098fd2f2c2ec0cf73",
  measurementId: "G-EBE8DRQ48E"
};

// Initialize Firebase using compat (v8-style) which is safer when named exports fail
const app = firebase.initializeApp(firebaseConfig);

export const auth = app.auth();
export const db = app.firestore();
export const analytics = app.analytics();
