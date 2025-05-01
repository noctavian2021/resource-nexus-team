
import React, { useState } from 'react';
import { Upload } from "lucide-react";
import { FormField, FormItem, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Control } from 'react-hook-form';

interface AvatarUploadProps {
  control: Control<any>;
  defaultAvatar?: string;
  name: string;
  memberName: string;
}

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

const AvatarUpload = ({ control, defaultAvatar, name, memberName }: AvatarUploadProps) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(defaultAvatar || null);
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, WEBP).",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      control._formValues[name] = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <Avatar className="h-24 w-24 border-2 border-muted">
        <AvatarImage src={avatarPreview || defaultAvatar} />
        <AvatarFallback>{getInitials(memberName)}</AvatarFallback>
      </Avatar>
      
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormControl>
              <div className="flex items-center justify-center">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </FormControl>
            <FormDescription className="text-center text-xs">
              Upload a new avatar (JPEG, PNG, GIF, WEBP, max 2MB)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AvatarUpload;
