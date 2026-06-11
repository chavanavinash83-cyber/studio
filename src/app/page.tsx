
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Asset } from "./lib/types";
import { Building, Package, ShieldCheck, TrendingUp, Zap, Loader2 } from "lucide-react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  Cell
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";

export default function Dashboard() {
  const db = useFirestore();
  const assetsQuery = useMemo(() => (db ? collection(db, "assets") : null), [db]);
  const { data: assets, loading } = useCollection<Asset>(assetsQuery);

  const stats = useMemo(() => {
    const totalAssets = assets?.length || 0;
    const totalValue = assets?.reduce((sum, asset) => sum + (asset.currentBookValue || 0), 0) || 0;
    const assetsUnderRepair = assets?.filter(a => a.status === 'Under Repair').length || 0;
    
    const branches = ['Khodad', 'Manjarwadi', 'Sultanpur', 'Ghodegaon'];
    const branchData = branches.map(branch => ({
      name: branch,
      value: assets?.filter(a => a.location === branch).reduce((s, a) => s + (a.currentBookValue || 0), 0) || 0
    }));

    return { totalAssets, totalValue, assetsUnderRepair, branchData };
  }, [assets]);

  const colors = ['#2A3E8C', '#3B82F6', '#6366F1', '#818CF8'];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Operations Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of SampattiPro asset health across all branches.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="asset-card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">Live from Cloud</p>
          </CardContent>
        </Card>
        <Card className="asset-card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Net Asset Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalValue / 100000).toFixed(2)}L</div>
            <p className="text-xs text-muted-foreground">Current WDV</p>
          </CardContent>
        </Card>
        <Card className="asset-card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Under Repair</CardTitle>
            <ShieldCheck className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assetsUnderRepair}</div>
            <p className="text-xs text-muted-foreground">Attention Required</p>
          </CardContent>
        </Card>
        <Card className="asset-card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Zap className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Optimal</div>
            <p className="text-xs text-muted-foreground">All nodes active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Asset Distribution by Branch</CardTitle>
            <CardDescription>Value distribution (WDV) across all locations.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.branchData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.branchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Operational Notes</CardTitle>
            <CardDescription>System status and recent synchronization.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium">Cloud Database Connected</p>
                <p className="text-xs text-muted-foreground">Real-time sync enabled for all terminals.</p>
              </div>
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium">Audit Schedule</p>
                <p className="text-xs text-muted-foreground">Next global audit window: Oct 2024.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
