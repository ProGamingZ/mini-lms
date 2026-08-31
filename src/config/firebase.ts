import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBw_M2U4K7iW7ySRbnPZndLkNxbaGt8p9k",
  authDomain: "mini-lms-3216f.firebaseapp.com",
  projectId: "mini-lms-3216f",
  storageBucket: "mini-lms-3216f.firebasestorage.app",
  messagingSenderId: "421330205958",
  appId: "1:421330205958:web:97477203b7e68a29823287"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);