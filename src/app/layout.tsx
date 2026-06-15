'use client';

import './globals.css';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';
import { Building2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        <AppSidebar />
        
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b bg-sidebar px-4 md:hidden text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shadow-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-headline text-lg font-bold tracking-tight">AMBIKA AMS</span>
          </div>
          <SidebarTrigger className="text-white hover:bg-white/10" />
        </header>

        <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [firebaseData, setFirebaseData] = useState<{
    app: FirebaseApp;
    db: Firestore;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    const { firebaseApp, firestore, auth } = initializeFirebase();
    if (firebaseApp && firestore && auth) {
      setFirebaseData({ app: firebaseApp, db: firestore, auth: auth });
    }
  }, []);

  if (!firebaseData) {
    return (
      <html lang="en">
        <body className="font-body antialiased bg-sidebar flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4 text-white">
            <Building2 className="h-12 w-12 animate-pulse" />
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-bold uppercase tracking-widest">Initializing AMBIKA AMS...</span>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
        <title>AMBIKA AMS | Intelligent Asset Management</title>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider 
          firebaseApp={firebaseData.app} 
          firestore={firebaseData.db} 
          auth={firebaseData.auth}
        >
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
