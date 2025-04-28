
import React from 'react';
import Header from '@/components/Layout/Header';
import DepartmentList from '@/components/Departments/DepartmentList';
import { departments } from '@/data/mockData';
import AddDepartmentDialog from '@/components/Departments/AddDepartmentDialog';

export default function Departments() {
  return (
    <>
      <Header title="Departments" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <AddDepartmentDialog />
        </div>
        
        <DepartmentList departments={departments} />
      </main>
    </>
  );
}
