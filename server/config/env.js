import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_dev_key',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  maxImageBytes: Number(process.env.MAX_IMAGE_BYTES) || 10 * 1024 * 1024,
  allowDemoAuth: process.env.NODE_ENV !== 'production',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'firebase-service-account.json',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  firebasePrivateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || ''
};
