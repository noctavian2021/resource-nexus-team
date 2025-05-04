
// We need to fix the import structure
import { useEmailConfig } from './email/useEmailConfig';
// Export all needed types from the email types file
export type { EmailConfig, EmailProviderType, EmailProviderConfig, TestEmailResponse } from './email/types';

export { useEmailConfig };
