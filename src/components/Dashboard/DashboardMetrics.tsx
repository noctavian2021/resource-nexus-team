import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from 'lucide-react';

export interface Metrics {
  title: string;
  value: string | number;
  change: number;
  icon?: React.ReactNode;
}

interface DashboardMetricsProps {
  metrics: Metrics[];
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metric.value}</span>
              <span className="text-xs text-muted-foreground">
                {metric.change > 0 ? (
                  <>
                    <ArrowUp className="inline-block h-4 w-4 text-green-500 mr-1" />
                    +{metric.change}%
                  </>
                ) : (
                  <>
                    <ArrowDown className="inline-block h-4 w-4 text-red-500 mr-1" />
                    {metric.change}%
                  </>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
