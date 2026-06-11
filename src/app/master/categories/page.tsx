
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tags, Plus, Trash2, Edit2, Calculator, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { MasterCategory } from "@/app/lib/types";

export default function CategoriesPage() {
  const { toast } = useToast();
  const db = useFirestore();
  
  const categoriesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "categories"), orderBy("name", "asc"));
  }, [db]);

  const { data: categories, loading } = useCollection<MasterCategory>(categoriesQuery);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Partial<MasterCategory>>({ 
    name: "", 
    rate: 15, 
    life: "", 
    method: "WDV" 
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormState({ name: "", rate: 15, life: "", method: "WDV" });
    setIsOpen(true);
  };

  const handleOpenEdit = (category: MasterCategory) => {
    setIsEditing(true);
    setFormState(category);
    setIsOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !formState.name) return;

    const categoryData = {
      ...formState,
      updatedAt: serverTimestamp(),
    };

    if (isEditing && formState.id) {
      const docRef = doc(db, "categories", formState.id);
      setDoc(docRef, categoryData, { merge: true })
        .then(() => {
          toast({ title: "Category Updated", description: `${formState.name} settings saved.` });
          setIsOpen(false);
        })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: categoryData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      addDoc(collection(db, "categories"), categoryData)
        .then((docRef) => {
          setDoc(docRef, { id: docRef.id }, { merge: true });
          toast({ title: "Category Created", description: `${formState.name} added to master list.` });
          setIsOpen(false);
        })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: "categories",
            operation: 'create',
            requestResourceData: categoryData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    const docRef = doc(db, "categories", id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Category Deleted", description: "Removed from system." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <Tags className="h-8 w-8 text-accent" />
            Asset Categories
          </h1>
          <p className="text-muted-foreground">Define asset classes and their depreciation schedules.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={handleOpenAdd} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Asset Category" : "Add Asset Category"}</DialogTitle>
              <DialogDescription>
                Data is saved securely to the SampattiPro cloud.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveCategory}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Office Equipment" 
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="method">Depreciation Method</Label>
                  <Select 
                    value={formState.method} 
                    onValueChange={(val: any) => setFormState({ ...formState, method: val })}
                  >
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WDV">Written Down Value (WDV)</SelectItem>
                      <SelectItem value="Straight Line">Straight Line Method</SelectItem>
                      <SelectItem value="Purchase Amount">Purchase Amount (Flat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rate">Depreciation Rate (%)</Label>
                    <Input 
                      id="rate" 
                      type="number"
                      step="0.01"
                      placeholder="e.g. 15" 
                      value={formState.rate}
                      onChange={(e) => setFormState({ ...formState, rate: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="life">Expected Life (Years)</Label>
                    <Input 
                      id="life" 
                      placeholder="e.g. 5" 
                      value={formState.life}
                      onChange={(e) => setFormState({ ...formState, life: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{isEditing ? "Update Category" : "Save Category"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Fetching asset classes...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Category Name</TableHead>
                  <TableHead className="font-bold">Method</TableHead>
                  <TableHead className="font-bold">Rate</TableHead>
                  <TableHead className="font-bold">Expected Life</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold">{cat.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calculator className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{cat.method}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{cat.rate}%</Badge>
                      </TableCell>
                      <TableCell>{cat.life} Years</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-accent/20"
                            onClick={() => handleOpenEdit(cat)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No categories defined yet.
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
