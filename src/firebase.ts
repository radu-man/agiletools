import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from "firebase/auth";

// Firebase configuration (Automatically updated)
const firebaseConfig = {
  apiKey: "AIzaSyDPuxEXZAhLO8RIFtGaTrCpjNzB9X2UsrA",
  authDomain: "agiletools-e0539.firebaseapp.com",
  projectId: "agiletools-e0539",
  storageBucket: "agiletools-e0539.firebasestorage.app",
  messagingSenderId: "1078905863013",
  appId: "1:1078905863013:web:eb5ca0e08be34d010cbf8c",
  measurementId: "G-LFGLSK86QY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const twitterProvider = new TwitterAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile
};
