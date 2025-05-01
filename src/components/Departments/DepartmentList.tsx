
import React from 'react';
import DepartmentCard from './DepartmentCard';
import { Department } from '@/data/mockData';

interface DepartmentListProps {
  departments: Department[];
  onDepartmentUpdated: () => void;
}

export default function DepartmentList({ departments, onDepartmentUpdated }: DepartmentListProps) {
  // Ensure departments is an array
  const departmentsArray = Array.isArray(departments) ? departments : [];
  
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {departmentsArray.map((department) => (
        <DepartmentCard 
          key={department.id} 
          department={department} 
          onDepartmentUpdated={onDepartmentUpdated}
        />
      ))}
    </div>
  );
}
