
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home since login is now disabled
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl mb-2">
          <Building2 className="h-10 w-10 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Redirecting to Dashboard...</span>
        </div>
      </div>
    </div>
  );
}
