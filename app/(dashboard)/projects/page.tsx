'use client';

import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '@/lib/permissions';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Search, Clock, AlertTriangle, Zap, Pause, CheckCircle, Presentation, Asterisk } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/status-badge';
import * as api from '@/lib/api';
import * as Models from '@/lib/models';
import Link from 'next/link';

export default function ProjectsPage(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const { permissions, loading: loadingPerms } = usePermissions();
  const { projects, users, orders, loading, createProject, updateProject, deleteProject, getEntityMaintenanceLogs } = useDataStore();
  const [search, setSearch] = useState('');
  
  // Get status filter from URL params
  const statusFilterParam = searchParams.get('status');
  const [statusFilter, setStatusFilter] = useState<string>(statusFilterParam || 'all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    owner_id: 0,
    order_id: 0,
    status_id: 0,
  });
  const [statuses, setStatuses] = useState<Models.Status[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status?.name === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleCreate() {
    if (!formData.name.trim() || !formData.owner_id  || !formData.order_id || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createProject(formData);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        owner_id: 0,
        order_id: 0,
        status_id: 0,
      });
      setIsCreateOpen(false);
    } catch {
      // Error handled by DataStore
    }
  }

  async function handleUpdate() {
    if (!editingId) return;
    if (!formData.name.trim() || !formData.owner_id || !formData.status_id || !formData.order_id || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await updateProject(editingId, formData);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        owner_id: 0,
        order_id: 0,
        status_id: 0,
      });
      setEditingId(null);
      setIsEditOpen(false);
    } catch {
      // Error handled by DataStore
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure? This will delete associated systems.')) return;
    try {
      await deleteProject(id);  
    } catch {
      // Error handled by DataStore
    }
  }

  function openEdit(project: typeof projects[0]) {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      owner_id: project.owner_id,
      order_id: project.order_id,
      status_id: project.status_id,
    });
    setIsEditOpen(true);
  }
  const icons: Record<string, any> = {
                'Initiation': Clock,
                'Planning': Presentation,
                'Execution': Zap,
                'Monitoring': AlertTriangle,
                'Completed': CheckCircle,
                'On Hold': Pause,
                'all': Asterisk,
              };
  const Icon = icons['all'] || Clock;

  useEffect(() => {
      const fetchStatuses = async () => {
        try {
          const res = await api.statuses.list("projects"); // 👈 filter here
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
  const statusNames = statuses.map((status) => status.name);
  console.log(statusNames)
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-2 text-sm ">Manage satellite lifecycle projects</p>
      </div>

      {/* Status Breakdown */}
      <Card>
        {/* <CardHeader> */}
          {/* <CardTitle>Status Overview</CardTitle> */}
          {/* <CardDescription>Click on a status to filter</CardDescription> */}
        {/* </CardHeader> */}
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 border-4">
            <button
              onClick={() => {
                setStatusFilter('all');
                router.push('/projects');
              }}    
              className="text-left cursor-pointer transition-transform "
            >
              <Card className="hover:shadow-lg">
                <CardContent className="pt-6 flex flex-col ">
                  <Icon className="flex h-3 text-muted-foreground border-2 w-full" />
                  <div className ='flex flex-col items-start justify-between border-2'>                
                        <p className="text-sm font-medium text-muted-foreground top-0 border-2">Total</p>
                  <div className="flex justify-center border-2 w-full">
                      <p className="text-4xl font-bold border-2 w-full">{projects.length}</p>
                  </div>
                  </div>

                </CardContent>
              </Card>
            </button>
            {/* {['Initiation', 'Planning', 'Execution', 'Monitoring', 'Completed', 'On Hold'] */}
            {statusNames.map((s) => {
              const count = projects.filter(p => p.status?.name === s).length;
              console.log(`Status: ${s}, Count: ${count}`, projects);
              const icons: Record<string, any> = {
                'Initiation': Clock,
                'Planning': Presentation,
                'Execution': Zap,
                'Monitoring': AlertTriangle,
                'Completed': CheckCircle,
                'On Hold': Pause,
              };
              const Icon = icons[s] || Clock;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    // router.push(`/projects?status=${encodeURIComponent(s)}`);
                  }}
                  className={`text-left cursor-pointer transition-transform ${statusFilter === s ? '' : ''}`}
                >
                  <Card className={`hover:shadow-lg ${statusFilter === s ? 'bg-accent' : 'h-full'}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{s}</p>
                          <p className="text-2xl font-bold">{count}</p>
                        </div>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Create New Project PoP up Window */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>Set up a new satellite project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Project Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sat-A Lifecycle"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project details"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Owner *</Label>
                <Select
                  value={formData.owner_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, owner_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.full_name}
                      </SelectItem>
                    ))
                  }
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Order</Label>
                <Select
                  value={formData.order_id.toString()}
                  onValueChange={(v) => setFormData({ ...formData, order_id: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((o) => (
                      <SelectItem key={o.id} value={o.id.toString()}>
                        {o.order_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status *</Label>
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
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Total: {filtered.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>% Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((project) => {
                    const owner = users.find((u) => u.id === project.owner_id);
                    const status = statuses.find((s) => s.id === project.status_id);
                    return (
                      <TableRow key={project.id}   onClick={() => router.push(`/projects/${project.id}`)}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{owner?.full_name || 'N/A'}</TableCell>
                        <TableCell><StatusBadge status={status?.name || 'Unknown'} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(project.start_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(project.end_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground ">10%</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation()
                                openEdit(project)}}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => { e.stopPropagation();handleDelete(project.id)}}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        {/* <Link href={`/projects/${project.id}`} className="absolute inset-0" /> */}
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
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Project name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project details"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Owner</Label>
              <Select
                value={formData.owner_id.toString()}
                onValueChange={(v) => setFormData({ ...formData, owner_id: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label>Status</Label>
              <Select
                value={formData.status_id.toString()}
                onValueChange={(v) => setFormData({ ...formData, status_id: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
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
