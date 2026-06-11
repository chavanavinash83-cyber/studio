
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_ASSETS } from "./lib/mock-data";
import { Building, Package, ShieldCheck, TrendingUp, Zap } from "lucide-react";
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

export default function Dashboard() {
  const totalAssets = MOCK_ASSETS.length;
  const totalValue = MOCK_ASSETS.reduce((sum, asset) => sum + asset.currentBookValue, 0);
  const assetsUnderRepair = MOCK_ASSETS.filter(a => a.status === 'Under Repair').length;
  
  const branchData = [
    { name: 'Khodad', count: MOCK_ASSETS.filter(a => a.location === 'Khodad').length, value: MOCK_ASSETS.filter(a => a.location === 'Khodad').reduce((s, a) => s + a.currentBookValue, 0) },
    { name: 'Manjarwadi', count: MOCK_ASSETS.filter(a => a.location === 'Manjarwadi').length, value: MOCK_ASSETS.filter(a => a.location === 'Manjarwadi').reduce((s, a) => s + a.currentBookValue, 0) },
    { name: 'Sultanpur', count: MOCK_ASSETS.filter(a => a.location === 'Sultanpur').length, value: MOCK_ASSETS.filter(a => a.location === 'Sultanpur').reduce((s, a) => s + a.currentBookValue, 0) },
    { name: 'Ghodegaon', count: MOCK_ASSETS.filter(a => a.location === 'Ghodegaon').length, value: MOCK_ASSETS.filter(a => a.location === 'Ghodegaon').reduce((s, a) => s + a.currentBookValue, 0) },
  ];

  const colors = ['#2A3E8C', '#3B82F6', '#6366F1', '#818CF8'];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Operations Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive overview of SampattiPro asset health across all branches.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="asset-card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card className="asset-card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Net Asset Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalValue / 100000).toFixed(2)}L</div>
            <p className="text-xs text-muted-foreground">Current Book Value (WDV)</p>
          </CardContent>
        </Card>
        <Card className="asset-card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Under Repair</CardTitle>
            <ShieldCheck className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetsUnderRepair}</div>
            <p className="text-xs text-muted-foreground">1 prioritized high</p>
          </CardContent>
        </Card>
        <Card className="asset-card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Warranty Alerts</CardTitle>
            <Zap className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Expires within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Asset Distribution by Branch</CardTitle>
            <CardDescription>Value distribution across Khodad, Manjarwadi, Sultanpur, and Ghodegaon.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {branchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Transfers</CardTitle>
            <CardDescription>Latest branch-to-branch movements.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Logistics Van 4', from: 'Khodad', to: 'Manjarwadi', date: 'Today' },
                { name: 'CNC Milling Machine', from: 'Ghodegaon', to: 'Khodad', date: 'Yesterday' },
                { name: 'Admin Laptops', from: 'Sultanpur', to: 'Ghodegaon', date: '2 days ago' },
              ].map((transfer, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{transfer.name}</p>
                    <p className="text-xs text-muted-foreground">{transfer.from} → {transfer.to}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{transfer.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
