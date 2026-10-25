import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  initializeFirebase,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
} from '../services/firebase';
import {
  DEFAULT_ORION_APP_URL,
  resolveLaunchUrl,
  evaluateCrossAppAuth,
  type CrossAppAuthStatus,
} from '../utils/auth-validation';

interface AuthContextType {
  user: User | null;
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
  launchOrion: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  simulateAuthForPreview: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  useEffect(() => {
    const { auth, isConfigured } = initializeFirebase();
    setIsFirebaseConfigured(isConfigured);

    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const executeLiveLaunch = () => {
    setIsTransitioning(true);
    setTransitionMessage('Connecting to the Orion-9 Control Tower at ' + destinationUrl);

    // Give a clear, accessible visual cue of navigation to the live application
    setTimeout(() => {
      // Direct navigation to the authenticated live application
      window.location.href = destinationUrl;
    }, 1200);
  };

  const launchOrion = () => {
    if (!user) {
      // If unauthenticated, record intent to launch and open login dialog
      setLaunchPending(true);
      openAuthModal('login');
      return;
    }

    executeLiveLaunch();
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const { auth, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error:
          'Firebase Authentication is not yet provisioned in this environment. Please configure Firebase or use the secure live application redirect.',
      };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setUser(cred.user);
      closeAuthModal();

      if (launchPending) {
        setLaunchPending(false);
        executeLiveLaunch();
      }

      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      let message = 'Failed to sign in. Please check your credentials.';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please verify your credentials.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access temporarily restricted due to many failed attempts. Try again later.';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connectivity.';
      } else if (err instanceof Error) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const signup = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const { auth, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error:
          'Firebase Authentication is not yet provisioned in this environment. Please configure Firebase or access the live Orion-9 platform directly.',
      };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      setUser(cred.user);
      closeAuthModal();

      if (launchPending) {
        setLaunchPending(false);
        executeLiveLaunch();
      }

      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      let message = 'Registration failed. Please try again.';
      if (code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Please log in.';
      } else if (code === 'auth/weak-password') {
        message = 'Password is too weak. Please include at least 8 characters with numbers or symbols.';
      } else if (code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      } else if (err instanceof Error) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const { auth, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase Authentication is not provisioned in this environment.',
      };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: unknown) {
      let message = 'Failed to send password reset email.';
      if (err instanceof Error) message = err.message;
      return { success: false, error: message };
    }
  };

  const logout = async (): Promise<void> => {
    const { auth, isConfigured } = initializeFirebase();
    if (isConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  // Only used for interactive preview testing when Firebase backend is unprovisioned, with clear transparency
  const simulateAuthForPreview = (name: string, email: string) => {
    const mockUser = {
      uid: 'preview-session-id',
      email,
      displayName: name,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
      providerId: 'password',
    } as unknown as User;

    setUser(mockUser);
    closeAuthModal();

    if (launchPending) {
      setLaunchPending(false);
      executeLiveLaunch();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
        resetPassword,
        logout,
        simulateAuthForPreview,
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
