
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Shield, UserCircle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const USERS = [
  { id: "1", name: "Admin User", email: "admin@sampatti.pro", role: "Super Admin", access: "All Branches" },
  { id: "2", name: "Rahul Deshmukh", email: "rahul.d@kho.com", role: "Branch Manager", access: "Khodad" },
  { id: "3", name: "Anita Kulkarni", email: "anita.k@mnj.com", role: "Auditor", access: "Manjarwadi, Ghodegaon" },
  { id: "4", name: "Vikram Singh", email: "vikram@slt.com", role: "IT Admin", access: "Sultanpur" },
];

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline flex items-center gap-2">
            <Users className="h-8 w-8 text-accent" />
            System Users
          </h1>
          <p className="text-muted-foreground">Manage administrative access and branch permissions.</p>
        </div>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Super Admin" ? "default" : "secondary"}>
                      <Shield className="h-3 w-3 mr-1" /> {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <MapPin className="h-3 w-3 text-primary" />
                      {user.access}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Manage Access</Button>
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
