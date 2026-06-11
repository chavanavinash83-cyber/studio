
"use client";

import { useState } from "react";
import { MOCK_ASSETS } from "../lib/mock-data";
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
import { QrCode, Search, Filter, ArrowRight } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredAssets = MOCK_ASSETS.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'Under Repair': return <Badge variant="destructive">Under Repair</Badge>;
      case 'In Warehouse': return <Badge variant="secondary">In Warehouse</Badge>;
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
        <Button className="bg-accent text-white hover:bg-accent/90">
          + Add New Asset
        </Button>
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
              <TableHead className="w-[100px]"></TableHead>
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
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <QrCode className="h-4 w-4 text-primary" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-headline text-center">Asset QR Code</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center p-6 space-y-4">
                            <div className="bg-white p-4 border-4 border-primary rounded-xl">
                              {/* Simple Mock QR using SVG pattern */}
                              <svg width="150" height="150" viewBox="0 0 100 100" className="text-primary">
                                <path d="M0 0h30v30H0zM70 0h30v30H70zM0 70h30v100H0z" fill="currentColor" />
                                <rect x="10" y="10" width="10" height="10" fill="white" />
                                <rect x="80" y="10" width="10" height="10" fill="white" />
                                <rect x="10" y="80" width="10" height="10" fill="white" />
                                <path d="M40 0h20v10H40zM40 20h10v10H40zM60 20h10v10H60zM30 40h10v10H30zM50 40h20v10H50zM80 40h20v10H80zM0 60h10v10H0zM20 60h10v10H20zM40 60h30v10H40zM90 60h10v10H90zM30 70h10v10H30zM50 70h10v10H50zM70 70h10v10H70zM40 80h10v10H40zM60 80h10v10H60zM80 80h20v10H80zM30 90h10v10H30zM50 90h40v10H50z" fill="currentColor" />
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10">
                        <ArrowRight className="h-4 w-4 text-accent" />
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
