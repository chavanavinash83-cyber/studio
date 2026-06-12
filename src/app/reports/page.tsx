
"use client";

import { useState, useMemo } from "react";
import { 
  BarChart3, 
  Filter, 
  FileText,
  AlertCircle,
  Calculator,
  ArrowLeftRight,
  Store,
  Wrench,
  MapPin,
  Tags,
  ShieldCheck,
  Package,
  FileSpreadsheet,
  FileDown,
  X,
  Loader2,
  Table as TableIcon,
  CheckCircle2
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Asset, MaintenanceRecord, TransferRecord } from "../lib/types";
import { calculateDepreciation } from "../lib/depreciation";
import { format } from "date-fns";

type DetailView = {
  title: string;
  description: string;
  type: 'assets' | 'maintenance' | 'depreciation' | 'warranty' | 'repair_cost' | 'transfers';
} | null;

export default function ReportsPage() {
  const { toast } = useToast();
  const db = useFirestore();
  
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeDetail, setActiveDetail] = useState<DetailView>(null);

  const assetsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "assets"), orderBy("name", "asc"));
  }, [db]);

  const maintenanceQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "maintenance"), orderBy("date", "desc"));
  }, [db]);

  const transfersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "transfers"), orderBy("transferDate", "desc"));
  }, [db]);

  const { data: assets, loading: assetsLoading } = useCollection<Asset>(assetsQuery);
  const { data: maintenanceRecords, loading: maintenanceLoading } = useCollection<MaintenanceRecord>(maintenanceQuery);
  const { data: transfers, loading: transfersLoading } = useCollection<TransferRecord>(transfersQuery);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(asset => {
      const matchesBranch = branchFilter === "all" || asset.location === branchFilter;
      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      return matchesBranch && matchesCategory;
    });
  }, [assets, branchFilter, categoryFilter]);

  const filteredMaintenance = useMemo(() => {
    if (!maintenanceRecords || !assets) return [];
    return maintenanceRecords.filter(record => {
      const asset = assets.find(a => a.id === record.assetId || a.serialNumber === record.assetId);
      if (!asset) return false;
      const matchesBranch = branchFilter === "all" || asset.location === branchFilter;
      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      return matchesBranch && matchesCategory;
    });
  }, [maintenanceRecords, assets, branchFilter, categoryFilter]);

  const filteredTransfers = useMemo(() => {
    if (!transfers) return [];
    return transfers.filter(t => {
      const matchesBranch = branchFilter === "all" || t.fromLocation === branchFilter || t.toLocation === branchFilter;
      // Note: Category filter is hard on transfers if not stored, we'll just use branch for now
      return matchesBranch;
    });
  }, [transfers, branchFilter]);

  const depreciationMatrix = useMemo(() => {
    const branches = Array.from(new Set(filteredAssets.map(a => a.location))).sort();
    const categories = Array.from(new Set(filteredAssets.map(a => a.category))).sort();
    const calculationDate = format(new Date(), 'yyyy-MM-dd');

    const matrix: Record<string, Record<string, number>> = {};

    categories.forEach(cat => {
      matrix[cat] = {};
      branches.forEach(br => {
        const assetsInCell = filteredAssets.filter(a => a.category === cat && a.location === br);
        const totalDepr = assetsInCell.reduce((sum, a) => sum + calculateDepreciation(a, calculationDate).amount, 0);
        matrix[cat][br] = totalDepr;
      });
    });

    return { branches, categories, matrix };
  }, [filteredAssets]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAssets.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredAssets]);

  const valueByBranch = useMemo(() => {
    const values: Record<string, number> = {};
    filteredAssets.forEach(a => {
      values[a.location] = (values[a.location] || 0) + (a.purchaseValue || 0);
    });
    return Object.entries(values).map(([name, value]) => ({ name, value }));
  }, [filteredAssets]);

  const totalAcquisition = filteredAssets.reduce((s, a) => s + (a.purchaseValue || 0), 0);
  const netBookValue = filteredAssets.reduce((s, a) => s + (a.currentBookValue || 0), 0);
  const criticalAssetsCount = filteredAssets.filter(a => a.status === 'Under Repair').length;

  const totalMaintenanceSpendYTD = useMemo(() => {
    return filteredMaintenance
      .filter(r => new Date(r.date).getFullYear() === new Date().getFullYear())
      .reduce((sum, r) => sum + (r.cost || 0), 0);
  }, [filteredMaintenance]);

  const monthlyMaintenanceTrends = useMemo(() => {
    if (!maintenanceRecords) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const stats: Record<string, number> = {};
    
    months.forEach(m => stats[m] = 0);
    
    filteredMaintenance
      .filter(r => new Date(r.date).getFullYear() === currentYear)
      .forEach(r => {
        const m = months[new Date(r.date).getMonth()];
        stats[m] += r.cost || 0;
      });
      
    return months.map(name => ({ name, cost: stats[name] }));
  }, [filteredMaintenance, maintenanceRecords]);

  const COLORS = ['#2A3E8C', '#3B82F6', '#6366F1', '#818CF8', '#A5B4FC'];

  const handleExport = (type: 'PDF' | 'Excel', reportName: string = "System_Report") => {
    toast({
      title: `Generating ${type}...`,
      description: `Preparing ${reportName} for download.`,
    });

    setTimeout(() => {
      let content = "";
      let fileName = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
      let mimeType = "";
      const calculationDate = format(new Date(), 'yyyy-MM-dd');

      if (type === 'Excel') {
        const headers = "Branch,Category,Asset Name,Serial Number,Purchase Date,Vendor,Warranty Expiry,Purchase Amount,Opening WDV,Depr %,Depr Amount,Closing Balance (WDV)\n";
        const rows = filteredAssets.map(a => {
          const depr = calculateDepreciation(a, calculationDate);
          return `${a.location},${a.category},${a.name},${a.serialNumber},${a.purchaseDate},${a.vendorName || 'N/A'},${a.warrantyExpiry || 'N/A'},${a.purchaseValue},${a.currentBookValue},${a.depreciationRate}%,${depr.amount.toFixed(2)},${depr.newValue.toFixed(2)}`;
        }).join("\n");
        content = headers + rows;
        fileName += ".csv";
        mimeType = "text/csv";
      } else {
        content = `AMBIKA AMS - ${reportName.toUpperCase()}\n`;
        content += `Filters: Branch: ${branchFilter}, Category: ${categoryFilter}\n`;
        content += `Generated on: ${new Date().toLocaleString()}\n`;
        content += `========================================================================================================\n\n`;
        
        filteredAssets.forEach(a => {
          const depr = calculateDepreciation(a, calculationDate);
          content += `BRANCH: ${a.location.toUpperCase()} | CATEGORY: ${a.category}\n`;
          content += `ASSET: ${a.name} (${a.serialNumber})\n`;
          content += `PURCHASE: Date: ${a.purchaseDate} | Vendor: ${a.vendorName || 'N/A'} | Cost: ₹${(a.purchaseValue || 0).toLocaleString()}\n`;
          content += `WARRANTY: Expiry: ${a.warrantyExpiry || 'N/A'}\n`;
          content += `FINANCIALS:\n`;
          content += `  Purchase Amount: ₹${(a.purchaseValue || 0).toLocaleString()}\n`;
          content += `  Opening WDV:     ₹${(a.currentBookValue || 0).toLocaleString()}\n`;
          content += `  Depr Rate:       ${a.depreciationRate}%\n`;
          content += `  Depr Amount:     ₹${depr.amount.toLocaleString()}\n`;
          content += `  Closing Balance: ₹${depr.newValue.toLocaleString()}\n`;
          content += `--------------------------------------------------------------------------------------------------------\n`;
        });
        fileName += ".txt";
        mimeType = "text/plain";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `Successfully exported ${fileName}`,
      });
    }, 1500);
  };

  const clearFilters = () => {
    setBranchFilter("all");
    setCategoryFilter("all");
  };

  const reportTemplates = [
    { title: "Branch Wise Asset Report", desc: "Detailed breakdown including purchase and vendor info.", icon: MapPin, type: 'assets' as const },
    { title: "Category Wise Report", desc: "Consolidated list categorized by asset classes.", icon: Tags, type: 'assets' as const },
    { title: "Depreciation Report", desc: "Annual WDV calculation and depreciation schedules.", icon: Calculator, type: 'depreciation' as const },
    { title: "Vendor Wise Report", desc: "Procurement history and spend per supplier.", icon: Store, type: 'assets' as const },
    { title: "Warranty Expiry Report", desc: "Alerts for assets reaching warranty limits.", icon: AlertCircle, type: 'warranty' as const },
    { title: "Dead Stock Report", desc: "Assets classified as disposed or long-term stored.", icon: Package, type: 'assets' as const },
    { title: "Repair Cost Report", desc: "Maintenance ledger with total spend per unit.", icon: Wrench, type: 'repair_cost' as const },
    { title: "Transfer Register", desc: "Audit trail of inter-branch movements.", icon: ArrowLeftRight, type: 'transfers' as const },
    { title: "Fixed Asset Register (FAR)", desc: "Complete regulatory list with book values.", icon: FileText, type: 'assets' as const },
  ];

  const renderDetailTable = () => {
    if (!activeDetail) return null;
    const calcDate = format(new Date(), 'yyyy-MM-dd');

    switch (activeDetail.type) {
      case 'maintenance':
      case 'repair_cost':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Cost (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenance.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    {assets?.find(a => a.id === m.assetId || a.serialNumber === m.assetId)?.name || m.assetId}
                  </TableCell>
                  <TableCell>{m.provider}</TableCell>
                  <TableCell>{m.date}</TableCell>
                  <TableCell className="text-right font-bold">₹{m.cost.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case 'transfers':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Authorized By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{t.assetName || t.assetId}</TableCell>
                  <TableCell>{t.fromLocation}</TableCell>
                  <TableCell className="font-bold text-accent">{t.toLocation}</TableCell>
                  <TableCell>{t.transferDate}</TableCell>
                  <TableCell className="text-xs">{t.authorizedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case 'depreciation':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Opening WDV</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Depreciation</TableHead>
                <TableHead className="text-right">Closing WDV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((a, i) => {
                const depr = calculateDepreciation(a, calcDate);
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-right">₹{a.currentBookValue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{a.depreciationRate}%</TableCell>
                    <TableCell className="text-right text-destructive">-₹{depr.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-primary">₹{depr.newValue.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      case 'warranty':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((a, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.location}</TableCell>
                  <TableCell>{a.vendorName || 'N/A'}</TableCell>
                  <TableCell className={`text-right font-bold ${new Date(a.warrantyExpiry || '') < new Date() ? 'text-destructive' : 'text-green-600'}`}>
                    {a.warrantyExpiry || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      default:
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Serial No</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Acq. Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((a, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="font-code text-xs">{a.serialNumber}</TableCell>
                  <TableCell>{a.location}</TableCell>
                  <TableCell className="text-right">₹{a.purchaseValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${a.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {a.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
    }
  };

  if (assetsLoading || maintenanceLoading || transfersLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-accent" />
            System Reports
          </h1>
          <p className="text-muted-foreground">Detailed analytics and financial summaries for live assets.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={branchFilter !== "all" || categoryFilter !== "all" ? "default" : "outline"} size="sm" className="h-9 relative">
                <Filter className="mr-2 h-4 w-4" /> 
                Filter
                {(branchFilter !== "all" || categoryFilter !== "all") && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full border-2 border-background" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold leading-none">Report Filters</h4>
                  {(branchFilter !== "all" || categoryFilter !== "all") && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                      <X className="h-3 w-3 mr-1" /> Clear All
                    </Button>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branch-filter">Branch Location</Label>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger id="branch-filter">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {Array.from(new Set(assets?.map(a => a.location) || [])).map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category-filter">Asset Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.from(new Set(assets?.map(a => a.category) || [])).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 border-green-600 text-green-700 hover:bg-green-50"
            onClick={() => handleExport('Excel', 'Global_Asset_Inventory')}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button 
            className="h-9 bg-accent hover:bg-accent/90"
            onClick={() => handleExport('PDF', 'Global_Asset_Summary')}
          >
            <FileDown className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-primary/5 group"
          onClick={() => setActiveDetail({
            title: "Acquisition Value Detailed Ledger",
            description: "Breakdown of total procurement investment for current filters.",
            type: 'assets'
          })}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider group-hover:text-primary transition-colors">Acquisition Cost</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{totalAcquisition.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
              Based on {filteredAssets.length} assets • Click to view
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-accent/5 group"
          onClick={() => setActiveDetail({
            title: "Net Book Value (WDV) Projection",
            description: "Live written down value schedule for fiscal year reporting.",
            type: 'depreciation'
          })}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider group-hover:text-accent transition-colors">Net Book Value</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{netBookValue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground group-hover:text-accent/70">Current WDV Projection • Click to view</div>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-orange-50 group"
          onClick={() => setActiveDetail({
            title: "Maintenance Spend Ledger",
            description: "Historical repair costs and service provider activity.",
            type: 'maintenance'
          })}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider group-hover:text-orange-600">Maintenance Spend (YTD)</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{totalMaintenanceSpendYTD.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground group-hover:text-orange-500">Historical Maintenance Ledger • Click to view</div>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-red-50 group"
          onClick={() => setActiveDetail({
            title: "Critical Assets Needing Attention",
            description: "Assets currently under repair or with expired maintenance contracts.",
            type: 'assets'
          })}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider group-hover:text-red-600">Attention Required</CardDescription>
            <CardTitle className="text-2xl font-bold">{criticalAssetsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-red-500 font-bold">
              <AlertCircle className="mr-1 h-3 w-3" /> {criticalAssetsCount} active repair tickets • Click to view
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Asset Count by Category</CardTitle>
            <CardDescription>Volume distribution. Click slice to drill down.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    className="cursor-pointer"
                    onClick={(data) => {
                      if (data && data.name) {
                        setCategoryFilter(data.name);
                        setActiveDetail({
                          title: `Category Details: ${data.name}`,
                          description: `Viewing all assets assigned to the ${data.name} category.`,
                          type: 'assets'
                        });
                      }
                    }}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data for selected filters</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Acquisition Value by Branch</CardTitle>
            <CardDescription>Capital investment. Click bar to drill down.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {valueByBranch.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueByBranch} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Investment']}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 4, 4, 0]} 
                    className="cursor-pointer"
                    onClick={(data) => {
                      if (data && data.name) {
                        setBranchFilter(data.name);
                        setActiveDetail({
                          title: `Branch Details: ${data.name}`,
                          description: `Viewing all assets located at the ${data.name} branch.`,
                          type: 'assets'
                        });
                      }
                    }}
                  >
                    {valueByBranch.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data for selected filters</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-accent" />
                Depreciation Summary Matrix
              </CardTitle>
              <CardDescription>Matrix view of total depreciation amount by Branch (columns) and Category (rows).</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {depreciationMatrix.categories.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold border-r">Asset Category</TableHead>
                    {depreciationMatrix.branches.map(br => (
                      <TableHead key={br} className="font-bold text-center border-r min-w-[120px]">
                        {br}
                      </TableHead>
                    ))}
                    <TableHead className="font-bold text-right bg-primary/5">Row Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depreciationMatrix.categories.map(cat => {
                    let rowTotal = 0;
                    return (
                      <TableRow key={cat}>
                        <TableCell className="font-bold border-r bg-muted/20">{cat}</TableCell>
                        {depreciationMatrix.branches.map(br => {
                          const val = depreciationMatrix.matrix[cat][br] || 0;
                          rowTotal += val;
                          return (
                            <TableCell key={br} className="text-center border-r text-xs font-medium">
                              {val > 0 ? `₹${val.toLocaleString()}` : "-"}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-bold bg-primary/5 text-primary">
                          ₹{rowTotal.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <tfoot className="bg-accent/5 font-bold">
                  <TableRow>
                    <TableCell className="border-r">Column Total</TableCell>
                    {depreciationMatrix.branches.map(br => {
                      const colTotal = depreciationMatrix.categories.reduce((sum, cat) => sum + (depreciationMatrix.matrix[cat][br] || 0), 0);
                      return (
                        <TableCell key={br} className="text-center border-r text-accent">
                          ₹{colTotal.toLocaleString()}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right text-lg text-accent bg-accent/10">
                      ₹{filteredAssets.reduce((sum, a) => sum + calculateDepreciation(a, format(new Date(), 'yyyy-MM-dd')).amount, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </tfoot>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <TableIcon className="h-10 w-10 opacity-20 mb-4" />
              <p className="text-sm italic">No data available for the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-lg">Monthly Maintenance Trends</CardTitle>
              <CardDescription>Visualizing historical repair costs from live cloud data.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px] pt-4">
          {monthlyMaintenanceTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyMaintenanceTrends}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Cost']}
                />
                <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">No maintenance records found for the current year.</div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Available Report Templates
          </CardTitle>
          <CardDescription>Select a category to view a comprehensive record based on current filters.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((report, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-4 border rounded-xl hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group"
                onClick={() => setActiveDetail({
                  title: report.title,
                  description: report.desc,
                  type: report.type
                })}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <report.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold">{report.title}</h4>
                  <p className="text-xs text-muted-foreground leading-tight mt-1">{report.desc}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport('PDF', report.title);
                  }}
                >
                  <FileDown className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!activeDetail} onOpenChange={(open) => !open && setActiveDetail(null)}>
        <DialogContent className="sm:max-w-[1000px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              {activeDetail?.title}
            </DialogTitle>
            <DialogDescription>{activeDetail?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto py-4 border-t mt-4">
            {renderDetailTable()}
          </div>
          <div className="pt-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setActiveDetail(null)}>Close</Button>
            <Button onClick={() => handleExport('Excel', activeDetail?.title)}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Ledger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
