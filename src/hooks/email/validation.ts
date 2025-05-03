
import { EmailConfig } from './types';

export const validateEmailConfig = (config: EmailConfig): string[] => {
  const errors: string[] = [];
  
  if (config.enabled) {
    if (!config.host) errors.push('Host is required');
    if (!config.port) errors.push('Port is required');
    if (!config.username) errors.push('Username is required');
    if (!config.password) errors.push('Password is required');
    
    // Basic validation for all providers - from email should exist
    if (!config.fromEmail) errors.push('From email is required');
    
    // Special validation for Resend
    if (config.provider === 'resend') {
      // Check if fromEmail is using resend.dev domain and not verified
      if (config.fromEmail.endsWith('resend.dev') && config.fromEmail !== 'onboarding@resend.dev') {
        errors.push('For Resend: Only onboarding@resend.dev can be used as a from email unless you have verified your domain');
      }
      
      // Make sure username and password are the same for Resend (both should be the API key)
      if (config.username !== config.password) {
        errors.push('For Resend: API key must be used as both username and password');
      }
    }
    
    // Gmail-specific validation
    if (config.provider === 'gmail') {
      // Gmail requires a valid gmail address as username
      if (!config.username.includes('@gmail.com')) {
        errors.push('For Gmail: Username must be a valid Gmail address (@gmail.com)');
      }
    }
  }
  
  return errors;
};
