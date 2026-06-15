
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Loader2, LogIn, UserPlus, Mail, Lock, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back!", description: "Successfully signed in to AMBIKA AMS." });
      router.push('/');
    } catch (error: any) {
      console.error("Login Error:", error);
      let message = error.message || "Invalid credentials provided.";
      
      if (error.code === 'auth/configuration-not-found') {
        message = "Firebase configuration is missing. Please ensure you have added your API keys to the App Hosting Environment Variables.";
      } else if (error.code === 'auth/invalid-credential') {
        message = "Incorrect email or password. Please try again.";
      } else if (error.code === 'auth/user-not-found') {
        message = "No account found with this email.";
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Sync with System Users Firestore collection
      const userRef = doc(db, 'users', email.toLowerCase().trim());
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: email.toLowerCase().trim(),
        name: name,
        role: 'Branch Manager', // Default role for self-registered users
        access: 'All Branches',
        createdAt: serverTimestamp(),
      });

      toast({ title: "Account created", description: "Your AMBIKA AMS account is ready." });
      router.push('/');
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Could not create account.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-[450px] space-y-6">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl mb-2">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">AMBIKA AMS</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Intelligent Asset Management</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-white/50 border shadow-sm">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="shadow-2xl border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access the enterprise portal.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-email" 
                        type="email" 
                        className="pl-10"
                        placeholder="admin@ambika.ams" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-password" 
                        type="password" 
                        className="pl-10"
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full font-bold h-11" disabled={isLoading} type="submit">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                    Log In to System
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="shadow-2xl border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>New Registration</CardTitle>
                <CardDescription>Register as a new system user for your branch.</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="reg-name" 
                        className="pl-10"
                        placeholder="John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="reg-email" 
                        type="email" 
                        className="pl-10"
                        placeholder="user@ambika.ams" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Create Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="reg-password" 
                        type="password" 
                        className="pl-10"
                        placeholder="Minimum 8 characters" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        minLength={8}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full font-bold h-11 bg-accent hover:bg-accent/90" disabled={isLoading} type="submit">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Register User Profile
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          Authorized Personnel Only • IP: IND-WEST-1-NODE
        </p>
      </div>
    </div>
  );
}
