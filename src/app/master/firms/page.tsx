
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Landmark, Plus, Search, Building2, Edit2, Trash2, Loader2, Phone, Mail, User, MapPin } from "lucide-react";
import { useFirestore, useCollection, errorEmitter } from "@/firebase";
import { collection, doc, addDoc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";
import { Firm } from "@/app/lib/types";

export default function FirmsPage() {
  const { toast } = useToast();
  const db = useFirestore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFirm, setCurrentFirm] = useState<Partial<Firm>>({
    name: "",
    registrationNumber: "",
    gstNumber: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
  });

  const firmsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "firms"), orderBy("name", "asc"));
  }, [db]);

  const { data: firms, loading } = useCollection<Firm>(firmsQuery);

  const filteredFirms = (firms || []).filter(f => 
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentFirm({ name: "", registrationNumber: "", gstNumber: "", address: "", contactPerson: "", phone: "", email: "" });
    setIsOpen(true);
  };

  const handleOpenEdit = (firm: Firm) => {
    setIsEditing(true);
    setCurrentFirm(firm);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    const docRef = doc(db, "firms", id);
    deleteDoc(docRef)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    toast({ title: "Deleted", description: "Firm record removed." });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentFirm.name) return;

    setIsSubmitting(true);
    const firmData = {
      ...currentFirm,
      updatedAt: serverTimestamp(),
    };

    if (isEditing && currentFirm.id) {
      const docRef = doc(db, "firms", currentFirm.id);
      setDoc(docRef, firmData, { merge: true })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'write',
            requestResourceData: firmData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      addDoc(collection(db, "firms"), firmData)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: "firms",
            operation: 'create',
            requestResourceData: firmData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }

    toast({ title: "Success", description: "Firm details saved successfully." });
    setIsOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <Landmark className="h-8 w-8 text-accent" />
            Firm Details
          </h1>
          <p className="text-muted-foreground">Manage organizational entities and parent company information.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Firm
          </Button>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Firm" : "Add New Firm"}</DialogTitle>
              <DialogDescription>Input primary details for the firm entity.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Firm Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Ambika Enterprise Pvt Ltd" 
                    value={currentFirm.name}
                    onChange={(e) => setCurrentFirm({ ...currentFirm, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="regNo">Registration Number</Label>
                    <Input 
                      id="regNo" 
                      placeholder="CIN / Reg No" 
                      value={currentFirm.registrationNumber}
                      onChange={(e) => setCurrentFirm({ ...currentFirm, registrationNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gstNo">GST Number</Label>
                    <Input 
                      id="gstNo" 
                      placeholder="GSTIN" 
                      className="font-code"
                      value={currentFirm.gstNumber}
                      onChange={(e) => setCurrentFirm({ ...currentFirm, gstNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact">Contact Person</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="contact" 
                        className="pl-10"
                        placeholder="Name" 
                        value={currentFirm.contactPerson}
                        onChange={(e) => setCurrentFirm({ ...currentFirm, contactPerson: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        className="pl-10"
                        placeholder="Mobile" 
                        value={currentFirm.phone}
                        onChange={(e) => setCurrentFirm({ ...currentFirm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      className="pl-10"
                      placeholder="admin@firm.com" 
                      value={currentFirm.email}
                      onChange={(e) => setCurrentFirm({ ...currentFirm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Registered Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea 
                      id="address" 
                      className="pl-10 min-h-[80px]"
                      placeholder="Full office address..." 
                      value={currentFirm.address}
                      onChange={(e) => setCurrentFirm({ ...currentFirm, address: e.target.value })}
                    />
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
                    isEditing ? "Update Firm" : "Save Firm"
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
              placeholder="Search by firm name or GST..." 
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
              <p>Fetching firms...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firm Details</TableHead>
                  <TableHead>GST / Reg</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFirms.length > 0 ? (
                  filteredFirms.map((firm) => (
                    <TableRow key={firm.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-primary/60" />
                          {firm.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-code bg-secondary/10 px-1 rounded w-fit">{firm.gstNumber || "No GST"}</span>
                          <span className="text-[10px] text-muted-foreground">{firm.registrationNumber || "No Reg No"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs gap-1">
                          <span className="font-bold">{firm.contactPerson || "N/A"}</span>
                          <span className="text-muted-foreground">{firm.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{firm.address}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-accent/20"
                            onClick={() => handleOpenEdit(firm)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                            onClick={() => handleDelete(firm.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data-firms">
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No firms found.
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
