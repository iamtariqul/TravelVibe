// Firebase configuration for TravelVibe
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For development, we use placeholder values
// In production, use environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC3bFSoQCGIrL4Pm-ktWdm8WqO6R2csIAA",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "travelvibediu.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "travelvibediu",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "travelvibediu.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "466443222123",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:466443222123:web:96eb0089d7a58aa7ef052e"
};

console.log('Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey ? 'API_KEY_SET' : 'API_KEY_MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  appId: firebaseConfig.appId ? 'APP_ID_SET' : 'APP_ID_MISSING'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log('Firebase initialized successfully');

export { auth, db, storage }; 