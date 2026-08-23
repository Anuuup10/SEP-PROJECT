import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, inMemoryPersistence, setPersistence, signInWithPopup } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const identityToolkitUrl = 'https://identitytoolkit.googleapis.com/v1/accounts';

const firebaseConfig = {
  apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const getFirebaseAuth = () => getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig));

const requestAuth = async (operation, payload) => {
  if (!apiKey) throw new Error('Firebase web authentication is not configured');
  const response = await fetch(`${identityToolkitUrl}:${operation}?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, returnSecureToken: true })
  });
  const body = await response.json();
  if (!response.ok) {
    const code = body.error?.message || 'AUTHENTICATION_FAILED';
    const messages = { EMAIL_EXISTS: 'An account with this email already exists.', INVALID_LOGIN_CREDENTIALS: 'Invalid email or password.', INVALID_PASSWORD: 'Password must be at least 6 characters.' };
    throw new Error(messages[code] || 'Firebase authentication failed');
  }
  return { token: body.idToken, user: { id: body.localId, name: body.displayName || body.email.split('@')[0], email: body.email } };
};

export const firebaseSignIn = (email, password) => requestAuth('signInWithPassword', { email, password });
export const firebaseSignUp = (email, password, displayName) => requestAuth('signUp', { email, password, displayName });

export const firebaseSignInWithGoogle = async () => {
  if (!apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error('Firebase web authentication is not configured');
  }

  const auth = getFirebaseAuth();
  await setPersistence(auth, inMemoryPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const firebaseUser = result.user;
  return {
    token: await firebaseUser.getIdToken(),
    user: {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email: firebaseUser.email,
    },
  };
};
