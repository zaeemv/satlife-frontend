'use client';

import { useEffect, useState } from 'react';
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
import * as Models from '@/lib/models';

export default function OrdersPage() {
  const { orders, customers, loading, createOrder, updateOrder, deleteOrder } = useDataStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ order_number: '', customer_id: 0, status_id: 0 });
  const [statuses, setStatuses] = useState<Models.Status[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  const filtered = orders.filter((o) => {
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status_id?.toString() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleCreate() {
    if (!formData.order_number.trim() || !formData.customer_id || !formData.status_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createOrder(formData);
      setFormData({ order_number: '', customer_id: 0, status_id: 0 });
      setIsCreateOpen(false);
    } catch {
      // Error handled by DataStore
    }
  }

  async function handleUpdate() {
    if (!editingId) return;
    if (!formData.order_number.trim() || !formData.customer_id || !formData.status_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await updateOrder(editingId, formData);
      setFormData({ order_number: '', customer_id: 0, status_id: 0 });
      setEditingId(null);
      setIsEditOpen(false);
    } catch {
      // Error handled by DataStore
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this order? All related Projects will also get deleted.')) return;
    try {
      await deleteOrder(id);
    } catch {
      // Error handled by DataStore
    }
  }

  function openEdit(order: typeof orders[0]) {
    setEditingId(order.id);
    setFormData({
      order_number: order.order_number,
      customer_id: order.customer_id,
      status_id: order.status_id,
    });
    setIsEditOpen(true);
  }

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await api.statuses.list("Order"); // 👈 filter here
        setStatuses(res.data);
      } catch (err) {
        console.error("Failed to fetch statuses", err);
      } finally {
        setLoadingStatuses(false);
      }
    };

    fetchStatuses();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage all orders</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Order</DialogTitle>
              <DialogDescription>Enter order details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Order Number</Label>
                <Input
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                  placeholder="ORD-001"
                />
              </div>
              <div>
                <Label>Customer</Label>
                <Select
                  value={formData.customer_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, customer_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, status_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Total: {filtered.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => {
                    const customer = customers.find((c) => c.id === order.customer_id);
                    const status = statuses.find((s) => s.id === order.status_id);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{customer?.name || 'N/A'}</TableCell>
                        <TableCell>{status?.name || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(order)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(order.id)}
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
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update order details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Order Number</Label>
              <Input
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                placeholder="ORD-001"
              />
            </div>
            <div>
              <Label>Customer</Label>
              <Select
                value={formData.customer_id.toString()}
                onValueChange={(v) => setFormData({ ...formData, customer_id: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status_id.toString()}
                onValueChange={(v) => setFormData({ ...formData, status_id: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
