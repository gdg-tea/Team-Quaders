import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAAiZDc6OnTbLH2vd_tLlLSb5gqi6mGxaQ",
  authDomain: "quaders-4ace5.firebaseapp.com",
  projectId: "quaders-4ace5",
  storageBucket: "quaders-4ace5.firebasestorage.app",
  messagingSenderId: "659065177996",
  appId: "1:659065177996:web:14950fcfa1d7983eb5f8a9",
  measurementId: "G-SFYCXTMD46",
}

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
}
