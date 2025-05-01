
import * as z from "zod";

export const teamMemberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.string().min(2, { message: "Role must be at least 2 characters." }),
  department: z.string().min(1, { message: "Please select a department." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  skills: z.string().optional(),
  availability: z.coerce.number().min(0).max(100),
  isOnVacation: z.boolean().default(false),
  vacationStartDate: z.string().optional(),
  vacationEndDate: z.string().optional(),
  avatar: z.string().optional(),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
