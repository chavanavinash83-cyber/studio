'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

/**
 * Centrally listens for Firestore permission and query errors.
 * Surfaces them as toasts with actionable information.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In a real app, you might want to log this to an error reporting service
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: `Insufficient permissions for ${error.context.operation} on ${error.context.path}. Please check your account role.`,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
