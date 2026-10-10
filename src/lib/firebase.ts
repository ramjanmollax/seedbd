import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Initialize Firestore with auto-detected long polling for reliable connectivity in restricted preview/cloud environments
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, dbId);

let authInstance: any = null;
let providerInstance: any = null;

try {
  authInstance = getAuth(app);
  providerInstance = new GoogleAuthProvider();
} catch (e) {
  console.warn('Firebase Auth initialization warning:', e);
}

let storageInstance: any = null;
try {
  storageInstance = getStorage(app);
} catch (e) {
  console.warn('Firebase Storage initialization warning:', e);
}

export const auth = authInstance;
export const googleProvider = providerInstance;
export const storage = storageInstance;

export default app;
