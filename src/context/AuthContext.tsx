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
  validateSignUp,
  validateAdminLogin,
  getRememberedUsername,
  saveRememberedUsername,
  clearRememberedUsername as clearStoredRememberedUsername,
  isLocalDevEnvironment,
} from '../utils/auth-validation';
import {
  checkUsernameAvailability as checkServiceAvailability,
  resolveIdentifierToEmail,
  registerUsernameMapping,
  getUsernameForUid,
} from '../services/username-service';

export const LOCAL_DEV_ADMIN_UID = 'local-dev-admin-uid-01';
export const LOCAL_DEV_ADMIN_EMAIL = 'admin@orion9.local';

/**
 * Synthetic User object for local development & testing admin sessions.
 */
export const LOCAL_DEV_ADMIN_USER: User = {
  uid: LOCAL_DEV_ADMIN_UID,
  email: LOCAL_DEV_ADMIN_EMAIL,
  displayName: 'Local Administrator',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [
    {
      uid: LOCAL_DEV_ADMIN_UID,
      email: LOCAL_DEV_ADMIN_EMAIL,
      displayName: 'Local Administrator',
      photoURL: null,
      providerId: 'password',
      phoneNumber: null,
    },
  ],
  refreshToken: 'local-dev-refresh-token',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-local-dev-admin-token',
  getIdTokenResult: async () => ({
    token: 'mock-local-dev-admin-token',
    signInProvider: 'password',
    signInSecondFactor: null,
    claims: { admin: true, role: 'admin' },
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
  }),
  reload: async () => {},
  toJSON: () => ({ uid: LOCAL_DEV_ADMIN_UID }),
  phoneNumber: null,
  photoURL: null,
  providerId: 'firebase',
};

interface AuthContextType {
  user: User | null;
  username: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminAuthSource: string;
  isLocalDevAdmin: boolean;
  loading: boolean;
  isFirebaseConfigured: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot';
  launchPending: boolean;
  isTransitioning: boolean;
  transitionMessage: string | null;
  crossAppStatus: CrossAppAuthStatus;
  destinationUrl: string;
  rememberedUsername: string | null;
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  launchOrion: (customTargetUrl?: string) => void;
  login: (
    identifier: string,
    pass: string,
    remember?: boolean
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (
    name: string,
    usernameOrEmail: string,
    emailOrPass: string,
    pass?: string,
    termsAccepted?: boolean
  ) => Promise<{ success: boolean; error?: string; verificationSent?: boolean }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; user?: User }>;
  resetPassword: (identifier: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  refreshAdminStatus: (targetUser?: User | null) => Promise<boolean>;
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean; error?: string }>;
  clearRememberedUsername: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function mapFirebaseAuthError(err: unknown, fallback: string): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid username/email or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid work email address.';
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
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminAuthSource, setAdminAuthSource] = useState<string>('none');
  const [isLocalDevAdmin, setIsLocalDevAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [launchPending, setLaunchPending] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [rememberedUsername, setRememberedUsernameState] = useState<string | null>(() =>
    getRememberedUsername()
  );

  const crossAppStatus = useMemo(() => evaluateCrossAppAuth(), []);
  const resolved = useMemo(() => resolveLaunchUrl(), []);
  const destinationUrl = resolved.url;

  const checkAdmin = useCallback(async (targetUser: User | null): Promise<boolean> => {
    if (!targetUser) {
      setIsAdmin(false);
      setAdminAuthSource('none');
      setIsLocalDevAdmin(false);
      return false;
    }

    if (targetUser.uid === LOCAL_DEV_ADMIN_UID) {
      setIsAdmin(true);
      setAdminAuthSource('local_dev');
      setIsLocalDevAdmin(true);
      return true;
    }

    const res = await verifyAdminAuthorization(targetUser);
    setIsAdmin(res.isAdmin);
    setAdminAuthSource(res.source);
    setIsLocalDevAdmin(false);
    return res.isAdmin;
  }, []);

  useEffect(() => {
    // Check if an admin session was previously initiated in this browser session
    if (typeof window !== 'undefined') {
      try {
        const savedDevAdmin = window.sessionStorage.getItem('orion_local_dev_admin');
        if (savedDevAdmin === 'true') {
          const savedEmail = window.sessionStorage.getItem('orion_admin_email') || 'admin@orion';
          const masterAdminUser: User = {
            ...LOCAL_DEV_ADMIN_USER,
            email: savedEmail,
            displayName: 'Master Administrator',
          };
          setUser(masterAdminUser);
          setUsername('admin');
          setIsAdmin(true);
          setAdminAuthSource('master_admin');
          setIsLocalDevAdmin(true);
          setLoading(false);
          return;
        }
      } catch {
        // Ignore sessionStorage restrictions
      }
    }

    const { auth, isConfigured } = initializeFirebase();
    setIsFirebaseConfigured(isConfigured);

    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const userUname = await getUsernameForUid(currentUser.uid);
          setUsername(userUname);
        } else {
          setUsername(null);
        }
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
      setTransitionMessage('Connecting to Orion-9 OS at ' + safeTarget);

      setTimeout(() => {
        window.location.href = safeTarget;
      }, 1100);
    },
    [destinationUrl]
  );

  const launchOrion = useCallback(
    (customTargetUrl?: string) => {
      if (!user) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }
      executeLiveLaunch(customTargetUrl);
    },
    [user, executeLiveLaunch]
  );

  const clearRememberedUsername = useCallback(() => {
    clearStoredRememberedUsername();
    setRememberedUsernameState(null);
  }, []);

  const checkUsernameAvailability = useCallback(async (uname: string) => {
    const res = await checkServiceAvailability(uname);
    return { available: res.available, error: res.error };
  }, []);

  const login = async (
    identifier: string,
    pass: string,
    remember = true
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    if (!identifier || !identifier.trim() || !pass) {
      return {
        success: false,
        error: 'Please enter both your username or email address and password.',
      };
    }

    // 1. Evaluate Administrator credentials & hard-fixed admin bypass (admin@orion / admin)
    const adminCheck = validateAdminLogin(identifier, pass);
    if (adminCheck.isLocalDevAttempt || adminCheck.isHardcodedAdmin) {
      if (adminCheck.allowedInCurrentEnv) {
        const adminEmail = identifier.trim().toLowerCase();
        const masterAdminUser: User = {
          ...LOCAL_DEV_ADMIN_USER,
          email: adminEmail,
          displayName: 'Master Administrator',
        };
        setUser(masterAdminUser);
        setUsername('admin');
        setIsAdmin(true);
        setAdminAuthSource('master_admin');
        setIsLocalDevAdmin(true);

        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem('orion_local_dev_admin', 'true');
            window.sessionStorage.setItem('orion_admin_email', adminEmail);
          } catch {
            // Ignore sessionStorage failure
          }
        }

        if (remember) {
          saveRememberedUsername(identifier.trim());
          setRememberedUsernameState(identifier.trim());
        }

        closeAuthModal();

        if (launchPending) {
          setLaunchPending(false);
          executeLiveLaunch();
        }

        return { success: true, user: masterAdminUser };
      } else {
        return {
          success: false,
          error: adminCheck.error || 'Unauthorized administrator credentials.',
        };
      }
    }

    // 2. Normal Firebase Authentication
    const { auth, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error:
          'Firebase Authentication is not configured in this environment. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment configuration.',
      };
    }

    try {
      // Resolve identifier (username or email) to real Firebase email
      const resolution = await resolveIdentifierToEmail(identifier.trim());
      const emailToAuth = resolution.email;

      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, emailToAuth, pass);

      setUser(cred.user);
      if (resolution.isUsername && resolution.normalizedUsername) {
        setUsername(resolution.normalizedUsername);
      } else if (cred.user) {
        const u = await getUsernameForUid(cred.user.uid);
        setUsername(u);
      }

      await checkAdmin(cred.user);

      // Handle remembered username
      if (remember) {
        saveRememberedUsername(identifier.trim());
        setRememberedUsernameState(identifier.trim());
      } else {
        clearRememberedUsername();
      }

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
    usernameOrEmail: string,
    emailOrPass: string,
    pass?: string,
    termsAccepted = true
  ): Promise<{ success: boolean; error?: string; verificationSent?: boolean }> => {
    // Overload resolution:
    // If pass is omitted, signature is (name, email, pass)
    // If pass is provided, signature is (name, username, email, pass)
    let actualUsername = '';
    let actualEmail = '';
    let actualPass = '';

    if (pass !== undefined) {
      actualUsername = usernameOrEmail;
      actualEmail = emailOrPass;
      actualPass = pass;
    } else {
      actualUsername = usernameOrEmail.split('@')[0] || 'user';
      actualEmail = usernameOrEmail;
      actualPass = emailOrPass;
    }

    // Validate inputs
    const validation = validateSignUp(
      name,
      actualUsername,
      actualEmail,
      actualPass,
      actualPass,
      termsAccepted
    );
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError || 'Please check your registration details.' };
    }

    // Check username availability
    const avail = await checkUsernameAvailability(actualUsername);
    if (!avail.available) {
      return { success: false, error: avail.error || 'Username is unavailable.' };
    }

    const { auth, db, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error:
          'Firebase Authentication is not configured in this environment. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment configuration.',
      };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, actualEmail.trim(), actualPass);
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

      if (cred.user) {
        try {
          await registerUsernameMapping(
            cred.user.uid,
            actualUsername,
            actualEmail,
            name
          );
        } catch {
          // If offline, fallback to basic user doc
          if (db) {
            try {
              await setDoc(
                doc(db, 'users', cred.user.uid),
                {
                  uid: cred.user.uid,
                  username: actualUsername,
                  displayName: name.trim(),
                  email: actualEmail.trim().toLowerCase(),
                  role: 'operator',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            } catch {
              // Non-fatal
            }
          }
        }
      }

      // Automatically remember username for convenience
      saveRememberedUsername(actualUsername);
      setRememberedUsernameState(actualUsername);

      setUser(cred.user);
      setUsername(actualUsername);
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

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string; user?: User }> => {
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

      return { success: true, user: cred.user };
    } catch (err: unknown) {
      return {
        success: false,
        error: mapFirebaseAuthError(err, 'Google sign-in could not be completed.'),
      };
    }
  };

  const resetPassword = async (
    identifier: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const { auth, isConfigured } = initializeFirebase();
    if (!isConfigured || !auth) {
      return {
        success: false,
        error:
          'Password reset requires an active Firebase Authentication configuration (VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID).',
      };
    }

    if (!identifier || !identifier.trim()) {
      return {
        success: false,
        error: 'Please enter your username or email address.',
      };
    }

    try {
      let emailToSend = '';
      if (identifier.includes('@')) {
        emailToSend = identifier.trim();
      } else {
        try {
          const res = await resolveIdentifierToEmail(identifier.trim());
          emailToSend = res.email;
        } catch {
          // ANTI-ENUMERATION: Even if username was not resolved, return success message
          return {
            success: true,
            message:
              'If an account is associated with that username or email address, password recovery instructions have been sent.',
          };
        }
      }

      await sendPasswordResetEmail(auth, emailToSend);
      return {
        success: true,
        message:
          'If an account is associated with that username or email address, password recovery instructions have been sent.',
      };
    } catch (err: unknown) {
      // Also return generic confirmation if user-not-found to prevent email enumeration
      const code = (err as { code?: string })?.code;
      if (code === 'auth/user-not-found') {
        return {
          success: true,
          message:
            'If an account is associated with that username or email address, password recovery instructions have been sent.',
        };
      }
      return {
        success: false,
        error: mapFirebaseAuthError(err, 'Failed to send password reset email.'),
      };
    }
  };

  const logout = async (): Promise<void> => {
    if (isLocalDevAdmin) {
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.removeItem('orion_local_dev_admin');
        } catch {
          // Ignore
        }
      }
      setUser(null);
      setUsername(null);
      setIsAdmin(false);
      setAdminAuthSource('none');
      setIsLocalDevAdmin(false);
      return;
    }

    const { auth, isConfigured } = initializeFirebase();
    if (isConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    setUsername(null);
    setIsAdmin(false);
    setAdminAuthSource('none');
    setIsLocalDevAdmin(false);
  };

  const refreshAdminStatus = async (targetUser?: User | null): Promise<boolean> => {
    if (typeof window !== 'undefined') {
      try {
        if (window.sessionStorage.getItem('orion_local_dev_admin') === 'true') {
          setIsAdmin(true);
          setAdminAuthSource('master_admin');
          setIsLocalDevAdmin(true);
          return true;
        }
      } catch {
        // Ignore sessionStorage read failure
      }
    }

    if (isLocalDevAdmin) {
      return true;
    }
    const { auth, isConfigured } = initializeFirebase();
    setIsFirebaseConfigured(isConfigured);
    const candidateUser = targetUser !== undefined ? targetUser : (auth?.currentUser || user);
    return checkAdmin(candidateUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        username,
        isAuthenticated: Boolean(user),
        isAdmin,
        adminAuthSource,
        isLocalDevAdmin,
        loading,
        isFirebaseConfigured,
        authModalOpen,
        authModalMode,
        launchPending,
        isTransitioning,
        transitionMessage,
        crossAppStatus,
        destinationUrl,
        rememberedUsername,
        openAuthModal,
        closeAuthModal,
        launchOrion,
        login,
        signup,
        loginWithGoogle,
        resetPassword,
        logout,
        refreshAdminStatus,
        checkUsernameAvailability,
        clearRememberedUsername,
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
