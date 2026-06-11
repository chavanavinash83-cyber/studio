"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_ASSETS } from "../lib/mock-data";
import { 
  BarChart3, 
  Download, 
  Filter, 
  FileText,
  TrendingUp,
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
  X
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { toast } = useToast();
  
  // Filter States
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Derived Filtered Data
  const filteredAssets = useMemo(() => {
    return MOCK_ASSETS.filter(asset => {
      const matchesBranch = branchFilter === "all" || asset.location === branchFilter;
      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      return matchesBranch && matchesCategory;
    });
  }, [branchFilter, categoryFilter]);

  // Aggregations based on filtered data
  const categoryData = useMemo(() => {
    const categories = ["Buildings", "Vehicles", "IT Equipment", "Electronics Machinery"];
    return categories.map(cat => ({
      name: cat,
      value: filteredAssets.filter(a => a.category === cat).length
    })).filter(item => item.value > 0);
  }, [filteredAssets]);

  const valueByBranch = useMemo(() => {
    const branches = ["Khodad", "Manjarwadi", "Sultanpur", "Ghodegaon"];
    return branches.map(branch => ({
      name: branch,
      value: filteredAssets.filter(a => a.location === branch).reduce((s, a) => s + a.purchaseValue, 0)
    })).filter(item => item.value > 0);
  }, [filteredAssets]);

  const totalAcquisition = filteredAssets.reduce((s, a) => s + a.purchaseValue, 0);
  const netBookValue = filteredAssets.reduce((s, a) => s + a.currentBookValue, 0);
  const criticalAssetsCount = filteredAssets.filter(a => a.status === 'Under Repair').length;

  const maintenanceData = [
    { month: 'Jan', cost: 45000 },
    { month: 'Feb', cost: 52000 },
    { month: 'Mar', cost: 38000 },
    { month: 'Apr', cost: 65000 },
    { month: 'May', cost: 48000 },
    { month: 'Jun', cost: 72000 },
  ];

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

      if (type === 'Excel') {
        const headers = "ID,Name,SerialNumber,Category,Location,PurchaseValue,BookValue\n";
        const rows = filteredAssets.map(a => 
          `${a.id},${a.name},${a.serialNumber},${a.category},${a.location},${a.purchaseValue},${a.currentBookValue}`
        ).join("\n");
        content = headers + rows;
        fileName += ".csv";
        mimeType = "text/csv";
      } else {
        content = `SAMPATTIPRO - ${reportName}\n`;
        content += `Filters: Branch: ${branchFilter}, Category: ${categoryFilter}\n`;
        content += `Generated on: ${new Date().toLocaleString()}\n`;
        content += `-------------------------------------------\n\n`;
        filteredAssets.forEach(a => {
          content += `Asset: ${a.name} (${a.id})\n`;
          content += `Location: ${a.location} | Category: ${a.category}\n`;
          content += `Value: ₹${a.currentBookValue.toLocaleString()}\n`;
          content += `-------------------------------------------\n`;
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
    { title: "Branch Wise Asset Report", desc: "Detailed breakdown of assets grouped by geographical locations.", icon: MapPin },
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

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-accent" />
            System Reports
          </h1>
          <p className="text-muted-foreground">Detailed analytics and financial summaries for asset management.</p>
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
                      <SelectItem value="Khodad">Khodad</SelectItem>
                      <SelectItem value="Manjarwadi">Manjarwadi</SelectItem>
                      <SelectItem value="Sultanpur">Sultanpur</SelectItem>
                      <SelectItem value="Ghodegaon">Ghodegaon</SelectItem>
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
                      <SelectItem value="Buildings">Buildings</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                      <SelectItem value="Electronics Machinery">Electronics Machinery</SelectItem>
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
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase">Filtered Acquisition Cost</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{totalAcquisition.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              Based on {filteredAssets.length} assets
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase">Net Book Value</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{netBookValue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Current Written Down Value (WDV)</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase">Maintenance Spend (YTD)</CardDescription>
            <CardTitle className="text-2xl font-bold">₹3,20,000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Total repairs (Historical Global)</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase">Anomalies Detected</CardDescription>
            <CardTitle className="text-2xl font-bold">{criticalAssetsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-red-500 font-bold">
              <AlertCircle className="mr-1 h-3 w-3" /> Assets under repair
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Asset Count by Category</CardTitle>
            <CardDescription>Volume distribution for current selection.</CardDescription>
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
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data for selected filters</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Acquisition Value by Branch</CardTitle>
            <CardDescription>Capital investment distribution (INR).</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {valueByBranch.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueByBranch} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-lg">Monthly Maintenance Trends</CardTitle>
              <CardDescription>Visualizing repair costs (Global Historical Trends).</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="2024">
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintenanceData}>
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Cost']}
              />
              <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
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
                onClick={() => handleExport('PDF', report.title)}
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
