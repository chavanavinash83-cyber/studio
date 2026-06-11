
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { MapPin, Plus, Search, Building2, Edit2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, errorEmitter } from "@/firebase";
import { collection, doc, addDoc, setDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";

interface Branch {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
}

export default function BranchesPage() {
  const { toast } = useToast();
  const db = useFirestore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Partial<Branch>>({
    name: "",
    code: "",
    type: "",
    location: "",
  });

  const branchesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "branches"), orderBy("name", "asc"));
  }, [db]);

  const { data: branches, loading } = useCollection<Branch>(branchesQuery);

  const filteredBranches = (branches || []).filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentBranch({ name: "", code: "", type: "", location: "" });
    setIsOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setIsEditing(true);
    setCurrentBranch(branch);
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentBranch.name || !currentBranch.code) return;

    setIsSubmitting(true);
    const branchData = {
      ...currentBranch,
      updatedAt: serverTimestamp(),
    };

    if (isEditing && currentBranch.id) {
      const docRef = doc(db, "branches", currentBranch.id);
      setDoc(docRef, branchData, { merge: true })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'write',
            requestResourceData: branchData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      addDoc(collection(db, "branches"), branchData)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: "branches",
            operation: 'create',
            requestResourceData: branchData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }

    toast({ title: "Success", description: "Saved successfully." });
    setIsOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <MapPin className="h-8 w-8 text-accent" />
            Branch Master
          </h1>
          <p className="text-muted-foreground">Manage organizational units and geographical locations.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Branch
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Branch" : "Add New Branch"}</DialogTitle>
              <DialogDescription>Input details for a geographical or organizational node.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Branch Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Pune City Center" 
                    value={currentBranch.name}
                    onChange={(e) => setCurrentBranch({ ...currentBranch, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Branch Code</Label>
                    <Input 
                      id="code" 
                      placeholder="e.g. PCC" 
                      maxLength={3} 
                      value={currentBranch.code}
                      onChange={(e) => setCurrentBranch({ ...currentBranch, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Operational Type</Label>
                    <Input 
                      id="type" 
                      placeholder="e.g. Warehouse" 
                      value={currentBranch.type}
                      onChange={(e) => setCurrentBranch({ ...currentBranch, type: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Address / Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. Sector 12, IT Park" 
                    value={currentBranch.location}
                    onChange={(e) => setCurrentBranch({ ...currentBranch, location: e.target.value })}
                    required
                  />
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
                    isEditing ? "Update Branch" : "Save Branch"
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
              placeholder="Search by branch name or code..." 
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
              <p>Fetching locations...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Details</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary/60" />
                          {branch.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-code">{branch.code}</Badge>
                      </TableCell>
                      <TableCell>{branch.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{branch.location}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-accent/20"
                            onClick={() => handleOpenEdit(branch)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data-branches">
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No branches found.
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
