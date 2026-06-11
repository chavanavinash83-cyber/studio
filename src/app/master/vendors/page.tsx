
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Store, 
  Plus, 
  Edit2, 
  Trash2,
  Phone, 
  Mail, 
  User, 
  MapPin, 
  FileText, 
  Search,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useCollection, errorEmitter } from "@/firebase";
import { collection, doc, addDoc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
}

export default function VendorsPage() {
  const { toast } = useToast();
  const db = useFirestore();

  const vendorsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "vendors"), orderBy("name", "asc"));
  }, [db]);

  const { data: vendors, loading } = useCollection<Vendor>(vendorsQuery);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Partial<Vendor>>({
    name: "",
    category: "",
    contactPerson: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
  });

  const filteredVendors = (vendors || []).filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentVendor({
      name: "",
      category: "",
      contactPerson: "",
      phone: "",
      email: "",
      gstNumber: "",
      address: "",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setIsEditing(true);
    setCurrentVendor(vendor);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    const docRef = doc(db, "vendors", id);
    deleteDoc(docRef)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    toast({ title: "Deleted", description: "Vendor removed successfully." });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentVendor.name) return;

    setIsSubmitting(true);
    const vendorData = {
      ...currentVendor,
      updatedAt: serverTimestamp(),
    };

    if (isEditing && currentVendor.id) {
      const docRef = doc(db, "vendors", currentVendor.id);
      setDoc(docRef, vendorData, { merge: true })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'write',
            requestResourceData: vendorData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      addDoc(collection(db, "vendors"), vendorData)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: "vendors",
            operation: 'create',
            requestResourceData: vendorData,
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
            <Store className="h-8 w-8 text-accent" />
            Vendors & Suppliers
          </h1>
          <p className="text-muted-foreground">Manage procurement partners and service providers.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Vendor
          </Button>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
              <DialogDescription>
                Enter the vendor's professional details and contact information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Vendor Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Acme Corp" 
                      value={currentVendor.name}
                      onChange={(e) => setCurrentVendor({ ...currentVendor, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category" 
                      placeholder="e.g. IT Equipment" 
                      value={currentVendor.category}
                      onChange={(e) => setCurrentVendor({ ...currentVendor, category: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="contactPerson" 
                        className="pl-10"
                        placeholder="Full Name" 
                        value={currentVendor.contactPerson}
                        onChange={(e) => setCurrentVendor({ ...currentVendor, contactPerson: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="gstNumber" 
                        className="pl-10 font-code"
                        placeholder="15-digit GSTIN" 
                        value={currentVendor.gstNumber}
                        onChange={(e) => setCurrentVendor({ ...currentVendor, gstNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        className="pl-10"
                        placeholder="+91 XXXXX XXXXX" 
                        value={currentVendor.phone}
                        onChange={(e) => setCurrentVendor({ ...currentVendor, phone: e.target.value })}
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
                        placeholder="vendor@example.com" 
                        value={currentVendor.email}
                        onChange={(e) => setCurrentVendor({ ...currentVendor, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Registered Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea 
                      id="address" 
                      className="pl-10 min-h-[80px]"
                      placeholder="Full office or warehouse address..." 
                      value={currentVendor.address}
                      onChange={(e) => setCurrentVendor({ ...currentVendor, address: e.target.value })}
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
                    isEditing ? "Update Vendor" : "Save Vendor"
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
              placeholder="Search by vendor name, GST, or contact person..." 
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
              <p>Fetching vendors...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Vendor & GST</TableHead>
                  <TableHead className="font-bold">Contact Person</TableHead>
                  <TableHead className="font-bold">Contact Details</TableHead>
                  <TableHead className="font-bold">Address</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{vendor.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{vendor.category}</span>
                          <span className="text-[10px] font-code bg-secondary/10 text-secondary w-fit px-1 mt-1 rounded">
                            {vendor.gstNumber || "No GST"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {vendor.contactPerson || "Not Assigned"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {vendor.phone || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {vendor.email || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1 max-w-[200px]">
                          <MapPin className="h-3 w-3 mt-1 shrink-0 text-muted-foreground" />
                          <span className="text-xs line-clamp-2">{vendor.address || "No Address"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-accent/20"
                            onClick={() => handleOpenEdit(vendor)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                            onClick={() => handleDelete(vendor.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data-vendors">
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No vendors found.
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
