import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKCZjMaWbwEHzfvlO_QPuqrQhJX8Sqiow",
  authDomain: "siddhi-divine.firebaseapp.com",
  projectId: "siddhi-divine",
  storageBucket: "siddhi-divine.firebasestorage.app",
  messagingSenderId: "327956410885",
  appId: "1:327956410885:web:07ecb8e5c0c7a4d4a6626c",
  measurementId: "G-9G2CKBRYWT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Set language code for OTP messages (optional)
auth.languageCode = 'en';

export default app;