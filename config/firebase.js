// Using ES modules
import adminLib from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const initializeFirebaseAdmin = () => {
  try {
    if (adminLib.apps.length) {
      return adminLib;
    }

    if (process.env.FIREBASE_PROJECT_ID) {
      adminLib.initializeApp({
        credential: adminLib.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ Firebase Admin initialized via environment variables');
    } else {
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve('./serviceAccountKey.json');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

      adminLib.initializeApp({
        credential: adminLib.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized via service account file');
    }

    return adminLib;
  } catch (error) {
    console.error('🔥 Firebase Admin init error:', error);
    throw error;
  }
};

const firebaseAdmin = initializeFirebaseAdmin();

export const admin = firebaseAdmin;
export const auth = firebaseAdmin.auth();
