
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { EmailConfig, TestEmailResponse } from './types';
import { defaultEmailConfig, defaultConfigs } from './emailDefaults';
import { validateEmailConfig } from './validation';
import { getProviderHelp, normalizeProviderConfig, getConnectionErrorHelp } from './providerUtils';
import { sendTestEmail } from './emailTestService';

export const useEmailConfig = () => {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(defaultEmailConfig);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem('emailConfig');
      if (storedConfig) {
        setEmailConfig(JSON.parse(storedConfig));
      }
    } catch (err) {
      console.error('Failed to load email configuration from localStorage:', err);
      setError('Failed to load email configuration');
    }
  }, []);

  const updateEmailConfig = (config: Partial<EmailConfig>) => {
    try {
      let updatedConfig: EmailConfig;
      
      if (config.provider && config.provider !== emailConfig.provider) {
        // If provider changed, update with default settings for that provider
        const providerDefaults = defaultConfigs[config.provider];
        updatedConfig = {
          ...emailConfig,
          ...config,
          host: providerDefaults.host || '',
          port: providerDefaults.port || '',
          secure: providerDefaults.secure || false,
        };
        
        // For Resend, enforce specific settings
        if (config.provider === 'resend') {
          updatedConfig.secure = true; // Always enable secure for Resend
          updatedConfig.fromEmail = 'onboarding@resend.dev'; // Default to the safe onboarding email
        }
        
        // For Yahoo, enforce specific settings
        if (config.provider === 'yahoo') {
          updatedConfig.secure = true; // Always enable secure for Yahoo
          updatedConfig.port = '465'; // Always use 465 for Yahoo
          // For Yahoo, use username as fromEmail by default
          if (updatedConfig.username && !updatedConfig.fromEmail) {
            updatedConfig.fromEmail = updatedConfig.username;
          }
        }
        
        // For Gmail, provide safe defaults - always use 587 with STARTTLS
        if (config.provider === 'gmail') {
          updatedConfig.port = '587'; // Standard port for Gmail
          updatedConfig.secure = false; // Uses STARTTLS
        }
      } else {
        updatedConfig = { ...emailConfig, ...config };
        
        // Special handling for port changes that might require secure connection updates
        if (config.port === '465') {
          updatedConfig.secure = true; // Port 465 always requires secure
        } else if (config.port === '587' && config.provider !== 'yahoo') {
          // Port 587 typically uses STARTTLS (not immediate TLS) except for Yahoo
          updatedConfig.secure = false;
        }
        
        // For Yahoo, always sync fromEmail with username if username changes
        if (config.username && updatedConfig.provider === 'yahoo') {
          updatedConfig.fromEmail = config.username;
        }
      }

      // Apply provider-specific normalization
      updatedConfig = normalizeProviderConfig(updatedConfig);

      // If user is trying to enable, validate
      if (config.enabled === true) {
        const validationErrors = validateEmailConfig(updatedConfig);
        if (validationErrors.length > 0) {
          const errorMsg = `Invalid email configuration: ${validationErrors.join(', ')}`;
          setError(errorMsg);
          toast({
            title: "Email Configuration Error",
            description: errorMsg,
            variant: "destructive"
          });
          return null;
        }
      }
      
      setEmailConfig(updatedConfig);
      setError(null);
      localStorage.setItem('emailConfig', JSON.stringify(updatedConfig));
      return updatedConfig;
    } catch (err: any) {
      const errorMsg = err.message || 'Error updating email configuration';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return null;
    }
  };

  const handleTestEmail = async (recipient: string): Promise<TestEmailResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await sendTestEmail(emailConfig, recipient);
      
      if (!result.success && result.error) {
        setError(result.error);
        
        if (result.error.includes('Greeting never received')) {
          // Provide specific guidance for connection issues
          const helpMessage = getConnectionErrorHelp(result.error, emailConfig.provider);
          toast({
            title: "Connection Error",
            description: helpMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Email Test Failed",
            description: result.error,
            variant: "destructive"
          });
        }
      } else if (result.success) {
        toast({
          title: "Email Test Successful",
          description: "The test email was sent successfully!",
        });
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error sending test email';
      setError(errorMsg);
      
      // Provide helpful guidance for common errors
      if (errorMsg.includes('Greeting never received')) {
        const helpMessage = getConnectionErrorHelp(errorMsg, emailConfig.provider);
        toast({
          title: "Connection Error",
          description: helpMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
      
      // Return a properly formatted TestEmailResponse
      return { 
        success: false, 
        error: errorMsg,
        details: undefined
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    emailConfig,
    updateEmailConfig,
    sendTestEmail: handleTestEmail,
    providerDefaults: defaultConfigs,
    error,
    isLoading,
    getProviderHelp,
  };
};
