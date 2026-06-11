
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Plus, 
  Shield, 
  UserCircle, 
  MapPin, 
  Trash2, 
  Edit2, 
  Mail, 
  Search,
  Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, errorEmitter } from "@/firebase";
import { collection, doc, addDoc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  access: string;
}

export default function UsersPage() {
  const { toast } = useToast();
  const db = useFirestore();

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("name", "asc"));
  }, [db]);

  const { data: users, loading } = useCollection<UserProfile>(usersQuery);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<UserProfile>>({
    name: "",
    email: "",
    role: "Branch Manager",
    access: "All Branches",
  });

  const filteredUsers = (users || []).filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentUser({ name: "", email: "", role: "Branch Manager", access: "All Branches" });
    setIsOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setIsEditing(true);
    setCurrentUser(user);
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser.name || !currentUser.email) return;

    setIsSubmitting(true);
    const userData = {
      ...currentUser,
      updatedAt: serverTimestamp(),
    };

    if (isEditing && currentUser.id) {
      const docRef = doc(db, "users", currentUser.id);
      setDoc(docRef, userData, { merge: true })
        .then(() => {
          toast({ title: "Success", description: "Saved successfully." });
          setIsOpen(false);
          setIsSubmitting(false);
        })
        .catch(async (error) => {
          setIsSubmitting(false);
          toast({ variant: "destructive", title: "Failed", description: "Failed to save data." });
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      addDoc(collection(db, "users"), userData)
        .then(() => {
          toast({ title: "Success", description: "Saved successfully." });
          setIsOpen(false);
          setIsSubmitting(false);
        })
        .catch(async (error) => {
          setIsSubmitting(false);
          toast({ variant: "destructive", title: "Failed", description: "Failed to save data." });
          const permissionError = new FirestorePermissionError({
            path: "users",
            operation: 'create',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    const docRef = doc(db, "users", id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Success", description: "User deleted successfully." });
      })
      .catch(async (error) => {
        toast({ variant: "destructive", title: "Failed", description: "Failed to delete user." });
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <Users className="h-8 w-8 text-accent" />
            System Users
          </h1>
          <p className="text-muted-foreground">Manage administrative access and branch permissions.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add User
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                Configure user profile and their branch-level access permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      className="pl-10"
                      placeholder="e.g. John Doe" 
                      value={currentUser.name}
                      onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      className="pl-10"
                      placeholder="e.g. john@example.com" 
                      value={currentUser.email}
                      onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">System Role</Label>
                    <Select 
                      value={currentUser.role} 
                      onValueChange={(val) => setCurrentUser({ ...currentUser, role: val })}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Branch Manager">Branch Manager</SelectItem>
                        <SelectItem value="Auditor">Auditor</SelectItem>
                        <SelectItem value="IT Admin">IT Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="access">Branch Access</Label>
                    <Select 
                      value={currentUser.access} 
                      onValueChange={(val) => setCurrentUser({ ...currentUser, access: val })}
                    >
                      <SelectTrigger id="access">
                        <SelectValue placeholder="Select Access" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Branches">All Branches</SelectItem>
                        <SelectItem value="Khodad">Khodad</SelectItem>
                        <SelectItem value="Manjarwadi">Manjarwadi</SelectItem>
                        <SelectItem value="Sultanpur">Sultanpur</SelectItem>
                        <SelectItem value="Ghodegaon">Ghodegaon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    isEditing ? "Update User" : "Save User"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Fetching team...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">User Details</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Branch Access</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-primary/10 shadow-sm">
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{user.name}</span>
                            <span className="text-[11px] text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "Super Admin" ? "default" : "secondary"} className="gap-1">
                          <Shield className="h-3 w-3" /> {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <MapPin className="h-3 w-3 text-accent" />
                          {user.access}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-accent/20"
                            onClick={() => handleOpenEdit(user)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data">
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
