
'use client';

import { useState, useEffect } from 'react';
import { DocumentReference, onSnapshot, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { useAuth } from '../provider';
import { onAuthStateChanged } from 'firebase/auth';

export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = useAuth();

  useEffect(() => {
    if (!auth || !docRef) {
      setLoading(false);
      return;
    }

    let unsubscribe: () => void;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (unsubscribe) unsubscribe();

      setLoading(true);

      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          const docData = snapshot.data();
          setData(docData ? ({ ...docData, id: snapshot.id } as T) : null);
          setLoading(false);
          setError(null);
        },
        async (err: any) => {
          if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: docRef.path,
              operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
          }
          setError(err);
          setLoading(false);
        }
      );
    });

    return () => {
      authUnsubscribe();
      if (unsubscribe) unsubscribe();
    };
  }, [docRef, auth]);

  return { data, loading, error };
}
