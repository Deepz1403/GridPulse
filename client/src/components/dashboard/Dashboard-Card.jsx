import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardCard({
  title,
  description,
  children,
  className,
  fullHeight = false,
  rightContent = null,
}) {
  return (
    <Card className={cn("h-full", className, fullHeight ? 'h-full' : '')}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {rightContent}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  icon,
  className,
}) {
  const trendColor = trend?.value > 0 ? 'text-green-500' : trend?.value < 0 ? 'text-red-500' : 'text-gray-400';

  const formattedValue = typeof value === 'number' 
  ? value >= 10000 
    ? (value / 1000).toFixed(1) + 'k' 
    : value.toLocaleString() 
  : value;

  return (
    <DashboardCard title={title} className={className}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-end gap-1">
            <div className="text-3xl font-bold tracking-tight">{formattedValue}</div>
            {unit && <div className="text-sm text-[#94A3B8] mb-1">{unit}</div>}
          </div>
          {trend && (
            <div className={`flex items-center mt-1 text-xs ${trendColor}`}>
               <span>{trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'} {Math.abs(trend.value).toFixed(1)}%</span>
              <span className="ml-1 text-[#94A3B8]">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && <div className="p-2 rounded-md bg-[#5FB1E8]/10 text-[#5FB1E8]">{icon}</div>}
      </div>
    </DashboardCard>
  );
}