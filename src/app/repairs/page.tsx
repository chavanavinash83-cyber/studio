
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_ASSETS } from "../lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Wrench, History, Warehouse, DollarSign, Clock } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function RepairsPage() {
  const maintenanceStats = [
    { label: 'Total Service Cost', value: '₹1.42L', icon: DollarSign, color: 'text-green-600' },
    { label: 'Active Repairs', value: '2', icon: Wrench, color: 'text-blue-600' },
    { label: 'Storage (Warehouse)', value: '5', icon: Warehouse, color: 'text-primary' },
    { label: 'Avg Downtime', value: '4.2 Days', icon: Clock, color: 'text-orange-600' },
  ];

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
              <CardDescription>Consolidated ledger of all repair activities.</CardDescription>
            </div>
            <History className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Service Provider</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Cost (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { asset: 'Logistics Van 4', provider: 'Swift Motors', date: '2024-02-15', cost: 12500 },
                  { asset: 'CNC Milling Machine', provider: 'Tech Solutions', date: '2024-02-10', cost: 45000 },
                  { asset: 'Admin Laptop L-09', provider: 'Internal IT', date: '2024-01-28', cost: 1200 },
                ].map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.asset}</TableCell>
                    <TableCell>{item.provider}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{item.cost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
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
              {MOCK_ASSETS.filter(a => a.status === 'In Warehouse').length > 0 ? (
                MOCK_ASSETS.filter(a => a.status === 'In Warehouse').map((asset) => (
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
