import { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, getIdTokenResult } from 'firebase/auth';
import { toast } from 'sonner';
import { getFirestore } from 'firebase/firestore';
import { scheduleIdleTask } from '../utils/scheduleIdleTask';

export function useAuth() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [appStatus, setAppStatus] = useState('LOADING_AUTH');

  const firebaseAppRef = useRef(null);

  useEffect(() => {
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseAppRef.current = app;
    const firestoreDb = getFirestore(app);
    const firebaseAuth = getAuth(app);

    setDb(firestoreDb);
    setAuth(firebaseAuth);

    // Defer Analytics (gtag) until the browser is idle
    scheduleIdleTask(() => {
      import('firebase/analytics')
        .then(async ({ getAnalytics, isSupported }) => {
          if (!firebaseAppRef.current) return;
          if (await isSupported()) getAnalytics(firebaseAppRef.current);
        })
        .catch(() => {});
    });

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser) {
        try {
          // Force token refresh to get the latest Custom Claim
          const tokenResult = await getIdTokenResult(currentUser, true);
          setUser(currentUser);
          setIsAllowed(tokenResult.claims.isAllowed === true);
          setAppStatus('LOADING_DATA');
        } catch (error) {
          console.error("Token refresh failed:", error);
          toast.error("Erro de sincronização. Por favor refaça o login.");
          setUser(null);
          setIsAllowed(false);
          setAppStatus('LOGIN');
        }
      } else {
        setUser(null);
        setIsAllowed(false);
        setAppStatus('LOGIN');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!auth) return;
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in with Google:", error);
      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
        const currentDomain = window.location.hostname;
        setAuthError(`This domain (${currentDomain}) is not authorized. Configure in Firebase Console: Authentication → Settings → Authorized domains`);
      } else {
        setAuthError("An error occurred during login. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  return { db, auth, user, authError, isAllowed, appStatus, setAppStatus, handleLogin, handleLogout, firebaseAppRef };
}
