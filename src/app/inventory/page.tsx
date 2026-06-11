
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Asset, AssetCategory, AssetStatus, BranchLocation } from "../lib/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Search, Filter, Plus, Edit2, Trash2, CalendarIcon, Package, Truck, Building2, HardDrive, FileText, Image as ImageIcon, Info, CheckCircle, Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { addMonths, format, parseISO, isValid } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, errorEmitter } from "@/firebase";
import { collection, doc, addDoc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";

export default function InventoryPage() {
  const { toast } = useToast();
  const db = useFirestore();
  
  const assetsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "assets"), orderBy("name", "asc"));
  }, [db]);

  const { data: assets, loading } = useCollection<Asset>(assetsQuery);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  const [currentAsset, setCurrentAsset] = useState<Partial<Asset>>({
    name: "",
    model: "",
    serialNumber: "",
    category: "IT Equipment",
    location: "Khodad",
    department: "Administration",
    status: "Active",
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    installationDate: format(new Date(), 'yyyy-MM-dd'),
    purchaseValue: 0,
    currentBookValue: 0,
    depreciationRate: 15,
    warrantyPeriodMonths: 12,
    warrantyExpiry: "",
    vendorName: "",
    assetPhotoUrl: "",
    invoiceUrl: "",
  });

  useEffect(() => {
    if (currentAsset.installationDate && currentAsset.warrantyPeriodMonths !== undefined) {
      const iDate = parseISO(currentAsset.installationDate);
      if (isValid(iDate)) {
        const expiryDate = addMonths(iDate, currentAsset.warrantyPeriodMonths);
        setCurrentAsset(prev => ({ ...prev, warrantyExpiry: format(expiryDate, 'yyyy-MM-dd') }));
      }
    }
  }, [currentAsset.installationDate, currentAsset.warrantyPeriodMonths]);

  const filteredAssets = (assets || []).filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentAsset({
      name: "",
      model: "",
      serialNumber: "",
      category: "IT Equipment",
      location: "Khodad",
      department: "Administration",
      status: "Active",
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      installationDate: format(new Date(), 'yyyy-MM-dd'),
      purchaseValue: 0,
      currentBookValue: 0,
      depreciationRate: 15,
      warrantyPeriodMonths: 12,
      warrantyExpiry: "",
      vendorName: "",
      assetPhotoUrl: "",
      invoiceUrl: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setIsEditing(true);
    setCurrentAsset(asset);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    const docRef = doc(db, "assets", id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Asset Deleted", description: "Removed from system." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'invoice') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'photo') {
          setCurrentAsset(prev => ({ ...prev, assetPhotoUrl: base64String }));
          toast({ title: "Photo Attached", description: file.name });
        } else {
          setCurrentAsset(prev => ({ ...prev, invoiceUrl: base64String }));
          toast({ title: "Invoice Attached", description: file.name });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentAsset.name || !currentAsset.serialNumber) return;

    const assetData = {
      ...currentAsset,
      updatedAt: serverTimestamp(),
    };

    if (isEditing && currentAsset.id) {
      const docRef = doc(db, "assets", currentAsset.id);
      setDoc(docRef, assetData, { merge: true })
        .then(() => {
          toast({ title: "Asset Updated", description: `${currentAsset.name} has been updated.` });
          setIsDialogOpen(false);
        })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: assetData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      addDoc(collection(db, "assets"), assetData)
        .then((docRef) => {
          // We can optionally set the generated ID into the document itself if needed
          setDoc(docRef, { id: docRef.id }, { merge: true });
          toast({ title: "Asset Registered", description: `${currentAsset.name} added to inventory.` });
          setIsDialogOpen(false);
        })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: "assets",
            operation: 'create',
            requestResourceData: assetData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'Under Repair': return <Badge variant="destructive">Under Repair</Badge>;
      case 'In Warehouse': return <Badge variant="secondary">In Warehouse</Badge>;
      case 'Disposed': return <Badge variant="outline">Disposed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Buildings': return <Building2 className="h-4 w-4" />;
      case 'Vehicles': return <Truck className="h-4 w-4" />;
      case 'IT Equipment': return <HardDrive className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Asset Inventory</h1>
          <p className="text-muted-foreground">Real-time cloud management for enterprise hardware and real estate.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={handleOpenAdd} className="bg-accent text-white hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" /> Add New Asset
          </Button>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Asset" : "Register New Asset"}</DialogTitle>
              <DialogDescription>
                Data is saved securely to the SampattiPro cloud.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="name">Asset Name</Label>
                  <Input 
                    id="name" 
                    value={currentAsset.name} 
                    onChange={e => setCurrentAsset({...currentAsset, name: e.target.value})}
                    placeholder="e.g. Dell XPS 15" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model / Variant</Label>
                  <Input 
                    id="model" 
                    value={currentAsset.model} 
                    onChange={e => setCurrentAsset({...currentAsset, model: e.target.value})}
                    placeholder="e.g. 2024 Edition" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial">Serial Number / Tag</Label>
                  <Input 
                    id="serial" 
                    value={currentAsset.serialNumber} 
                    onChange={e => setCurrentAsset({...currentAsset, serialNumber: e.target.value})}
                    placeholder="e.g. SN-99210-X" 
                    className="font-code uppercase"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={currentAsset.category} 
                    onValueChange={v => setCurrentAsset({...currentAsset, category: v as AssetCategory})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buildings">Buildings</SelectItem>
                      <SelectItem value="Building Lands">Building Lands</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="Electronics Machinery">Machinery</SelectItem>
                      <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={currentAsset.status} 
                    onValueChange={v => setCurrentAsset({...currentAsset, status: v as AssetStatus})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="In Warehouse">In Warehouse</SelectItem>
                      <SelectItem value="Under Repair">Under Repair</SelectItem>
                      <SelectItem value="Disposed">Disposed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Branch Location</Label>
                  <Select 
                    value={currentAsset.location} 
                    onValueChange={v => setCurrentAsset({...currentAsset, location: v as BranchLocation})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Khodad">Khodad</SelectItem>
                      <SelectItem value="Manjarwadi">Manjarwadi</SelectItem>
                      <SelectItem value="Sultanpur">Sultanpur</SelectItem>
                      <SelectItem value="Ghodegaon">Ghodegaon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept">Department</Label>
                  <Input 
                    id="dept" 
                    value={currentAsset.department} 
                    onChange={e => setCurrentAsset({...currentAsset, department: e.target.value})}
                    placeholder="e.g. IT Operations" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor / Supplier</Label>
                  <Input 
                    id="vendor" 
                    value={currentAsset.vendorName} 
                    onChange={e => setCurrentAsset({...currentAsset, vendorName: e.target.value})}
                    placeholder="e.g. Dell Enterprise" 
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-primary">
                  <CalendarIcon className="h-4 w-4" />
                  Procurement & Warranty
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pdate">Purchase Date</Label>
                    <Input 
                      id="pdate" 
                      type="date" 
                      value={currentAsset.purchaseDate} 
                      onChange={e => setCurrentAsset({...currentAsset, purchaseDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idate">Installation Date</Label>
                    <Input 
                      id="idate" 
                      type="date" 
                      value={currentAsset.installationDate} 
                      onChange={e => setCurrentAsset({...currentAsset, installationDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wperiod">Warranty (Months)</Label>
                    <Input 
                      id="wperiod" 
                      type="number" 
                      value={currentAsset.warrantyPeriodMonths} 
                      onChange={e => setCurrentAsset({...currentAsset, warrantyPeriodMonths: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wexpiry">Warranty Expiry</Label>
                    <div className="relative">
                      <Input 
                        id="wexpiry" 
                        type="date" 
                        readOnly 
                        className="bg-muted cursor-not-allowed"
                        value={currentAsset.warrantyExpiry} 
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>Calculated from Installation Date</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-primary">
                  <FileText className="h-4 w-4" />
                  Assets & Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Asset Photo</Label>
                    <div 
                      onClick={() => photoInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer group h-[120px]"
                    >
                      {currentAsset.assetPhotoUrl ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="h-8 w-8 text-green-500 mb-1" />
                          <span className="text-xs font-bold text-green-600">Photo Attached</span>
                          <span className="text-[10px] mt-1 text-muted-foreground">Click to replace</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="h-8 w-8 mb-2 group-hover:text-primary transition-colors" />
                          <span className="text-xs">Click to upload photo</span>
                        </>
                      )}
                      <Input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        ref={photoInputRef}
                        onChange={(e) => handleFileChange(e, 'photo')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice Document</Label>
                    <div 
                      onClick={() => invoiceInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer group h-[120px]"
                    >
                      {currentAsset.invoiceUrl ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="h-8 w-8 text-green-500 mb-1" />
                          <span className="text-xs font-bold text-green-600">Document Attached</span>
                          <span className="text-[10px] mt-1 text-muted-foreground">Click to replace</span>
                        </div>
                      ) : (
                        <>
                          <FileText className="h-8 w-8 mb-2 group-hover:text-primary transition-colors" />
                          <span className="text-xs">Click to upload PDF/Image</span>
                        </>
                      )}
                      <Input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,image/*" 
                        ref={invoiceInputRef}
                        onChange={(e) => handleFileChange(e, 'invoice')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-primary">
                  Financial Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pval">Purchase Value (₹)</Label>
                    <Input 
                      id="pval" 
                      type="number" 
                      value={currentAsset.purchaseValue} 
                      onChange={e => setCurrentAsset({...currentAsset, purchaseValue: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bval">Current Book Value (₹)</Label>
                    <Input 
                      id="bval" 
                      type="number" 
                      value={currentAsset.currentBookValue} 
                      onChange={e => setCurrentAsset({...currentAsset, currentBookValue: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="deprate">Depreciation Rate (%)</Label>
                    <Input 
                      id="deprate" 
                      type="number" 
                      step="0.01"
                      value={currentAsset.depreciationRate} 
                      onChange={e => setCurrentAsset({...currentAsset, depreciationRate: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="sticky bottom-0 bg-background pt-2 border-t mt-6">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary">{isEditing ? "Update Asset" : "Register Asset"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, model or serial..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Buildings">Buildings</SelectItem>
              <SelectItem value="Building Lands">Building Lands</SelectItem>
              <SelectItem value="Vehicles">Vehicles</SelectItem>
              <SelectItem value="Electronics Machinery">Machinery</SelectItem>
              <SelectItem value="IT Equipment">IT Equipment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Syncing with cloud...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Asset Info</TableHead>
                <TableHead className="font-bold">Branch & Dept</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right">Procurement Date</TableHead>
                <TableHead className="font-bold text-right">Warranty Expiry</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">{asset.name}</span>
                        <span className="text-[11px] text-muted-foreground font-medium">{asset.model || "No Model"}</span>
                        <span className="text-[10px] font-code text-primary uppercase mt-1 tracking-wider">{asset.serialNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Building2 className="h-3 w-3 text-accent" />
                          {asset.location}
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase">{asset.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-secondary/10 text-secondary">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <span className="text-[11px] font-medium">{asset.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(asset.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium">{asset.purchaseDate}</span>
                        <span className="text-[10px] text-muted-foreground">Inst: {asset.installationDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-xs font-bold ${
                        asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date() 
                          ? "text-destructive" 
                          : "text-green-600"
                      }`}>
                        {asset.warrantyExpiry || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="QR Label">
                              <QrCode className="h-4 w-4 text-primary" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="font-headline text-center">Asset QR Code</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center p-6 space-y-4">
                              <div className="bg-white p-4 border-4 border-primary rounded-xl">
                                <svg width="150" height="150" viewBox="0 0 100 100" className="text-primary">
                                  <path d="M0 0h30v30H0zM70 0h30v30H70zM0 70h30v100H0z" fill="currentColor" />
                                  <rect x="10" y="10" width="10" height="10" fill="white" />
                                  <rect x="80" y="10" width="10" height="10" fill="white" />
                                  <rect x="10" y="80" width="10" height="10" fill="white" />
                                  <path d="M40 0h20v10H40zM40 20h10v10H40zM60 20h10v10H60zM30 40h10v10H30zM50 40h20v10H50zM80 40h20v10H80zM0 60h10v10H0zM20 60h10v10H20zM40 60h30v10H40zM90 60h10v10H90zM30 70h10v10H30zM50 70h10v10H50zM70 70h10v10H70zM40 80h10v10H40zM60 80h10v10H60zM80 80h20v10H80zM30 90h10v10H30z" fill="currentColor" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <p className="font-bold">{asset.name}</p>
                                <p className="text-xs text-muted-foreground font-code">{asset.serialNumber}</p>
                              </div>
                              <Button className="w-full">Download Label</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary/10"
                          onClick={() => handleOpenEdit(asset)}
                        >
                          <Edit2 className="h-3.5 w-3.5 text-primary" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                          onClick={() => handleDelete(asset.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No assets found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
