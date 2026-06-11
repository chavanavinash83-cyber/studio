
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tags, Plus, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const INITIAL_CATEGORIES = [
  { id: "1", name: "Buildings", rate: "5%", life: "20 Years" },
  { id: "2", name: "Vehicles", rate: "15%", life: "8 Years" },
  { id: "3", name: "Electronics Machinery", rate: "15%", life: "10 Years" },
  { id: "4", name: "IT Equipment", rate: "33.33%", life: "3 Years" },
  { id: "5", name: "Furniture", rate: "10%", life: "10 Years" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState({ id: "", name: "", rate: "", life: "" });
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormState({ id: "", name: "", rate: "", life: "" });
    setIsOpen(true);
  };

  const handleOpenEdit = (category: typeof INITIAL_CATEGORIES[0]) => {
    setIsEditing(true);
    setFormState(category);
    setIsOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) return;

    if (isEditing) {
      setCategories(categories.map(c => c.id === formState.id ? formState : c));
    } else {
      const categoryToAdd = {
        ...formState,
        id: Math.random().toString(36).substr(2, 9),
      };
      setCategories([...categories, categoryToAdd]);
    }

    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

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
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={handleOpenAdd} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Asset Category" : "Add Asset Category"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update the details for this asset class." : "Define a new asset class with its corresponding depreciation rate and useful life."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveCategory}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Office Equipment" 
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rate">Depreciation Rate (%)</Label>
                    <Input 
                      id="rate" 
                      placeholder="e.g. 10%" 
                      value={formState.rate}
                      onChange={(e) => setFormState({ ...formState, rate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="life">Expected Life</Label>
                    <Input 
                      id="life" 
                      placeholder="e.g. 5 Years" 
                      value={formState.life}
                      onChange={(e) => setFormState({ ...formState, life: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{isEditing ? "Update Category" : "Save Category"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-bold">{cat.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-primary border-primary/20">{cat.rate}</Badge>
                    </TableCell>
                    <TableCell>{cat.life}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(cat.id)}
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
                    No categories defined yet.
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
