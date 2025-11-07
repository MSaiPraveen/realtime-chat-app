// src/firebase.jsx

// Import core Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Replace the below config with *your actual config* from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAfmMI9mBbr1zFWO9cDwIPW8xvamUJMvss",
  authDomain: "realtime-chat-app-8131a.firebaseapp.com",
  projectId: "realtime-chat-app-8131a",
  storageBucket: "realtime-chat-app-8131a.firebasestorage.app",
  messagingSenderId: "516529109112",
  appId: "1:516529109112:web:ceba3056d34f6afe05158d"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
