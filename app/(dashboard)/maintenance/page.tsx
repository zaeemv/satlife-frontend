'use client';

import { useState } from 'react';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const { maintenance, components, users, loading, createMaintenance } = useDataStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<typeof maintenance[0] | null>(null);
  const [formData, setFormData] = useState({
    component_id: 0,
    technician_id: 0,
    description: '',
    maintenance_type: 'preventive',
  });

  const filtered = maintenance.filter((log) => {
    const component = components.find((c) => c.id === log.component_id);
    const matchesSearch =
      component?.name.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.maintenance_type === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleCreate() {
    if (!formData.component_id || !formData.technician_id || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createMaintenance(formData);
      setFormData({
        component_id: 0,
        technician_id: 0,
        description: '',
        maintenance_type: 'preventive',
      });
      setIsCreateOpen(false);
    } catch {
      // Error handled by DataStore
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
        <p className="text-muted-foreground mt-2">Track component maintenance history</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by component or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="preventive">Preventive</SelectItem>
            <SelectItem value="corrective">Corrective</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Log Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Maintenance</DialogTitle>
              <DialogDescription>Record a maintenance activity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Component *</Label>
                <Select
                  value={formData.component_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, component_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type *</Label>
                <Select
                  value={formData.maintenance_type}
                  onValueChange={(v) => setFormData({ ...formData, maintenance_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Technician *</Label>
                <Select
                  value={formData.technician_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, technician_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Maintenance details"
                  className="h-20"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Log</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>Total records: {filtered.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No maintenance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((log) => {
                    const component = components.find((c) => c.id === log.component_id);
                    const technician = users.find((u) => u.id === log.technician_id);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{component?.name || 'N/A'}</TableCell>
                        <TableCell className="capitalize">{log.maintenance_type}</TableCell>
                        <TableCell>{technician?.full_name || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Maintenance Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <Label>Component</Label>
                <p className="text-sm">{components.find((c) => c.id === selectedLog.component_id)?.name}</p>
              </div>
              <div>
                <Label>Type</Label>
                <p className="text-sm capitalize">{selectedLog.maintenance_type}</p>
              </div>
              <div>
                <Label>Technician</Label>
                <p className="text-sm">{users.find((u) => u.id === selectedLog.technician_id)?.full_name}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p className="text-sm">{new Date(selectedLog.created_at).toLocaleString()}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedLog.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
