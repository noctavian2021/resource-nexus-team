
import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import DepartmentList from '@/components/Departments/DepartmentList';
import AddDepartmentDialog from '@/components/Departments/AddDepartmentDialog';
import { getDepartments } from '@/services/departmentService';
import { Department } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        // Ensure we're working with an array
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast({
          title: "Error loading departments",
          description: "There was a problem loading the departments. Please try again.",
          variant: "destructive"
        });
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [toast]);

  return (
    <>
      <Header title="Departments" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <AddDepartmentDialog />
        </div>
        
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Loading departments...</p>
          </div>
        ) : (
          <DepartmentList departments={departments} />
        )}
      </main>
    </>
  );
}
