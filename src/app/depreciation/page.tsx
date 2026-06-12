
"use client";

import { useState, useMemo } from "react";
import { Asset } from "../lib/types";
import { calculateDepreciation } from "../lib/depreciation";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingDown, 
  Info, 
  PlayCircle, 
  Loader2, 
  History, 
  Edit2, 
  Check, 
  X,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, errorEmitter } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { FirestorePermissionError } from "@/firebase/errors";

export default function DepreciationPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [calculationDate, setCalculationDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  
  // State for manual overrides
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [manualAmount, setManualAmount] = useState<string>("");
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  // Fetch real-time assets from Firestore
  const assetsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "assets"), orderBy("name", "asc"));
  }, [db]);

  const { data: assets, loading } = useCollection<Asset>(assetsQuery);

  const handleProcessDepreciation = () => {
    if (!db || !assets?.length) return;
    setIsProcessing(true);
    
    let processedCount = 0;

    assets.forEach((asset) => {
      const { amount, newValue } = calculateDepreciation(asset, calculationDate);
      const finalAmount = overrides[asset.id] ?? amount;
      const finalNewValue = overrides[asset.id] ? (asset.currentBookValue - overrides[asset.id]) : newValue;
      
      const assetRef = doc(db, "assets", asset.id);
      const updateData = {
        previousBookValue: asset.currentBookValue,
        currentBookValue: Math.max(1, finalNewValue),
        lastDepreciationDate: calculationDate,
        updatedAt: serverTimestamp(),
      };

      updateDoc(assetRef, updateData)
        .then(() => {
          processedCount++;
          if (processedCount === assets.length) {
            setIsProcessing(false);
            setOverrides({});
            toast({
              title: "Depreciation Processed",
              description: `Total of ${assets.length} assets updated as of ${calculationDate}.`,
            });
          }
        })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: assetRef.path,
            operation: 'update',
            requestResourceData: updateData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    });
  };

  const handleRollback = () => {
    if (!db || !assets?.length) return;
    
    const assetsWithRollback = assets.filter(a => a.previousBookValue !== undefined);
    if (assetsWithRollback.length === 0) {
      toast({
        title: "Nothing to Roll Back",
        description: "No previous book values found for the assets.",
        variant: "destructive"
      });
      return;
    }

    setIsRollingBack(true);
    let rollbackCount = 0;

    assetsWithRollback.forEach((asset) => {
      const assetRef = doc(db, "assets", asset.id);
      const updateData = {
        currentBookValue: asset.previousBookValue,
        previousBookValue: null,
        updatedAt: serverTimestamp(),
      };

      updateDoc(assetRef, updateData)
        .then(() => {
          rollbackCount++;
          if (rollbackCount === assetsWithRollback.length) {
            setIsRollingBack(false);
            toast({
              title: "Rollback Complete",
              description: `Successfully restored ${assetsWithRollback.length} assets to their previous book values.`,
            });
          }
        })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: assetRef.path,
            operation: 'update',
            requestResourceData: updateData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    });
  };

  const openManualEdit = (asset: Asset) => {
    const { amount } = calculateDepreciation(asset, calculationDate);
    setEditingAsset(asset);
    setManualAmount((overrides[asset.id] ?? amount).toString());
  };

  const saveManualOverride = () => {
    if (editingAsset) {
      setOverrides(prev => ({
        ...prev,
        [editingAsset.id]: parseFloat(manualAmount) || 0
      }));
      setEditingAsset(null);
      toast({
        title: "Override Saved",
        description: `Manual amount set for ${editingAsset.name}. This will be applied when you Run Processing.`,
      });
    }
  };

  // Calculations based on live data and overrides
  const totals = useMemo(() => {
    if (!assets) return { depr: 0, wdv: 0 };
    return assets.reduce((acc, a) => {
      const { amount, newValue } = calculateDepreciation(a, calculationDate);
      const deprAmount = overrides[a.id] ?? amount;
      const finalWdv = overrides[a.id] ? (a.currentBookValue - overrides[a.id]) : newValue;
      return {
        depr: acc.depr + deprAmount,
        wdv: acc.wdv + Math.max(1, finalWdv)
      };
    }, { depr: 0, wdv: 0 });
  }, [assets, calculationDate, overrides]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-3">
            <Calculator className="h-8 w-8 text-accent" />
            Depreciation Engine
          </h1>
          <p className="text-muted-foreground">Calculate WDV, process annual runs, and manage manual write-offs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end gap-3 bg-card p-4 rounded-xl border shadow-sm">
          <div className="grid gap-2 w-full sm:w-auto">
            <Label htmlFor="calcDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Process As Of</Label>
            <Input 
              id="calcDate" 
              type="date" 
              value={calculationDate} 
              onChange={(e) => setCalculationDate(e.target.value)}
              className="h-10 w-full sm:w-[180px]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={handleRollback}
              disabled={isRollingBack || isProcessing || !assets?.length}
              className="h-10 border-destructive text-destructive hover:bg-destructive/10"
            >
              {isRollingBack ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
              Roll Back Last Run
            </Button>
            <Button 
              onClick={handleProcessDepreciation} 
              disabled={isProcessing || isRollingBack || !assets?.length}
              className="bg-accent hover:bg-accent/90 text-white font-bold h-10 flex-1"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" /> Run Processing
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Depreciation Ledger</CardTitle>
            <CardDescription>Review calculated values. Click Edit to manually override any amount.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Details</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Current WDV</TableHead>
                  <TableHead className="text-right">Depreciation</TableHead>
                  <TableHead className="text-right font-bold text-primary">New WDV</TableHead>
                  <TableHead className="w-[80px] text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets && assets.length > 0 ? (
                  assets.map((asset) => {
                    const { amount, newValue } = calculateDepreciation(asset, calculationDate);
                    const isOverridden = overrides[asset.id] !== undefined;
                    const displayDepr = overrides[asset.id] ?? amount;
                    const displayWdv = isOverridden ? (asset.currentBookValue - overrides[asset.id]) : newValue;

                    return (
                      <TableRow key={asset.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm leading-tight">{asset.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-code">{asset.serialNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-[10px] font-bold">{asset.depreciationRate}%</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs">₹{(asset.currentBookValue || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">
                          <div className="flex items-center justify-end gap-1.5">
                            {isOverridden && <Badge variant="secondary" className="text-[8px] h-4">Manual</Badge>}
                            <span className="text-destructive font-medium">-₹{displayDepr.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ₹{Math.max(1, displayWdv).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => openManualEdit(asset)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No assets found in inventory.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-accent">
            <CardHeader>
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <Info className="h-4 w-4 text-accent" />
                Processing Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>The system applies <strong>Written Down Value (WDV)</strong> logic directly to cloud records.</p>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Run Processing:</strong> Permanently updates asset book values in Firestore.</li>
                <li><strong>Roll Back:</strong> Reverts the *most recent* change if book values were processed in error.</li>
                <li><strong>Overrides:</strong> Use the Edit button on any row to manually specify a custom depreciation amount (e.g., for accidental damage).</li>
                <li>Assets owned for &lt; 180 days in the current cycle are charged at 50% of the standard rate.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-headline text-white/80 uppercase tracking-widest">Total Run Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    ₹{totals.depr.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase text-white/60">Total Charge Off</span>
                </div>
                <TrendingDown className="h-8 w-8 text-white/20" />
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase text-white/60">Projected Closing Balance</p>
                  <p className="text-xl font-bold">₹{totals.wdv.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!editingAsset} onOpenChange={(open) => !open && setEditingAsset(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Override</DialogTitle>
            <DialogDescription>
              Set a manual depreciation amount for <strong>{editingAsset?.name}</strong>. This bypasses automatic WDV calculations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Current Book Value</Label>
              <div className="p-3 bg-muted rounded-md text-sm font-bold">₹{editingAsset?.currentBookValue.toLocaleString()}</div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manual-amt">Override Amount (₹)</Label>
              <Input 
                id="manual-amt"
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>New Book Value</Label>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-md text-sm font-bold text-primary">
                ₹{( (editingAsset?.currentBookValue || 0) - (parseFloat(manualAmount) || 0) ).toLocaleString()}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditingAsset(null)}>Cancel</Button>
            <Button onClick={saveManualOverride}>
              <Check className="h-4 w-4 mr-2" /> Apply Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
