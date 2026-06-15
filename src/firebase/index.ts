'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let authInstance: Auth | undefined;

/**
 * Initializes Firebase services as singletons on the client side.
 */
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!app) {
      try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
        authInstance = getAuth(app);
      } catch (error) {
        console.error("Firebase initialization failed", error);
      }
    }
  }

  return { 
    firebaseApp: app, 
    firestore: db, 
    auth: authInstance 
  };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
