
import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import DepartmentList from '@/components/Departments/DepartmentList';
import AddDepartmentDialog from '@/components/Departments/AddDepartmentDialog';
import { getDepartments } from '@/services/departmentService';
import { Department } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getDepartments();
      // Ensure we're working with an array
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('There was a problem loading the departments.');
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

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDepartmentUpdated = () => {
    fetchDepartments();
  };

  // Filter departments based on visibility
  const filteredDepartments = departments.filter(
    department => showHidden || !department.isHidden
  );

  return (
    <>
      <Header title="Departments" />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-hidden" 
                checked={showHidden}
                onCheckedChange={setShowHidden}
              />
              <Label htmlFor="show-hidden">Show Hidden</Label>
            </div>
            <AddDepartmentDialog onDepartmentAdded={handleDepartmentUpdated} />
          </div>
        </div>
        
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading departments...</span>
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-destructive/50 p-8 text-center">
            <p className="text-destructive">{error}</p>
            <button 
              onClick={fetchDepartments} 
              className="mt-4 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <DepartmentList 
            departments={filteredDepartments}
            onDepartmentUpdated={handleDepartmentUpdated}
          />
        )}
      </main>
    </>
  );
}
