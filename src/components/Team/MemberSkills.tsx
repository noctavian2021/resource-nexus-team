
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface MemberSkillsProps {
  skills: string[];
}

export default function MemberSkills({ skills }: MemberSkillsProps) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium">Skills</p>
      <div className="flex flex-wrap gap-1">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}
