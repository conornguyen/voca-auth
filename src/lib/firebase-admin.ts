import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK (singleton)
function ensureInitialized() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

/**
 * Verifies a Firebase ID token and returns the decoded claims.
 */
export async function verifyFirebaseToken(idToken: string) {
  ensureInitialized();
  const decodedToken = await getAuth().verifyIdToken(idToken);
  return {
    uid: decodedToken.uid,
    email: decodedToken.email || '',
  };
}
