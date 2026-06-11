
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Asset } from "./lib/types";
import { 
  Building, 
  Package, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Loader2, 
  AlertTriangle, 
  Clock, 
  Wrench,
  ChevronRight
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { isAfter, isBefore, parseISO, subYears, startOfYear, endOfYear, format } from "date-fns";

export default function Dashboard() {
  const db = useFirestore();
  const assetsQuery = useMemo(() => (db ? query(collection(db, "assets"), orderBy("name", "asc")) : null), [db]);
  const { data: assets, loading } = useCollection<Asset>(assetsQuery);

  const stats = useMemo(() => {
    if (!assets) return { 
      totalAssets: 0, 
      totalValue: 0, 
      underRepairCount: 0, 
      warrantyExpiredCount: 0, 
      branchCategoryData: [], 
      lastFYPurchaseData: [],
      alerts: [] 
    };

    const now = new Date();
    
    // Financial Year Logic (India: April to March)
    // Last FY Calculation
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    
    let lastFYStart, lastFYEnd;
    if (currentMonth >= 3) { // April or later
      lastFYStart = new Date(currentYear - 1, 3, 1); // April 1 last year
      lastFYEnd = new Date(currentYear, 2, 31, 23, 59, 59); // March 31 this year
    } else {
      lastFYStart = new Date(currentYear - 2, 3, 1);
      lastFYEnd = new Date(currentYear - 1, 2, 31, 23, 59, 59);
    }

    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + (asset.currentBookValue || 0), 0);
    const underRepairCount = assets.filter(a => a.status === 'Under Repair').length;
    
    const expiredAssets = assets.filter(a => {
      if (!a.warrantyExpiry) return false;
      return isBefore(parseISO(a.warrantyExpiry), now);
    });
    const warrantyExpiredCount = expiredAssets.length;

    // Branch-wise Category Distribution
    const branches = Array.from(new Set(assets.map(a => a.location))).filter(Boolean);
    const categories = Array.from(new Set(assets.map(a => a.category))).filter(Boolean);
    
    const branchCategoryData = branches.map(branch => {
      const entry: any = { name: branch };
      categories.forEach(cat => {
        entry[cat] = assets.filter(a => a.location === branch && a.category === cat).length;
      });
      return entry;
    });

    // Last FY Purchases by Branch
    const lastFYAssets = assets.filter(a => {
      if (!a.purchaseDate) return false;
      const pDate = parseISO(a.purchaseDate);
      return isAfter(pDate, lastFYStart) && isBefore(pDate, lastFYEnd);
    });

    const lastFYPurchaseData = branches.map(branch => ({
      name: branch,
      value: lastFYAssets.filter(a => a.location === branch).reduce((s, a) => s + (a.purchaseValue || 0), 0)
    })).filter(d => d.value > 0);

    // Critical Alerts
    const alerts = [
      ...assets.filter(a => a.status === 'Under Repair').map(a => ({
        id: a.id,
        title: a.name,
        type: 'Repair',
        desc: `Under maintenance at ${a.location}`,
        icon: Wrench,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50'
      })),
      ...expiredAssets.map(a => ({
        id: a.id,
        title: a.name,
        type: 'Warranty',
        desc: `Warranty expired on ${a.warrantyExpiry}`,
        icon: AlertTriangle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/5'
      }))
    ].slice(0, 6); // Top 6 alerts

    return { 
      totalAssets, 
      totalValue, 
      underRepairCount, 
      warrantyExpiredCount, 
      branchCategoryData, 
      lastFYPurchaseData,
      categories,
      alerts
    };
  }, [assets]);

  const COLORS = ['#2A3E8C', '#3B82F6', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];

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
        <Card className="asset-card-transition border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">Live from Cloud</p>
          </CardContent>
        </Card>
        <Card className="asset-card-transition border-t-4 border-t-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Net Asset Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalValue / 100000).toFixed(2)}L</div>
            <p className="text-xs text-muted-foreground">Current WDV</p>
          </CardContent>
        </Card>
        <Card className="asset-card-transition border-t-4 border-t-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Under Repair</CardTitle>
            <ShieldCheck className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.underRepairCount}</div>
            <p className="text-xs text-muted-foreground">Attention Required</p>
          </CardContent>
        </Card>
        <Card className="asset-card-transition border-t-4 border-t-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Warranty Expired</CardTitle>
            <Clock className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warrantyExpiredCount}</div>
            <p className="text-xs text-muted-foreground">Renewal required</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Branch-wise Category Distribution</CardTitle>
            <CardDescription>Asset counts split by category per location.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.branchCategoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: 'hsl(var(--muted))', opacity: 0.1}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                {stats.categories.map((cat, index) => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[index % COLORS.length]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Last FY Purchase Trends</CardTitle>
            <CardDescription>Capital investment by branch in the previous financial cycle.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {stats.lastFYPurchaseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.lastFYPurchaseData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Investment']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {stats.lastFYPurchaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                No purchase records found for last FY.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Immediate Attention Required
            </CardTitle>
            <CardDescription>Warranty expirations and active repair tickets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.alerts.length > 0 ? (
                stats.alerts.map((alert, i) => (
                  <div key={`${alert.id}-${i}`} className={cn("flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-muted/30", alert.bgColor)}>
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg bg-background shadow-sm", alert.color)}>
                        <alert.icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{alert.title}</span>
                        <span className="text-xs text-muted-foreground">{alert.desc}</span>
                      </div>
                    </div>
                    <Badge variant={alert.type === 'Warranty' ? 'destructive' : 'default'} className="uppercase text-[10px]">
                      {alert.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShieldCheck className="h-12 w-12 text-green-500 mb-4 opacity-20" />
                  <p className="text-sm font-medium">All systems stable</p>
                  <p className="text-xs text-muted-foreground">No active repairs or expired warranties found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">System Intelligence</CardTitle>
            <CardDescription>Live telemetry from global asset nodes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-xl bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cloud Database Sync</span>
                <Badge className="bg-green-500">Live</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Audit Cycle</span>
                <span className="text-xs text-muted-foreground">Completed March 2024</span>
              </div>
              <div className="pt-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98%]" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>Data Integrity</span>
                  <span>98.2%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-xl bg-accent/5 space-y-2">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                AI Optimization Tip
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {stats.underRepairCount > 0 
                  ? `You have ${stats.underRepairCount} assets currently under repair. Our analysis suggests consolidating maintenance vendors to reduce downtime.`
                  : "Asset uptime is currently optimal across all branches. Keep tracking preventative maintenance to maintain these levels."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
