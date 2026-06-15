'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let authInstance: Auth | undefined;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!app) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(app);
      authInstance = getAuth(app);
    }
  }

  return { 
    firebaseApp: app as FirebaseApp, 
    firestore: db as Firestore, 
    auth: authInstance as Auth 
  };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
