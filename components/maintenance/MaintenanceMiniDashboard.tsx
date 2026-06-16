'use client';

import React from 'react';
import { KPICard } from '@/components/kpi-card';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Wrench, Package, Clock, Lock, type LucideIcon } from 'lucide-react';
import type { MaintenanceCase } from '@/lib/models';

interface StatusCount {
  status: string;
  count: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'amber' | 'orange' | 'slate';
}

interface MaintenanceMiniDashboardProps {
  cases: MaintenanceCase[];
  onStatusFilter?: (status: string) => void;
}

export function MaintenanceMiniDashboard({cases, onStatusFilter}: MaintenanceMiniDashboardProps) {
  const totalCount = cases.length;
  
  const statusCounts: StatusCount[] = [
    {
      status: 'Total',
      count: totalCount,
      icon: Package,
      color: 'blue',
    },
    {
      status: 'open',
      count: cases.filter((c) => c.status === 'open').length,
      icon: AlertCircle,
      color: 'blue',
    },
    {
      status: 'under_inspection',
      count: cases.filter((c) => c.status === 'under_inspection').length,
      icon: Wrench,
      color: 'amber',
    },
    {
      status: 'under_repair',
      count: cases.filter((c) => c.status === 'under_repair').length,
      icon: Wrench,
      color: 'orange',
    },
    {
      status: 'resolved',
      count: cases.filter((c) => c.status === 'resolved').length,
      icon: CheckCircle2,
      color: 'green',
    },
    {
      status: 'closed',
      count: cases.filter((c) => c.status === 'closed').length,
      icon: Lock,
      color: 'slate',
    },
  ];

  const handleStatusClick = (status: string) => {
    if (onStatusFilter) {
      onStatusFilter(status);
    }
  };

  return (
    <div className="">
        {/* <div>
          <KPICard
            title="Total Cases"
            value={totalCount}
            change={0}
            icon={Package}
            accentColor="blue"
          />
        </div> */}
          

          {statusCounts.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-6 border-4 items-stretch">
            {statusCounts.map((item) => (
              <button
                key={item.status}
                
                onClick={() => item.status === 'Total' ? handleStatusClick('all') : handleStatusClick(item.status)}
                className="w-full h-full cursor-pointer transition-transform hover:scale-105 "
              >
                <div className = "h-full w-full">

                
                <KPICard
                  title={item.status.replace(/_/g, ' ').charAt(0).toUpperCase() + item.status.replace(/_/g, ' ').slice(1)}
                  value={item.count}
                  change={0}
                  icon={item.icon}
                  accentColor={item.color}
                />
                </div>
              </button>
            ))}
          </div>
      )}
    </div>
  );
}




  // return (
  //   <div className="flex space-y-4">
  //     <Card className="p-3 border">
  //       <h3 className="text-lg font-semibold mb-2">Overview</h3>
  //       <div className="grid grid-cols-1 gap-2">
  //         <KPICard
  //           title="Total Cases"
  //           value={totalCount}
  //           change={0}
  //           icon={Package}
  //           accentColor="blue"
  //         />
  //       </div>
  //     </Card>

  //     {statusCounts.length > 0 && (
  //       <Card className="p-6">
  //         <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  //           {statusCounts.map((item) => (
  //             <button
  //               key={item.status}
  //               onClick={() => handleStatusClick(item.status)}
  //               className="cursor-pointer transition-transform hover:scale-105"
  //             >
  //               <KPICard
  //                 title={item.status.replace(/_/g, ' ').charAt(0).toUpperCase() + item.status.replace(/_/g, ' ').slice(1)}
  //                 value={item.count}
  //                 change={0}
  //                 icon={item.icon}
  //                 accentColor={item.color}
  //               />
  //             </button>
  //           ))}
  //         </div>
  //       </Card>
  //     )}
  //   </div>
  // );