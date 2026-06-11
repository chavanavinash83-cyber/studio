
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Plus, Trash2, Edit2 } from "lucide-react";

const DEPARTMENTS = [
  { id: "1", name: "Administration", head: "John Doe", costCenter: "CC-001" },
  { id: "2", name: "Logistics", head: "Jane Smith", costCenter: "CC-012" },
  { id: "3", name: "IT Operations", head: "Robert Wilson", costCenter: "CC-IT" },
  { id: "4", name: "Manufacturing", head: "David Brown", costCenter: "CC-MFG" },
  { id: "5", name: "Real Estate", head: "Sarah Miller", costCenter: "CC-RE" },
];

export default function DepartmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-accent" />
            Departments
          </h1>
          <p className="text-muted-foreground">Organizational departments and cost center management.</p>
        </div>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-2" /> Add Department
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dept Name</TableHead>
                <TableHead>Dept Head</TableHead>
                <TableHead>Cost Center</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEPARTMENTS.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.head}</TableCell>
                  <TableCell className="font-code text-xs">{dept.costCenter}</TableCell>
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
