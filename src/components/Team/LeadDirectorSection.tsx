
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

interface LeadDirectorSectionProps {
  control: Control<any>;
  isAdmin: boolean;
}

const LeadDirectorSection = ({ control, isAdmin }: LeadDirectorSectionProps) => {
  // Only render for admins
  if (!isAdmin) return null;

  return (
    <div className="border rounded-md p-3 space-y-4">
      <h3 className="text-md font-medium">Leadership Role</h3>
      
      <FormField
        control={control}
        name="isLead"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Department Lead</FormLabel>
              <FormDescription>
                Assign this member as a department lead.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="isDirector"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Director</FormLabel>
              <FormDescription>
                Assign this member as a director.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default LeadDirectorSection;
