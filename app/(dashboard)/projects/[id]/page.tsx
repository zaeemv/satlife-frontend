"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Layers, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StatusBadge } from "@/components/status-badge";
import { SystemTree } from "@/components/system-tree";
import { MaintenanceTimeline } from "@/components/maintenanceLogs-timeline";
import { projects, systems, maintenanceLogs, orders } from "@/lib/dummy-data";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = projects.find((p) => p.id === projectId);
  const [maintenanceModal, setMaintenanceModal] = useState<{
    entityId: string;
    entityName: string;
  } | null>(null);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Project Not Found</h2>
        <Link href="/projects" className="mt-2 text-sm text-primary underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const projectSystems = systems.filter((s) =>
    project.systemIds.includes(s.id)
  );
  const order = orders.find((o) => o.id === project.orderId);
  const projectMaintenanceLogs = maintenanceLogs.filter(
    (m) => m.projectId === project.id
  );

  const entityLogs = maintenanceModal
    ? maintenanceLogs.filter(
        (m) =>
          m.entityId === maintenanceModal.entityId ||
          m.entityName === maintenanceModal.entityName
      )
    : [];

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/projects">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
          <p className="text-sm font-mono text-muted-foreground">{project.id}</p>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Order</p>
              <p className="text-sm font-medium text-foreground">{order?.description || project.orderId}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivery Date</p>
              <p className="text-sm font-medium text-foreground">{project.deliveryDate}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Systems</p>
              <p className="text-sm font-medium text-foreground">{projectSystems.length} assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={project.status} className="mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Hierarchy Tree */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">
            System Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SystemTree
            systems={projectSystems}
            onShowMaintenance={(entityId, entityName) =>
              setMaintenanceModal({ entityId, entityName })
            }
          />
        </CardContent>
      </Card>

      {/* Project maintenanceLogs Logs */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">
            maintenanceLogs History ({projectMaintenanceLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MaintenanceTimeline logs={projectMaintenanceLogs} />
        </CardContent>
      </Card>

      {/* Entity maintenanceLogs Modal */}
      <Dialog
        open={!!maintenanceModal}
        onOpenChange={() => setMaintenanceModal(null)}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              maintenanceLogs: {maintenanceModal?.entityName}
            </DialogTitle>
          </DialogHeader>
          <MaintenanceTimeline logs={entityLogs} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
