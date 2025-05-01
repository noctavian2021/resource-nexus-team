
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, useWatch } from 'react-hook-form';

interface VacationSectionProps {
  control: Control<any>;
}

const VacationSection = ({ control }: VacationSectionProps) => {
  // Watch the isOnVacation field to conditionally show date inputs
  const isOnVacation = useWatch({
    control,
    name: "isOnVacation",
    defaultValue: false,
  });

  return (
    <div className="border rounded-md p-3">
      <h3 className="text-md font-medium mb-3">Vacation Information</h3>
      
      <FormField
        control={control}
        name="isOnVacation"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>On Vacation</FormLabel>
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
      
      {isOnVacation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <FormField
            control={control}
            name="vacationStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="vacationEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default VacationSection;
