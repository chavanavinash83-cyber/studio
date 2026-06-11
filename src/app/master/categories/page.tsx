
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tags, Plus, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: "1", name: "Buildings", rate: "5%", life: "20 Years" },
  { id: "2", name: "Vehicles", rate: "15%", life: "8 Years" },
  { id: "3", name: "Electronics Machinery", rate: "15%", life: "10 Years" },
  { id: "4", name: "IT Equipment", rate: "33.33%", life: "3 Years" },
  { id: "5", name: "Furniture", rate: "10%", life: "10 Years" },
];

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <Tags className="h-8 w-8 text-accent" />
            Asset Categories
          </h1>
          <p className="text-muted-foreground">Define asset classes and their depreciation schedules.</p>
        </div>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Depreciation Rate (WDV)</TableHead>
                <TableHead>Expected Life</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CATEGORIES.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-bold">{cat.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-primary border-primary/20">{cat.rate}</Badge>
                  </TableCell>
                  <TableCell>{cat.life}</TableCell>
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
