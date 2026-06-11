
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  UserCircle, 
  Hash 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_DEPARTMENTS = [
  { id: "1", name: "Administration", head: "John Doe", costCenter: "CC-001" },
  { id: "2", name: "Logistics", head: "Jane Smith", costCenter: "CC-012" },
  { id: "3", name: "IT Operations", head: "Robert Wilson", costCenter: "CC-IT" },
  { id: "4", name: "Manufacturing", head: "David Brown", costCenter: "CC-MFG" },
  { id: "5", name: "Real Estate", head: "Sarah Miller", costCenter: "CC-RE" },
];

interface Department {
  id: string;
  name: string;
  head: string;
  costCenter: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDept, setCurrentDept] = useState<Department>({
    id: "",
    name: "",
    head: "",
    costCenter: "",
  });

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.costCenter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentDept({ id: "", name: "", head: "", costCenter: "" });
    setIsOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setIsEditing(true);
    setCurrentDept(dept);
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDept.name || !currentDept.costCenter) return;

    if (isEditing) {
      setDepartments(departments.map(d => d.id === currentDept.id ? currentDept : d));
    } else {
      const newDept = {
        ...currentDept,
        id: Math.random().toString(36).substr(2, 9),
      };
      setDepartments([...departments, newDept]);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-accent" />
            Departments
          </h1>
          <p className="text-muted-foreground">Organizational departments and cost center management.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Department
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Department" : "Add New Department"}</DialogTitle>
              <DialogDescription>
                Fill in the details for the organizational unit and its reporting head.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Department Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Quality Assurance" 
                    value={currentDept.name}
                    onChange={(e) => setCurrentDept({ ...currentDept, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="head">Department Head</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="head" 
                      className="pl-10"
                      placeholder="e.g. John Wick" 
                      value={currentDept.head}
                      onChange={(e) => setCurrentDept({ ...currentDept, head: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="costCenter">Cost Center Code</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="costCenter" 
                      className="pl-10"
                      placeholder="e.g. CC-QA-001" 
                      value={currentDept.costCenter}
                      onChange={(e) => setCurrentDept({ ...currentDept, costCenter: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{isEditing ? "Update Department" : "Save Department"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, head or cost center..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Dept Name</TableHead>
                <TableHead className="font-bold">Dept Head</TableHead>
                <TableHead className="font-bold">Cost Center</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <TableRow key={dept.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary/60" />
                        {dept.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        {dept.head || "Not Assigned"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-code text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                        {dept.costCenter}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-accent/20"
                          onClick={() => handleOpenEdit(dept)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(dept.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No departments found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
