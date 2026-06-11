
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tags, Plus, Trash2, Edit2, Calculator } from "lucide-react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

type DepreciationMethod = "WDV" | "Straight Line" | "Purchase Amount";

interface Category {
  id: string;
  name: string;
  rate: string;
  life: string;
  method: DepreciationMethod;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: "1", name: "Buildings", rate: "5%", life: "20 Years", method: "WDV" },
  { id: "2", name: "Vehicles", rate: "15%", life: "8 Years", method: "WDV" },
  { id: "3", name: "Electronics Machinery", rate: "15%", life: "10 Years", method: "WDV" },
  { id: "4", name: "IT Equipment", rate: "33.33%", life: "3 Years", method: "Straight Line" },
  { id: "5", name: "Furniture", rate: "10%", life: "10 Years", method: "WDV" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState<Category>({ id: "", name: "", rate: "", life: "", method: "WDV" });
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormState({ id: "", name: "", rate: "", life: "", method: "WDV" });
    setIsOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Asset Category" : "Add Asset Category"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update the details for this asset class." : "Define a new asset class with its corresponding depreciation parameters."}
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
                
                <div className="grid gap-2">
                  <Label htmlFor="method">Depreciation Method</Label>
                  <Select 
                    value={formState.method} 
                    onValueChange={(val: DepreciationMethod) => setFormState({ ...formState, method: val })}
                  >
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WDV">Written Down Value (WDV)</SelectItem>
                      <SelectItem value="Straight Line">Straight Line Method</SelectItem>
                      <SelectItem value="Purchase Amount">Purchase Amount (Flat)</SelectItem>
                    </SelectContent>
                  </Select>
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
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Category Name</TableHead>
                <TableHead className="font-bold">Method</TableHead>
                <TableHead className="font-bold">Rate</TableHead>
                <TableHead className="font-bold">Expected Life</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-bold">{cat.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calculator className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{cat.method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{cat.rate}</Badge>
                    </TableCell>
                    <TableCell>{cat.life}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-accent/20"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
