
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
  Table as TableIcon
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Asset, MaintenanceRecord } from "../lib/types";
import { calculateDepreciation } from "../lib/depreciation";
import { format } from "date-fns";

export default function ReportsPage() {
  const { toast } = useToast();
  const db = useFirestore();
  
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const assetsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "assets"), orderBy("name", "asc"));
  }, [db]);

  const maintenanceQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "maintenance"), orderBy("date", "desc"));
  }, [db]);

  const { data: assets, loading: assetsLoading } = useCollection<Asset>(assetsQuery);
  const { data: maintenanceRecords, loading: maintenanceLoading } = useCollection<MaintenanceRecord>(maintenanceQuery);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(asset => {
      const matchesBranch = branchFilter === "all" || asset.location === branchFilter;
      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      return matchesBranch && matchesCategory;
    });
  }, [assets, branchFilter, categoryFilter]);

  // Matrix Calculation: Depreciation Summary by Branch (Columns) and Category (Rows)
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
    if (!maintenanceRecords) return 0;
    const currentYear = new Date().getFullYear();
    return maintenanceRecords
      .filter(r => new Date(r.date).getFullYear() === currentYear)
      .reduce((sum, r) => sum + (r.cost || 0), 0);
  }, [maintenanceRecords]);

  const monthlyMaintenanceTrends = useMemo(() => {
    if (!maintenanceRecords) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const stats: Record<string, number> = {};
    
    months.forEach(m => stats[m] = 0);
    
    maintenanceRecords
      .filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === currentYear;
      })
      .forEach(r => {
        const m = months[new Date(r.date).getMonth()];
        stats[m] += r.cost || 0;
      });
      
    return months.map(name => ({ name, cost: stats[name] }));
  }, [maintenanceRecords]);

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
        content = `SAMPATTIPRO - ${reportName.toUpperCase()}\n`;
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
    { title: "Branch Wise Asset Report", desc: "Detailed breakdown including purchase, vendor, and full depreciation ledger.", icon: MapPin },
    { title: "Category Wise Report", desc: "Consolidated list of assets categorized by their asset classes.", icon: Tags },
    { title: "Depreciation Report", desc: "Annual WDV calculation and fiscal year depreciation schedules.", icon: Calculator },
    { title: "Vendor Wise Report", desc: "Procurement history and spend analysis per supplier.", icon: Store },
    { title: "Warranty Expiry Report", desc: "Active alerts for assets reaching warranty limits.", icon: AlertCircle },
    { title: "Dead Stock Report", desc: "Assets classified as disposed or out of service for long durations.", icon: Package },
    { title: "Repair Cost Report", desc: "Maintenance ledger with total repair spend per unit.", icon: Wrench },
    { title: "Transfer Register", desc: "Digital audit trail of all inter-branch asset movements.", icon: ArrowLeftRight },
    { title: "Audit Register", desc: "Historical records of physical verification and AI-led audits.", icon: ShieldCheck },
    { title: "Fixed Asset Register (FAR)", desc: "Complete regulatory list with book values and procurement dates.", icon: FileText },
  ];

  if (assetsLoading || maintenanceLoading) {
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
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Acquisition Cost</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{totalAcquisition.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              Based on {filteredAssets.length} assets
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Net Book Value</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{netBookValue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Current WDV Projection</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Maintenance Spend (YTD)</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{totalMaintenanceSpendYTD.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Historical Maintenance Ledger</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Attention Required</CardDescription>
            <CardTitle className="text-2xl font-bold">{criticalAssetsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-red-500 font-bold">
              <AlertCircle className="mr-1 h-3 w-3" /> Active repair tickets
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Asset Count by Category</CardTitle>
            <CardDescription>Volume distribution for filtered criteria.</CardDescription>
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
            <CardDescription>Capital investment distribution (INR).</CardDescription>
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
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
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

      {/* New Depreciation Summary Matrix Report */}
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
          <CardDescription>Select a category to generate a comprehensive record based on current filters.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((report, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-4 border rounded-xl hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group"
                onClick={() => handleExport(report.title === "Branch Wise Asset Report" ? 'Excel' : 'PDF', report.title)}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <report.icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{report.title}</h4>
                  <p className="text-xs text-muted-foreground leading-tight mt-1">{report.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
