
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store, Plus, Trash2, Edit2, Phone, Mail } from "lucide-react";

const VENDORS = [
  { id: "1", name: "Global Construction Corp", category: "Infrastructure", contact: "+91 98XXX XXX01", email: "info@gcc.com" },
  { id: "2", name: "Swift Motors", category: "Fleet", contact: "+91 98XXX XXX02", email: "service@swift.in" },
  { id: "3", name: "Dell Enterprise", category: "IT Hardware", contact: "+91 98XXX XXX03", email: "support@dell.com" },
  { id: "4", name: "Precision Tools Ltd", category: "Machinery", contact: "+91 98XXX XXX04", email: "sales@prectools.com" },
];

export default function VendorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <Store className="h-8 w-8 text-accent" />
            Vendors & Suppliers
          </h1>
          <p className="text-muted-foreground">Primary vendors for asset procurement and maintenance.</p>
        </div>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-2" /> Add Vendor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VENDORS.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {vendor.contact}</span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {vendor.email}</span>
                    </div>
                  </TableCell>
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
