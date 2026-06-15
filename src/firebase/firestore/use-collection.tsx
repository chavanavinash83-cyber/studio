
'use client';

import { useState, useEffect } from 'react';
import { Query, onSnapshot, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { useAuth } from '../provider';
import { onAuthStateChanged } from 'firebase/auth';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = useAuth();

  useEffect(() => {
    // We use onAuthStateChanged to ensure we only subscribe when we have a stable auth state
    // This prevents "Missing or insufficient permissions" errors on initial load
    if (!auth || !query) {
      setLoading(false);
      return;
    }

    let unsubscribe: () => void;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      // If we have a previous listener, clean it up
      if (unsubscribe) unsubscribe();

      setLoading(true);
      
      unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            ...(doc.data() as any),
            id: doc.id,
          })) as T[];
          setData(docs);
          setLoading(false);
          setError(null);
        },
        async (err: any) => {
          if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: 'collection_query',
              operation: 'list',
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
  }, [query, auth]);

  return { data, loading, error };
}
