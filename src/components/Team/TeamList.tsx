
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TeamMemberCard from './TeamMemberCard';
import { TeamMember, departments } from '@/data/mockData';

interface TeamListProps {
  teamMembers: TeamMember[];
  onMemberUpdated: (updatedMember: TeamMember) => void;
}

export default function TeamList({ teamMembers, onMemberUpdated }: TeamListProps) {
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) ||
                        member.role.toLowerCase().includes(search.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
                            member.department.toLowerCase() === selectedDepartment.toLowerCase();
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="w-full md:w-[200px]">
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.name.toLowerCase()}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredMembers.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-center text-muted-foreground">
            No team members found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <TeamMemberCard 
              key={member.id} 
              member={member} 
              onMemberUpdated={onMemberUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
