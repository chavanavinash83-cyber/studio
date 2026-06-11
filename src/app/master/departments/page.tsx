
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2,
  Search, 
  MapPin,
  Loader2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirestore, useCollection, errorEmitter } from "@/firebase";
import { collection, doc, addDoc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: string;
  name: string;
  branch: string;
}

export default function DepartmentsPage() {
  const { toast } = useToast();
  const db = useFirestore();

  const departmentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "departments"), orderBy("name", "asc"));
  }, [db]);

  const branchesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "branches"), orderBy("name", "asc"));
  }, [db]);

  const { data: departments, loading } = useCollection<Department>(departmentsQuery);
  const { data: branches } = useCollection<any>(branchesQuery);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDept, setCurrentDept] = useState<Partial<Department>>({
    name: "",
    branch: "",
  });

  const filteredDepartments = (departments || []).filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentDept({ name: "", branch: branches?.[0]?.name || "" });
    setIsOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setIsEditing(true);
    setCurrentDept(dept);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    const docRef = doc(db, "departments", id);
    deleteDoc(docRef)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    toast({ title: "Deleted", description: "Department removed successfully." });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentDept.name || !currentDept.branch) return;

    setIsSubmitting(true);
    const deptData = {
      ...currentDept,
      updatedAt: serverTimestamp(),
    };

    if (isEditing && currentDept.id) {
      const docRef = doc(db, "departments", currentDept.id);
      setDoc(docRef, deptData, { merge: true })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'write',
            requestResourceData: deptData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      addDoc(collection(db, "departments"), deptData)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: "departments",
            operation: 'create',
            requestResourceData: deptData,
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
            <Briefcase className="h-8 w-8 text-accent" />
            Departments
          </h1>
          <p className="text-muted-foreground">Organizational departments within specific branch locations.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Department
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Department" : "Add New Department"}</DialogTitle>
              <DialogDescription>
                Define the department name and assign it to a branch.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Department Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Quality Assurance" 
                    value={currentDept.name}
                    onChange={(e) => setCurrentDept({ ...currentDept, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branch">Assigned Branch</Label>
                  <Select 
                    value={currentDept.branch} 
                    onValueChange={(val) => setCurrentDept({ ...currentDept, branch: val })}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map((branch: any) => (
                        <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    isEditing ? "Update Department" : "Save Department"
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
              placeholder="Search by name or branch..." 
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
              <p>Fetching units...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Dept Name</TableHead>
                  <TableHead className="font-bold">Branch Location</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept) => (
                    <TableRow key={dept.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary/60" />
                          {dept.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {dept.branch || "Not Assigned"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-accent/20"
                            onClick={() => handleOpenEdit(dept)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                            onClick={() => handleDelete(dept.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data-departments">
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No departments found.
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
