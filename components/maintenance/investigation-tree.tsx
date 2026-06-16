'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FaultyEntity } from '@/lib/models';

interface InvestigationTreeNode {
  id: number;
  part_number: string;
  display_name: string;
  status: string;
  children?: InvestigationTreeNode[];
}

interface InvestigationTreeProps {
  nodes: InvestigationTreeNode[];
  onSelect?: (node: InvestigationTreeNode) => void;
  onMarkHealthy?: (node: InvestigationTreeNode) => void;
}

function TreeNode({ node, onSelect, onMarkHealthy }: { node: InvestigationTreeNode; onSelect?: (node: InvestigationTreeNode) => void; onMarkHealthy?: (node: InvestigationTreeNode) => void }) {
  const [open, setOpen] = useState(false);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        {hasChildren ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => setOpen((prev) => !prev)}>
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <div className="h-8 w-8" />
        )}
        <div className="flex-1">
          <p className="font-medium">{node.display_name}</p>
          <p className="text-sm text-muted-foreground">{node.part_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onSelect?.(node)}>
            Inspect
          </Button>
          {onMarkHealthy && (
            <Button variant="secondary" size="sm" onClick={() => onMarkHealthy(node)}>
              Mark Healthy
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">Status: {node.status}</div>
      {hasChildren && open ? (
        <div className="ml-8 mt-4 space-y-3">
          {node.children?.map((child) => (
            <TreeNode key={child.id} node={child} onSelect={onSelect} onMarkHealthy={onMarkHealthy} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function InvestigationTree({ nodes, onSelect, onMarkHealthy }: InvestigationTreeProps) {
  if (!nodes || nodes.length === 0) {
    return <p className="text-sm text-muted-foreground">No hierarchy data available for this case.</p>;
  }

  return (
    <div className="space-y-3">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} onSelect={onSelect} onMarkHealthy={onMarkHealthy} />
      ))}
    </div>
  );
}
