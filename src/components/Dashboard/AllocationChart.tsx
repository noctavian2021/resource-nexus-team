
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AllocationData } from '@/data/mockData';

interface AllocationChartProps {
  data: AllocationData[];
}

export default function AllocationChart({ data }: AllocationChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Resource Allocation by Department</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis tickFormatter={(tick) => `${tick}%`} />
              <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
              <Legend />
              <Bar dataKey="allocated" name="Allocated" fill="#3b82f6" />
              <Bar dataKey="available" name="Available" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
