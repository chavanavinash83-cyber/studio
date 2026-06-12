
"use client";

import { useState, useMemo } from "react";
import { Asset, BranchLocation, TransferRecord } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, MapPin, Truck, CheckCircle2, Loader2, RefreshCw, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useUser, errorEmitter } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { format } from "date-fns";

export default function TransfersPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [targetBranch, setTargetBranch] = useState<BranchLocation | "">("");
  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch live assets
  const assetsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "assets"), orderBy("name", "asc"));
  }, [db]);

  // Fetch live branches for the target selector
  const branchesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "branches"), orderBy("name", "asc"));
  }, [db]);

  const { data: assets, loading: assetsLoading } = useCollection<Asset>(assetsQuery);
  const { data: branches, loading: branchesLoading } = useCollection<any>(branchesQuery);

  const selectedAsset = assets?.find(a => a.id === selectedAssetId);

  const handleTransfer = () => {
    if (!db || !selectedAssetId || !targetBranch || !selectedAsset) {
      toast({
        title: "Missing Information",
        description: "Please select an asset and a destination branch.",
        variant: "destructive"
      });
      return;
    }

    if (selectedAsset.location === targetBranch) {
      toast({
        title: "Invalid Transfer",
        description: "The asset is already at the selected branch.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    const assetRef = doc(db, "assets", selectedAssetId);
    const updateData = {
      location: targetBranch,
      lastTransferRemarks: remarks,
      updatedAt: serverTimestamp(),
    };

    const transferData: Omit<TransferRecord, 'id'> = {
      assetId: selectedAssetId,
      assetName: selectedAsset.name,
      fromLocation: selectedAsset.location,
      toLocation: targetBranch,
      transferDate: format(new Date(), 'yyyy-MM-dd'),
      authorizedBy: user?.displayName || user?.email || "System Admin",
      remarks: remarks,
      updatedAt: serverTimestamp(),
    };

    // 1. Update the Asset record
    updateDoc(assetRef, updateData)
      .then(() => {
        // 2. Create the Transfer Track Record
        return addDoc(collection(db, "transfers"), transferData);
      })
      .then(() => {
        toast({
          title: "Saved successfully",
          description: `Asset ${selectedAsset.name} has been transferred to ${targetBranch}.`,
        });
        setSelectedAssetId("");
        setTargetBranch("");
        setRemarks("");
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: assetRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        
        toast({
          title: "Failed to save",
          description: "Could not authorize asset movement. Check your permissions.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  if (assetsLoading || branchesLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-3">
          <Truck className="h-8 w-8 text-accent" />
          Branch Transfer Engine
        </h1>
        <p className="text-muted-foreground">Official workflows for shifting assets between geographical locations using live cloud sync.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Initiate Transfer</CardTitle>
            <CardDescription>Select an asset and its new destination from the live inventory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Asset</Label>
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset to move..." />
                </SelectTrigger>
                <SelectContent>
                  {assets && assets.length > 0 ? (
                    assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.serialNumber}) - Currently at {asset.location}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No assets available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Location</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md border text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {selectedAsset ? selectedAsset.location : "Select an asset first"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Destination Branch</Label>
                <Select value={targetBranch} onValueChange={(val) => setTargetBranch(val as BranchLocation)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transfer Remarks</Label>
              <Textarea 
                placeholder="Reason for transfer, handling instructions, etc."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button 
              className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 shadow-md"
              disabled={isProcessing || !selectedAssetId || !targetBranch}
              onClick={handleTransfer}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Synchronizing Cloud...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Authorize & Save Movement
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-accent shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-accent" />
                Transfer Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAsset ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Asset Value At Risk</span>
                    <span className="text-2xl font-bold text-primary">₹{(selectedAsset.currentBookValue || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-primary/5 relative">
                    <div className="text-center flex-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">From</p>
                      <p className="font-headline font-bold text-sm">{selectedAsset.location}</p>
                    </div>
                    <div className="flex items-center justify-center w-8">
                      <ArrowRight className="h-4 w-4 text-accent" />
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">To</p>
                      <p className={`font-headline font-bold text-sm ${targetBranch ? 'text-accent' : 'text-muted-foreground italic'}`}>
                        {targetBranch || 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3 text-xs text-green-600 font-bold">
                      <div className="h-6 w-6 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      Digital Custody verified
                    </div>
                    <div className="flex items-center gap-3 text-xs text-blue-600 font-bold">
                      <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center">
                        <Truck className="h-3.5 w-3.5" />
                      </div>
                      Logistics path available
                    </div>
                  </div>

                  {remarks && (
                    <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Authorized Remarks</p>
                      <p className="text-[11px] italic leading-tight">{remarks}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground opacity-20" />
                  </div>
                  <p className="text-sm text-muted-foreground italic max-w-[150px]">
                    Select an active asset to view transit details.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
