import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  initializeFirebase,
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
  verifyAdminAuthorization,
  doc,
  setDoc,
  serverTimestamp,
  type User,
} from '../services/firebase';
import {
  resolveLaunchUrl,
  evaluateCrossAppAuth,
  type CrossAppAuthStatus,
} from '../utils/auth-validation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminAuthSource: string;
  loading: boolean;
  isFirebaseConfigured: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot';
  launchPending: boolean;
  isTransitioning: boolean;
  transitionMessage: string | null;
  crossAppStatus: CrossAppAuthStatus;
  destinationUrl: string;
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  launchOrion: (customTargetUrl?: string) => void;
  login: (
    email: string,
    pass: string,
    remember?: boolean
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (
    name: string,
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; verificationSent?: boolean }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function mapFirebaseAuthError(err: unknown, fallback: string): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters with letters and numbers.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access has been temporarily paused for security—please try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection and retry.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled in the current Firebase project.';
    default:
      if (err instanceof Error && err.message) {
        return err.message;
      }
      return fallback;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminAuthSource, setAdminAuthSource] = useState<string>('none');
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [launchPending, setLaunchPending] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);

  const crossAppStatus = useMemo(() => evaluateCrossAppAuth(), []);
  const resolved = useMemo(() => resolveLaunchUrl(), []);
  const destinationUrl = resolved.url;

  const checkAdmin = useCallback(async (targetUser: User | null): Promise<boolean> => {
    if (!targetUser) {
      setIsAdmin(false);
      setAdminAuthSource('none');
      return false;
    }
    const res = await verifyAdminAuthorization(targetUser);
    setIsAdmin(res.isAdmin);
    setAdminAuthSource(res.source);
    return res.isAdmin;
  }, []);

  useEffect(() => {
    const { auth, isConfigured } = initializeFirebase();
    setIsFirebaseConfigured(isConfigured);

    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        await checkAdmin(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [checkAdmin]);

  const openAuthModal = useCallback((mode: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const executeLiveLaunch = useCallback(
    (customTargetUrl?: string) => {
      const safeTarget = customTargetUrl ? resolveLaunchUrl(customTargetUrl).url : destinationUrl;
      setIsTransitioning(true);
      setTransitionMessage('Connecting to the Orion-9 Control Tower at ' + safeTarget);

      setTimeout(() => {
        window.location.href = safeTarget;
      }, 1100);
    },
    [destinationUrl]
  );

  const launchOrion = useCallback(
    (customTargetUrl?: string) => {
      executeLiveLaunch(customTargetUrl);
    },
    [executeLiveLaunch]
  );

  const login = async (
    email: string,
    pass: string,
    remember = true
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const { auth, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error:
          'Firebase Authentication is not configured in this environment. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment configuration to enable live Firebase authentication.',
      };
    }

    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(cred.user);
      await checkAdmin(cred.user);
      closeAuthModal();

      if (launchPending) {
        setLaunchPending(false);
        executeLiveLaunch();
      }

      return { success: true, user: cred.user };
    } catch (err: unknown) {
      return {
        success: false,
        error: mapFirebaseAuthError(err, 'Failed to sign in. Please verify your credentials.'),
      };
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; verificationSent?: boolean }> => {
    const { auth, db, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error:
          'Firebase Authentication is not configured in this environment. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment configuration to enable account creation.',
      };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }

      let verificationSent = false;
      try {
        await sendEmailVerification(cred.user);
        verificationSent = true;
      } catch {
        // Non-fatal if email verification rate-limited
      }

      if (db && cred.user) {
        try {
          await setDoc(
            doc(db, 'users', cred.user.uid),
            {
              uid: cred.user.uid,
              displayName: name.trim(),
              email: cred.user.email,
              role: 'operator',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch {
          // Non-fatal if Firestore rules or offline state prevent profile write
        }
      }

      setUser(cred.user);
      await checkAdmin(cred.user);
      closeAuthModal();

      if (launchPending) {
        setLaunchPending(false);
        executeLiveLaunch();
      }

      return { success: true, verificationSent };
    } catch (err: unknown) {
      return {
        success: false,
        error: mapFirebaseAuthError(err, 'Registration failed. Please try again.'),
      };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const { auth, db, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error:
          'Google Sign-In requires an active Firebase Authentication configuration (VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID).',
      };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      if (db && cred.user) {
        try {
          await setDoc(
            doc(db, 'users', cred.user.uid),
            {
              uid: cred.user.uid,
              displayName: cred.user.displayName || '',
              email: cred.user.email || '',
              role: 'operator',
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch {
          // Non-fatal
        }
      }
      setUser(cred.user);
      await checkAdmin(cred.user);
      closeAuthModal();

      if (launchPending) {
        setLaunchPending(false);
        executeLiveLaunch();
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: mapFirebaseAuthError(err, 'Google sign-in could not be completed.'),
      };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const { auth, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error:
          'Password reset requires an active Firebase Authentication configuration (VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID).',
      };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: mapFirebaseAuthError(err, 'Failed to send password reset email.'),
      };
    }
  };

  const logout = async (): Promise<void> => {
    const { auth, isConfigured } = initializeFirebase();
    if (isConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    setIsAdmin(false);
    setAdminAuthSource('none');
  };

  const refreshAdminStatus = async (): Promise<boolean> => {
    const { auth, isConfigured } = initializeFirebase();
    setIsFirebaseConfigured(isConfigured);
    const currentUser = auth?.currentUser || user;
    return checkAdmin(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin,
        adminAuthSource,
        loading,
        isFirebaseConfigured,
        authModalOpen,
        authModalMode,
        launchPending,
        isTransitioning,
        transitionMessage,
        crossAppStatus,
        destinationUrl,
        openAuthModal,
        closeAuthModal,
        launchOrion,
        login,
        signup,
        loginWithGoogle,
        resetPassword,
        logout,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
