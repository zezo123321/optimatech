import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon, trend, trendUp, className }: StatsCardProps) {
  return (
    <div className={cn("dashboard-card p-6 flex flex-col justify-between h-full bg-white", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold font-display tracking-tight text-foreground">{value}</h3>
        </div>
        <div className="p-3 bg-primary/5 rounded-xl text-primary">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium">
          <span className={cn("px-2 py-1 rounded-full", trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
            {trend}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}
