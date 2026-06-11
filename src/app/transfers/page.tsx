
"use client";

import { useState } from "react";
import { MOCK_ASSETS } from "../lib/mock-data";
import { BranchLocation } from "../lib/types";
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
import { ArrowRight, MapPin, Truck, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TransfersPage() {
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [targetBranch, setTargetBranch] = useState<BranchLocation | "">("");
  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAsset = MOCK_ASSETS.find(a => a.id === selectedAssetId);

  const handleTransfer = () => {
    if (!selectedAssetId || !targetBranch) {
      toast({
        title: "Missing Information",
        description: "Please select an asset and a destination branch.",
        variant: "destructive"
      });
      return;
    }

    if (selectedAsset?.location === targetBranch) {
      toast({
        title: "Invalid Transfer",
        description: "The asset is already at the selected branch.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Transfer Initiated",
        description: `Asset ${selectedAsset?.name} is being moved from ${selectedAsset?.location} to ${targetBranch}.`,
      });
      setSelectedAssetId("");
      setTargetBranch("");
      setRemarks("");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Branch Transfer Engine</h1>
        <p className="text-muted-foreground">Official workflows for shifting assets between geographical locations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Initiate Transfer</CardTitle>
            <CardDescription>Select an asset and its new destination.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Asset</Label>
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset to move..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ASSETS.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.serialNumber}) - At {asset.location}
                    </SelectItem>
                  ))}
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
                    <SelectItem value="Khodad">Khodad</SelectItem>
                    <SelectItem value="Manjarwadi">Manjarwadi</SelectItem>
                    <SelectItem value="Sultanpur">Sultanpur</SelectItem>
                    <SelectItem value="Ghodegaon">Ghodegaon</SelectItem>
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
              />
            </div>

            <Button 
              className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90"
              disabled={isProcessing}
              onClick={handleTransfer}
            >
              {isProcessing ? "Processing Workflow..." : "Authorize Movement"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-headline">Transfer Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAsset ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase">Estimated Book Value</span>
                    <span className="text-xl font-bold">₹{selectedAsset.currentBookValue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                    <div className="text-center flex-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">From</p>
                      <p className="font-headline font-bold">{selectedAsset.location}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <div className="text-center flex-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">To</p>
                      <p className="font-headline font-bold">{targetBranch || '---'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      Digital Custody verified
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                      <Truck className="h-3 w-3" />
                      Logistics path available
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Select an asset to view transfer details.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
