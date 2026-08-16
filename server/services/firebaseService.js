import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from '../config/env.js';

let firebaseApp;

const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;
  const serviceAccountPath = resolve(process.cwd(), config.firebaseServiceAccountPath);
  const fileCredentials = existsSync(serviceAccountPath) ? JSON.parse(readFileSync(serviceAccountPath, 'utf8')) : null;
  const projectId = fileCredentials?.project_id || config.firebaseProjectId;
  const clientEmail = fileCredentials?.client_email || config.firebaseClientEmail;
  const privateKey = fileCredentials?.private_key || config.firebasePrivateKey;
  const storageBucket = config.firebaseStorageBucket || `${projectId}.firebasestorage.app`;
  if (!projectId || !clientEmail || !privateKey) {
    const error = new Error('Firebase is not configured. Add the Firebase service-account values to server/.env.');
    error.statusCode = 503;
    throw error;
  }
  firebaseApp = getApps()[0] || initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    ...(storageBucket ? { storageBucket } : {})
  });
  return firebaseApp;
};

export const firebaseDb = () => getFirestore(getFirebaseApp());
export const firebaseAuth = () => getAuth(getFirebaseApp());
export const firebaseBucket = () => getStorage(getFirebaseApp()).bucket();

export const uploadToFirebase = async ({ buffer, mimeType, folder, userId, fileName = randomUUID() }) => {
  const path = `${folder}/${userId}/${fileName}`;
  const file = firebaseBucket().file(path);
  await file.save(buffer, { resumable: false, metadata: { contentType: mimeType, metadata: { userId, folder } } });
  const [url] = await file.getSignedUrl({ action: 'read', expires: '01-01-2500' });
  return { path, url };
};

export const createUser = async ({ name, email, password }) => {
  const db = firebaseDb();
  const existing = await db.collection('users').where('email', '==', email).limit(1).get();
  if (!existing.empty) return null;
  const ref = db.collection('users').doc();
  await ref.set({ name, email, password, dailyCalorieGoal: 2000, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  return { id: ref.id, name, email };
};

export const findUserByEmail = async (email) => {
  const snapshot = await firebaseDb().collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

export const saveScan = async ({ userId, analysis }) => {
  const ref = firebaseDb().collection('scans').doc(analysis.scanId);
  await ref.set({ userId, ...analysis, createdAt: FieldValue.serverTimestamp() });
  return ref.id;
};

export const saveMeal = async ({ userId, scanId }) => {
  const scanRef = firebaseDb().collection('scans').doc(scanId);
  const scanSnapshot = await scanRef.get();
  if (!scanSnapshot.exists || scanSnapshot.data().userId !== userId) return null;
  const scan = scanSnapshot.data();
  const ref = firebaseDb().collection('meals').doc();
  await ref.set({ ...scan, userId, scanId, createdAt: FieldValue.serverTimestamp(), savedAt: FieldValue.serverTimestamp() });
  return { id: ref.id, ...scan, createdAt: new Date().toISOString() };
};

export const listMeals = async (userId) => {
  const snapshot = await firebaseDb().collection('meals').where('userId', '==', userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null })).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
};
