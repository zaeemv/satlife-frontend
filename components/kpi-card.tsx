"use client";

import { type LucideIcon, TrendingUp, TrendingDown, TrendingUpDown  } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  accentColor: "blue" | "green" | "red" | "amber" | "orange" | "slate";
}

const accentStyles = {
  blue: "border-l-blue-500 dark:border-l-blue-400",
  green: "border-l-emerald-500 dark:border-l-emerald-400",
  red: "border-l-red-500 dark:border-l-red-400",
  amber: "border-l-amber-500 dark:border-l-amber-400",
  orange: "border-l-orange-500 dark:border-l-orange-400",
  slate: "border-l-slate-500 dark:border-l-slate-400",
};

const iconBgStyles = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export function KPICard({ title, value, change, icon: Icon, accentColor }: KPICardProps) {
  const isPositive = change > 0;

  return (
    <Card className={cn("border-l-4 h-full shadow-sm", accentStyles[accentColor])}>
      <CardContent className="flex items-center justify-between p-5 h-28">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-card-foreground">{value}</p>
          <div className="flex items-center gap-1">
            {change > 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ):
            change == 0 ?  (<TrendingUpDown  className="h-3 w-3 text-blue-500" />)
            : 
            ( 
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                change > 0 ? "text-emerald-600 dark:text-emerald-400" : change == 0? "text-blue-600  dark:text-blue-400": "text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? "+" : ""}{change}%
            </span>
          </div>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconBgStyles[accentColor])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
 