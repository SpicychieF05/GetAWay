import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Module-level cache — populated lazily on first browser access
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

/**
 * Returns the Firebase Auth instance.
 * Safe to call inside useEffect / event handlers only — never at module level.
 */
export function getClientAuth(): Auth {
  if (!_auth) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase/auth") as typeof import("firebase/auth");
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

/**
 * Returns the Firestore instance.
 * Safe to call inside useEffect / event handlers only — never at module level.
 */
export function getClientDb(): Firestore {
  if (!_db) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getFirestore } = require("firebase/firestore") as typeof import("firebase/firestore");
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}
