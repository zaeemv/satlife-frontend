'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  buildSystemHierarchyTree,
  hierarchyTreeToFlow,
  DEFAULT_NODE_FIELD_VISIBILITY,
  type HierarchyEntityType,
  type HierarchyNodeData,
  type HierarchyNodeFieldVisibility,
} from '@/lib/system-hierarchy-graph';
import {
  HierarchyEntityDetailPanel,
  type HierarchyEntitySelection,
} from '@/components/hierarchy-entity-detail-panel';
import {
  HierarchyNodeFieldLines,
  HierarchyNodeLegend,
} from '@/components/hierarchy-node-legend';
import type {
  Component,
  Module,
  Project,
  Status,
  Subsystem,
  System,
  Unit,
} from '@/lib/models';

const LEVEL_STYLES: Record<
  HierarchyEntityType,
  { border: string; badge: string; label: string }
> = {
  system: {
    border: 'border-primary/40',
    badge: 'bg-primary/10 text-primary',
    label: 'System',
  },
  subsystem: {
    border: 'border-sky-400/40',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    label: 'Subsystem',
  },
  module: {
    border: 'border-violet-400/40',
    badge: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    label: 'Module',
  },
  unit: {
    border: 'border-amber-400/40',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    label: 'Unit',
  },
  component: {
    border: 'border-emerald-400/40',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    label: 'Component',
  },
};

function createHierarchyFlowNode(
  onSelect: (entityId: number, type: HierarchyEntityType) => void
) {
  return function HierarchyFlowNode({ data }: NodeProps<Node<HierarchyNodeData>>) {
    const styles = LEVEL_STYLES[data.type];

    return (
      <>
        <Handle type="target" position={Position.Top} className="!bg-muted-foreground/40" />
        <div
          className={cn(
            'w-[220px] rounded-lg border bg-card px-3 py-2.5 shadow-sm',
            styles.border
          )}
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <Badge variant="outline" className={cn('text-[10px] uppercase', styles.badge)}>
              {styles.label}
            </Badge>
            <button
              type="button"
              data-hierarchy-detail-trigger
              className="nodrag nopan flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="View details"
              aria-label={`View details for ${data.label}`}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(data.entityId, data.type);
              }}
            >
              <ChevronRight className="pointer-events-none h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="truncate text-sm font-semibold">{data.label}</p>
          <HierarchyNodeFieldLines data={data} />
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/40" />
      </>
    );
  };
}

interface SystemHierarchyFlowProps {
  system: System;
  subsystems: Subsystem[];
  modules: Module[];
  units: Unit[];
  components: Component[];
  project?: Project;
  statuses?: Status[];
  className?: string;
}

export function SystemHierarchyFlow({
  system,
  subsystems,
  modules,
  units,
  components,
  project,
  statuses = [],
  className,
}: SystemHierarchyFlowProps) {
  const [selection, setSelection] = useState<HierarchyEntitySelection | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fieldVisibility, setFieldVisibility] = useState<HierarchyNodeFieldVisibility>(
    DEFAULT_NODE_FIELD_VISIBILITY
  );

  const handleShowDetails = useCallback((entityId: number, type: HierarchyEntityType) => {
    setSelection({ entityId, type });
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const nodeTypes = useMemo(
    () => ({
      hierarchyNode: createHierarchyFlowNode(handleShowDetails),
    }),
    [handleShowDetails]
  );

  const { nodes, edges } = useMemo(() => {
    const tree = buildSystemHierarchyTree(
      system,
      subsystems,
      modules,
      units,
      components,
      statuses
    );
    const flow = hierarchyTreeToFlow(tree);

    return {
      nodes: flow.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          fieldVisibility,
        },
      })),
      edges: flow.edges,
    };
  }, [system, subsystems, modules, units, components, fieldVisibility, statuses]);

  if (nodes.length <= 1 && edges.length === 0) {
    return (
      <div
        className={cn(
          'flex h-full min-h-[420px] items-center justify-center rounded-lg border border-dashed bg-muted/20',
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          No subsystems found for this system. Add subsystems to build the hierarchy graph.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-[420px] w-full overflow-hidden rounded-lg border bg-muted/10',
        className
      )}
    >
      <div className="relative min-w-0 flex-1">
        <HierarchyNodeLegend
          visibility={fieldVisibility}
          onChange={setFieldVisibility}
        />
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll
            onNodeClick={(event, node) => {
              const target = event.target as HTMLElement;
              if (!target.closest('[data-hierarchy-detail-trigger]')) return;

              const nodeData = node.data as HierarchyNodeData;
              handleShowDetails(nodeData.entityId, nodeData.type);
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeStrokeWidth={3}
              pannable
              zoomable
              className="!bg-background/80"
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <HierarchyEntityDetailPanel
        selection={selection}
        open={panelOpen}
        onClose={handleClosePanel}
        system={system}
        subsystems={subsystems}
        modules={modules}
        units={units}
        components={components}
        project={project}
        statuses={statuses}
      />
    </div>
  );
}
