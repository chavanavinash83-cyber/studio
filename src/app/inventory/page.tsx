
"use client";

import { useState } from "react";
import { MOCK_ASSETS } from "../lib/mock-data";
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
import { QrCode, Search, Filter, ArrowRight, Plus, Edit2, Trash2, CalendarIcon } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function InventoryPage() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [currentAsset, setCurrentAsset] = useState<Partial<Asset>>({
    name: "",
    serialNumber: "",
    category: "IT Equipment",
    location: "Khodad",
    department: "Administration",
    status: "Active",
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseValue: 0,
    currentBookValue: 0,
    depreciationRate: 15,
  });

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentAsset({
      name: "",
      serialNumber: "",
      category: "IT Equipment",
      location: "Khodad",
      department: "Administration",
      status: "Active",
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseValue: 0,
      currentBookValue: 0,
      depreciationRate: 15,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setIsEditing(true);
    setCurrentAsset(asset);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset.name || !currentAsset.serialNumber) return;

    if (isEditing) {
      setAssets(assets.map(a => a.id === currentAsset.id ? (currentAsset as Asset) : a));
    } else {
      const newAsset: Asset = {
        ...(currentAsset as Asset),
        id: `ASSET-${Math.floor(100 + Math.random() * 900)}`,
      };
      setAssets([...assets, newAsset]);
    }
    setIsDialogOpen(false);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Asset Inventory</h1>
          <p className="text-muted-foreground">Full lifecycle management for enterprise hardware and real estate.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={handleOpenAdd} className="bg-accent text-white hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" /> Add New Asset
          </Button>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Asset" : "Register New Asset"}</DialogTitle>
              <DialogDescription>
                Enter detailed specifications and financial data for the asset.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                  Financial Details & Depreciation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pdate">Purchase Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="pdate" 
                        type="date" 
                        className="pl-10"
                        value={currentAsset.purchaseDate} 
                        onChange={e => setCurrentAsset({...currentAsset, purchaseDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
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
                <div className="grid grid-cols-2 gap-4 mt-4">
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
                </div>
              </div>

              <DialogFooter>
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
            placeholder="Search assets or serial numbers..." 
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
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Asset Details</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold">Location</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-right">Book Value (₹)</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{asset.name}</span>
                      <span className="text-xs font-code text-muted-foreground uppercase">{asset.serialNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded bg-secondary/10 text-secondary font-medium">{asset.category}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">{asset.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(asset.status)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {asset.currentBookValue.toLocaleString()}
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
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No assets found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
