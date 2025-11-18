import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Safely access environment variables. 
// In some direct deployment scenarios, import.meta.env might be undefined.
const env = (import.meta as any).env || {};

// These environment variables must be set in your deployment platform (e.g., Vercel, Netlify, or .env file)
// to enable Google Cloud integration.
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present, otherwise the app handles the fallback gracefully.
let app;
let auth: Auth | undefined;
let db: Firestore | undefined;

// We check if apiKey is present and not just an empty string/undefined placeholder
if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.warn("Firebase configuration present but initialization failed:", error);
  }
} else {
    console.log("No Firebase config found. App will run in Mock/Local Storage mode.");
}

export { auth, db };