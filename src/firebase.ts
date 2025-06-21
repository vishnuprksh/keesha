import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';

// Get Firebase configuration from environment variables or localStorage fallback
const getFirebaseConfig = () => {
  // First try environment variables
  const envConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };

  // Check if all environment variables are set
  const hasEnvConfig = Object.values(envConfig).every(value => value && value !== 'your_api_key_here' && value !== 'your_project_id');

  if (hasEnvConfig) {
    return envConfig;
  }

  // Fallback to localStorage config
  const storedConfig = localStorage.getItem('firebase-config');
  if (storedConfig) {
    try {
      return JSON.parse(storedConfig);
    } catch (error) {
      console.error('Error parsing stored Firebase config:', error);
    }
  }

  // Return null if no valid config found
  return null;
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Connect to emulators in development (optional)
  if (process.env.NODE_ENV === 'development') {
    if (process.env.REACT_APP_USE_FIRESTORE_EMULATOR === 'true') {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    if (process.env.REACT_APP_USE_AUTH_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
  }
} else {
  console.warn('Firebase configuration not found. Please set up Firebase configuration.');
}

export { db, auth };
export const isFirebaseConfigured = !!firebaseConfig;
export default app;
