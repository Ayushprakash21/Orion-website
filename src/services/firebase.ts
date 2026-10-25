import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Detect Firebase configuration from environment or window config
export function getFirebaseConfig(): FirebaseClientConfig | null {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};

  const apiKey = env.VITE_FIREBASE_API_KEY;
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };
  }

  return null;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function initializeFirebase(): { app: FirebaseApp | null; auth: Auth | null; isConfigured: boolean } {
  if (auth && app) {
    return { app, auth, isConfigured: true };
  }

  const config = getFirebaseConfig();

  if (!config || !config.apiKey) {
    return { app: null, auth: null, isConfigured: false };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    return { app, auth, isConfigured: true };
  } catch (err) {
    console.warn('[Orion-9 Firebase] Failed to initialize Firebase SDK with current environment configuration:', err);
    return { app: null, auth: null, isConfigured: false };
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
};
