
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { MapPin, Plus, Search, Building2, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const INITIAL_BRANCHES = [
  { id: "1", name: "Khodad", code: "KHO", type: "Administrative", location: "Pune, MH" },
  { id: "2", name: "Manjarwadi", code: "MNJ", type: "Logistics", location: "Narayangaon, MH" },
  { id: "3", name: "Sultanpur", code: "SLT", type: "IT Data Center", location: "Pune South, MH" },
  { id: "4", name: "Ghodegaon", code: "GHO", type: "Manufacturing", location: "Ambegaon, MH" },
];

export default function BranchesPage() {
  const [branches, setBranches] = useState(INITIAL_BRANCHES);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <MapPin className="h-8 w-8 text-accent" />
            Branch Master
          </h1>
          <p className="text-muted-foreground">Manage organizational units and geographical locations.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
              <DialogDescription>Input details for a new geographical or organizational node.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input id="name" placeholder="e.g. Pune City Center" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Branch Code</Label>
                  <Input id="code" placeholder="e.g. PCC" maxLength={3} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Operational Type</Label>
                  <Input id="type" placeholder="e.g. Warehouse" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Address / Location</Label>
                <Input id="location" placeholder="e.g. Sector 12, IT Park" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Branch</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by branch name or code..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Details</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary/60" />
                      {branch.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-code">{branch.code}</Badge>
                  </TableCell>
                  <TableCell>{branch.type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{branch.location}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
