
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
import { Calculator, TrendingDown, Info, PlayCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function DepreciationPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [calculationDate, setCalculationDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch real-time assets from Firestore
  const assetsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "assets"), orderBy("name", "asc"));
  }, [db]);

  const { data: assets, loading } = useCollection<Asset>(assetsQuery);

  const handleProcessDepreciation = () => {
    setIsProcessing(true);
    
    // In a real-world scenario, this might perform a batch update to Firestore.
    // For now, we simulate the processing feedback.
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Depreciation Processed",
        description: `Projected asset book values have been calculated as of ${calculationDate}.`,
      });
    }, 1000);
  };

  // Calculations based on live data
  const totalDepreciation = useMemo(() => {
    return assets?.reduce((sum, a) => sum + calculateDepreciation(a, calculationDate).amount, 0) || 0;
  }, [assets, calculationDate]);

  const totalNewWDV = useMemo(() => {
    return assets?.reduce((sum, a) => sum + calculateDepreciation(a, calculationDate).newValue, 0) || 0;
  }, [assets, calculationDate]);

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
          <p className="text-muted-foreground">Calculate Written Down Value (WDV) and annual asset value reduction for live records.</p>
        </div>
        
        <div className="flex items-end gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="grid gap-2">
            <Label htmlFor="calcDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Calculate As Of</Label>
            <Input 
              id="calcDate" 
              type="date" 
              value={calculationDate} 
              onChange={(e) => setCalculationDate(e.target.value)}
              className="w-[200px]"
            />
          </div>
          <Button 
            onClick={handleProcessDepreciation} 
            disabled={isProcessing || !assets?.length}
            className="bg-accent hover:bg-accent/90 text-white font-bold h-10"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Depreciation Ledger</CardTitle>
            <CardDescription>Review calculated values for your actual inventory assets.</CardDescription>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets && assets.length > 0 ? (
                  assets.map((asset) => {
                    const result = calculateDepreciation(asset, calculationDate);
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
                        <TableCell className="text-right text-xs text-destructive font-medium">
                          -₹{result.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ₹{result.newValue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No assets found in inventory. Go to Asset Inventory to add some.
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
                Calculation Logic (WDV)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <p>The system uses the <strong>Written Down Value (WDV)</strong> method for fiscal reporting.</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Assets owned for <strong>less than 6 months</strong> (180 days) in the current cycle are depreciated at <strong>50%</strong> of the standard rate.</li>
                <li>Real Estate/Land is excluded from depreciation calculation (Rate: 0%).</li>
                <li>Calculation is performed from the <strong>Purchase Date</strong> until the selected calculation date.</li>
                <li>Asset value will never fall below a residual value of ₹1.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-headline text-white/80 uppercase tracking-widest">Live Impact Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">
                    ₹{totalDepreciation.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase text-white/60">Total Depreciation Amount</span>
                </div>
                <TrendingDown className="h-8 w-8 text-white/20" />
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase text-white/60">Projected Net Book Value</p>
                  <p className="text-xl font-bold">₹{totalNewWDV.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
