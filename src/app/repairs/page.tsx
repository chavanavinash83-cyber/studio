"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, History, Warehouse, DollarSign, Clock, Loader2, Package } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Asset, MaintenanceRecord } from "../lib/types";

export default function RepairsPage() {
  const db = useFirestore();

  // Fetch live maintenance records
  const maintenanceQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "maintenance"), orderBy("date", "desc"));
  }, [db]);

  // Fetch live assets for reference and warehouse tracking
  const assetsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "assets"), orderBy("name", "asc"));
  }, [db]);

  const { data: maintenanceRecords, loading: maintenanceLoading } = useCollection<MaintenanceRecord>(maintenanceQuery);
  const { data: assets, loading: assetsLoading } = useCollection<Asset>(assetsQuery);

  // Helper to find asset name by ID
  const getAssetName = (id: string) => {
    const asset = assets?.find(a => a.id === id || a.serialNumber === id);
    return asset ? asset.name : id;
  };

  const totalCost = useMemo(() => {
    return maintenanceRecords?.reduce((sum, r) => sum + (Number(r.cost) || 0), 0) || 0;
  }, [maintenanceRecords]);

  const activeRepairsCount = useMemo(() => {
    return assets?.filter(a => a.status === 'Under Repair').length || 0;
  }, [assets]);

  const warehouseCount = useMemo(() => {
    return assets?.filter(a => a.status === 'In Warehouse').length || 0;
  }, [assets]);

  const maintenanceStats = [
    { 
      label: 'Total Service Cost', 
      value: `₹${totalCost > 100000 ? (totalCost / 100000).toFixed(2) + 'L' : totalCost.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'text-green-600' 
    },
    { label: 'Active Repairs', value: activeRepairsCount.toString(), icon: Wrench, color: 'text-blue-600' },
    { label: 'Storage (Warehouse)', value: warehouseCount.toString(), icon: Warehouse, color: 'text-primary' },
    { label: 'Asset Uptime', value: assets?.length ? '94%' : 'N/A', icon: Clock, color: 'text-orange-600' },
  ];

  if (maintenanceLoading || assetsLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const warehouseAssets = assets?.filter(a => a.status === 'In Warehouse') || [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-3">
          <Wrench className="h-8 w-8 text-accent" />
          Repair Module
        </h1>
        <p className="text-muted-foreground">Detailed repair history and inventory control for out-of-service assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {maintenanceStats.map((stat, i) => (
          <Card key={i} className="asset-card-transition border-t-2 border-t-transparent hover:border-t-primary transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`h-12 w-12 rounded-full bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
                <span className="text-xl font-bold font-headline">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-xl">Service History Ledger</CardTitle>
              <CardDescription>Consolidated ledger of all historical repair activities from the cloud.</CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold">Asset</TableHead>
                    <TableHead className="font-bold">Service Provider</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="text-right font-bold">Cost (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceRecords && maintenanceRecords.length > 0 ? (
                    maintenanceRecords.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{getAssetName(item.assetId)}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{item.provider}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ₹{(Number(item.cost) || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                        No service records found in the system.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Warehouse Inventory</CardTitle>
            <CardDescription>Assets currently in storage at various branches.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {warehouseAssets.length > 0 ? (
                warehouseAssets.map((asset) => (
                  <div key={asset.id} className="p-4 border rounded-xl space-y-3 bg-muted/10 hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold leading-tight">{asset.name}</p>
                        <p className="text-[10px] font-code text-muted-foreground uppercase">{asset.serialNumber}</p>
                      </div>
                      <Badge variant="secondary" className="text-[9px] font-bold">STOWED</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-2">
                      <div className="flex items-center gap-1">
                        <Warehouse className="h-3 w-3" />
                        <span>{asset.location}</span>
                      </div>
                      <span className="italic">{asset.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground opacity-20" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Storage Empty</p>
                    <p className="text-xs text-muted-foreground max-w-[150px]">
                      No assets are currently flagged as 'In Warehouse'.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
