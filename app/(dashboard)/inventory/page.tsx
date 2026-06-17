'use client';

import { useState, useEffect } from 'react';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/lib/api';
import type { Hierarchy } from '@/lib/models';

export default function InventoryPage() {
  const { inventory, components, loading, createInventoryItem, updateInventoryItem, deleteInventoryItem } = useDataStore();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [componentHierarchyNames, setComponentHierarchyNames] = useState<Hierarchy[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  const [formData, setFormData] = useState({
    component_id: 0,
    quantity: 0,
    location: '',
  });

  // Fetch component hierarchy
  useEffect(() => {
    const fetchComponentHierarchy = async () => {
      try {
        const res = await api.hierarchies.list('component');
        console.log('Fetched component hierarchy:', res.data);
        setComponentHierarchyNames(res.data);
      } catch (err) {
        console.error('Failed to fetch component hierarchy', err);
      }
    };
    fetchComponentHierarchy();
  }, []);

  const filtered = inventory.filter((item) =>
    components.find((c) => c.id === item.component_id)?.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    console.log('Form data:', formData, 'Selected component ID:', selectedComponentId);
    const quantity = Number(formData.quantity);
    if (!formData.component_id || !selectedComponentId.trim() || isNaN(quantity) || quantity <= 0 || !formData.location.trim()) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }
    try {
      await createInventoryItem(formData);
      setFormData({ component_id: 0, quantity: 0, location: '' });
      setSelectedComponentId('');
      setIsCreateOpen(false);
    } catch {
      // Error handled by DataStore
    }
  }

  async function handleUpdate() {
    if (!editingId) return;
    const quantity = Number(formData.quantity);
    if (!formData.component_id || !selectedComponentId.trim() || isNaN(quantity) || quantity <= 0 || !formData.location.trim()) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }
    try {
      await updateInventoryItem(editingId, formData);
      setFormData({ component_id: 0, quantity: 0, location: '' });
      setSelectedComponentId('');
      setEditingId(null);
      setIsEditOpen(false);
    } catch {
      // Error handled by DataStore
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      await deleteInventoryItem(id);
    } catch {
      // Error handled by DataStore
    }
  }

  function openEdit(item: typeof inventory[0]) {
    setEditingId(item.id);
    const hierarchyItem = componentHierarchyNames.find((h) => h.id === item.component_id);
    setSelectedComponentId(hierarchyItem?.id.toString() || '');
    setFormData({
      component_id: item.component_id,
      quantity: item.quantity,
      location: item.location,
    });
    setIsEditOpen(true);
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground mt-2">Track component inventory and stock levels</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by serial number or component..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Register a new component in inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Component *</Label>
                <Select
                  value={selectedComponentId}
                  onValueChange={(hierarchyId) => {
                    console.log('Selected hierarchy ID:', hierarchyId);
                    const hierarchy = componentHierarchyNames.find((h) => h.id === Number(hierarchyId));
                    console.log('Found hierarchy:', hierarchy);
                    if (hierarchy) {
                      setSelectedComponentId(hierarchyId);
                      // Use hierarchy.id as component_id
                      setFormData({ ...formData, component_id: hierarchy.id });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentHierarchyNames.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No components available</div>
                    ) : (
                      componentHierarchyNames.map((hierarchy) => (
                        <SelectItem key={hierarchy.id} value={hierarchy.id.toString()}>
                          {hierarchy.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    setFormData({ ...formData, quantity: isNaN(val) ? 0 : val });
                  }}
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label>Location *</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Warehouse A, Shelf 3"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Add</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Total items: {filtered.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => {
                    const component = components.find((c) => c.id === item.component_id);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{component?.name || 'N/A'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update inventory details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Component</Label>
              <Select
                value={selectedComponentId}
                onValueChange={(hierarchyId) => {
                  const hierarchy = componentHierarchyNames.find((h) => h.id === Number(hierarchyId));
                  if (hierarchy) {
                    setSelectedComponentId(hierarchyId);
                    setFormData({ ...formData, component_id: hierarchy.id });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select component" />
                </SelectTrigger>
                <SelectContent>
                  {componentHierarchyNames.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No components available</div>
                  ) : (
                    componentHierarchyNames.map((hierarchy) => (
                      <SelectItem key={hierarchy.id} value={hierarchy.id.toString()}>
                        {hierarchy.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  setFormData({ ...formData, quantity: isNaN(val) ? 0 : val });
                }}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
