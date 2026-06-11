
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, History, Warehouse, DollarSign, Clock, Loader2 } from "lucide-react";
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

  const maintenanceQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "maintenance"), orderBy("date", "desc"));
  }, [db]);

  const assetsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "assets"), orderBy("name", "asc"));
  }, [db]);

  const { data: maintenanceRecords, loading: maintenanceLoading } = useCollection<MaintenanceRecord>(maintenanceQuery);
  const { data: assets, loading: assetsLoading } = useCollection<Asset>(assetsQuery);

  const totalCost = useMemo(() => {
    return maintenanceRecords?.reduce((sum, r) => sum + (r.cost || 0), 0) || 0;
  }, [maintenanceRecords]);

  const activeRepairsCount = useMemo(() => {
    return assets?.filter(a => a.status === 'Under Repair').length || 0;
  }, [assets]);

  const warehouseCount = useMemo(() => {
    return assets?.filter(a => a.status === 'In Warehouse').length || 0;
  }, [assets]);

  const maintenanceStats = [
    { label: 'Total Service Cost', value: `₹${(totalCost / 100000).toFixed(2)}L`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Active Repairs', value: activeRepairsCount.toString(), icon: Wrench, color: 'text-blue-600' },
    { label: 'Storage (Warehouse)', value: warehouseCount.toString(), icon: Warehouse, color: 'text-primary' },
    { label: 'Avg Downtime', value: '4.2 Days', icon: Clock, color: 'text-orange-600' },
  ];

  if (maintenanceLoading || assetsLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Maintenance & Warehouse</h1>
        <p className="text-muted-foreground">Detailed repair history and inventory control for out-of-service assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {maintenanceStats.map((stat, i) => (
          <Card key={i} className="asset-card-transition">
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
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Recent Service History</CardTitle>
              <CardDescription>Consolidated ledger of all repair activities from the cloud.</CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Service Provider</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Cost (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRecords && maintenanceRecords.length > 0 ? (
                  maintenanceRecords.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold uppercase font-code">{item.assetId}</span>
                          <span className="text-[10px] text-muted-foreground">{item.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.provider}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                      <TableCell className="text-right font-bold text-primary">₹{(item.cost || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No service history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Current Storage</CardTitle>
            <CardDescription>Assets currently in 'Warehouse' status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets && assets.filter(a => a.status === 'In Warehouse').length > 0 ? (
                assets.filter(a => a.status === 'In Warehouse').map((asset) => (
                  <div key={asset.id} className="p-3 border rounded-lg space-y-2 bg-muted/20">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold">{asset.name}</p>
                      <Badge variant="outline" className="text-[10px]">Bin {Math.floor(Math.random() * 50) + 1}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Serial: {asset.serialNumber}</span>
                      <span>Branch: {asset.location}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No assets currently in warehouse.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
