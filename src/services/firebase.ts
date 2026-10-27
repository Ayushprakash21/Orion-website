import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import {
  getAuth,
  type Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: 'AIzaSyC5qgG4DkMfCEdhNYHIb8hsIQ00pIkYRGo',
  authDomain: 'orion9-dev-db-2026.firebaseapp.com',
  projectId: 'orion9-dev-db-2026',
  storageBucket: 'orion9-dev-db-2026.firebasestorage.app',
  messagingSenderId: '1031466156269',
  appId: '1:1031466156269:web:1d8b92bd6adea9b09b8ce4',
  firestoreDatabaseId: 'ai-studio-orion9theintelli-c9e042d6-9d0a-4a41-91ee-a78214c20b1b',
};

const RUNTIME_FIREBASE_STORAGE_KEY = 'orion9_firebase_runtime_config';

export const BOOTSTRAPPED_ADMIN_EMAILS = ['ayushprakash0021@gmail.com'];

/**
 * Resolves Firebase Web SDK configuration from environment variables, runtime storage, or project defaults.
 */
export function getFirebaseConfig(): FirebaseClientConfig | null {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};

  const apiKey = env.VITE_FIREBASE_API_KEY?.trim();
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = env.VITE_FIREBASE_PROJECT_ID?.trim();

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
      appId: env.VITE_FIREBASE_APP_ID?.trim(),
      firestoreDatabaseId: env.VITE_FIRESTORE_DATABASE_ID?.trim(),
    };
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(RUNTIME_FIREBASE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FirebaseClientConfig;
        if (parsed.apiKey && parsed.projectId) {
          return {
            apiKey: parsed.apiKey.trim(),
            authDomain: parsed.authDomain?.trim() || `${parsed.projectId.trim()}.firebaseapp.com`,
            projectId: parsed.projectId.trim(),
            storageBucket: parsed.storageBucket?.trim() || `${parsed.projectId.trim()}.firebasestorage.app`,
            messagingSenderId: parsed.messagingSenderId?.trim(),
            appId: parsed.appId?.trim(),
            firestoreDatabaseId: parsed.firestoreDatabaseId?.trim(),
          };
        }
      }
    } catch {
      // Ignore malformed localStorage
    }
  }

  return DEFAULT_FIREBASE_CONFIG;
}

export function getActiveFirebaseConfig(): FirebaseClientConfig {
  return getFirebaseConfig() || DEFAULT_FIREBASE_CONFIG;
}

export function saveRuntimeFirebaseConfig(config: FirebaseClientConfig | null): void {
  if (typeof window === 'undefined') return;
  if (!config || !config.apiKey || !config.projectId) {
    window.localStorage.removeItem(RUNTIME_FIREBASE_STORAGE_KEY);
  } else {
    window.localStorage.setItem(RUNTIME_FIREBASE_STORAGE_KEY, JSON.stringify(config));
  }
  app = null;
  auth = null;
  db = null;
  storage = null;
}

export function clearRuntimeFirebaseConfig(): void {
  saveRuntimeFirebaseConfig(null);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function initializeFirebase(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  isConfigured: boolean;
} {
  if (auth && app && db) {
    if (!storage) {
      try { storage = getStorage(app); } catch {}
    }
    return { app, auth, db, storage, isConfigured: true };
  }

  const config = getFirebaseConfig();

  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, auth: null, db: null, storage: null, isConfigured: false };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);
    try { storage = getStorage(app); } catch {}
    return { app, auth, db, storage, isConfigured: true };
  } catch (err) {
    console.warn('[Orion-9 Firebase] Failed to initialize Firebase SDK:', err);
    return { app: null, auth: null, db: null, storage: null, isConfigured: false };
  }
}

export function getFirebaseStorageInstance(): FirebaseStorage | null {
  if (storage) return storage;
  const { app, storage: s } = initializeFirebase();
  if (s) return s;
  if (app) {
    try {
      storage = getStorage(app);
      return storage;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Verifies whether an authenticated Firebase user holds Administrator privileges.
 * Checks:
 * 1. Custom token claims (`admin === true` or `role === 'admin'`)
 * 2. Bootstrapped owner email (`ayushprakash0021@gmail.com` with verified email)
 * 3. Protected Firestore `/admins/{uid}` document (`active === true` and `role === 'admin'`)
 */
export async function verifyAdminAuthorization(user: User | null): Promise<{
  isAdmin: boolean;
  source: 'custom_claim' | 'admins_collection' | 'bootstrapped_owner' | 'none';
  reason?: string;
}> {
  if (!user) {
    return { isAdmin: false, source: 'none', reason: 'Not authenticated.' };
  }

  try {
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult?.claims?.admin === true || tokenResult?.claims?.role === 'admin') {
      return { isAdmin: true, source: 'custom_claim' };
    }
  } catch {
    // Continue to Firestore and owner check
  }

  if (
    user.email &&
    BOOTSTRAPPED_ADMIN_EMAILS.includes(user.email.toLowerCase()) &&
    user.emailVerified
  ) {
    return { isAdmin: true, source: 'bootstrapped_owner' };
  }

  const { db: firestore, isConfigured } = initializeFirebase();
  if (isConfigured && firestore) {
    try {
      const adminSnap = await getDoc(doc(firestore, 'admins', user.uid));
      if (adminSnap.exists()) {
        const data = adminSnap.data();
        if (data?.active === true && (data?.role === 'admin' || data?.role === 'superadmin')) {
          return { isAdmin: true, source: 'admins_collection' };
        }
      }
    } catch {
      // Document not accessible or not an admin
    }
  }

  return {
    isAdmin: false,
    source: 'none',
    reason:
      'Your account is authenticated, but does not have an active administrator role in /admins/{uid} or an admin custom claim.',
  };
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type User,
  type Firestore,
};
