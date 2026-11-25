// Firebase Firestore Real-Time Sync
// Config is stored here - replace with your project values after creating Firebase project
// Steps: console.firebase.google.com → New project → Firestore → Web app → copy config below

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  Firestore,
} from "firebase/firestore";

// ─── PASTE YOUR FIREBASE CONFIG HERE ───────────────────────────────────────
// Get it from: Firebase Console → Project Settings → Your apps → SDK setup and configuration
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCkeR6MByk_dJEE71CQOjS5aEaKbj_ujQg",
  authDomain: "sargamela-2026.firebaseapp.com",
  projectId: "sargamela-2026",
  storageBucket: "sargamela-2026.firebasestorage.app",
  messagingSenderId: "416612595742",
  appId: "1:416612595742:web:e72904ef129b684dc3560f"
};
// ───────────────────────────────────────────────────────────────────────────

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.projectId &&
      FIREBASE_CONFIG.projectId !== ""
  );
};

let db: Firestore | null = null;

export const getFirestoreDb = (): Firestore | null => {
  if (!isFirebaseConfigured()) return null;
  if (!db) {
    const app =
      getApps().length === 0
        ? initializeApp(FIREBASE_CONFIG)
        : getApps()[0];
    db = getFirestore(app);
  }
  return db;
};

export interface FirestoreScoreEntry {
  rank: string | null;
  grade: string | null;
  points?: number | null;
}

// Save results map to Firestore (called from QuickScoreDesk)
export const saveResultsToFirestore = async (
  resultsMap: Record<string, FirestoreScoreEntry>
): Promise<void> => {
  const firestore = getFirestoreDb();
  if (!firestore) throw new Error("Firebase not configured");

  await setDoc(doc(firestore, "sargamela2026", "results"), {
    scores: resultsMap,
    updatedAt: new Date().toISOString(),
  });
};

// Subscribe to real-time Firestore results
// Returns unsubscribe function
export const subscribeToFirestoreResults = (
  onUpdate: (
    resultsMap: Record<string, FirestoreScoreEntry>
  ) => void
): (() => void) => {
  const firestore = getFirestoreDb();
  if (!firestore) return () => {};

  const docRef = doc(firestore, "sargamela2026", "results");
  const unsubscribe = onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      onUpdate(data.scores || {});
    }
  });
  return unsubscribe;
};

// One-time fetch (for initial load)
export const fetchResultsFromFirestore = async (): Promise<
  Record<string, FirestoreScoreEntry>
> => {
  const firestore = getFirestoreDb();
  if (!firestore) return {};

  const snap = await getDoc(doc(firestore, "sargamela2026", "results"));
  if (snap.exists()) {
    return snap.data().scores || {};
  }
  return {};
};
