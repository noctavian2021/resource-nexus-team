
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface EmailConfig {
  provider: 'gmail' | 'resend' | 'yahoo' | 'outlook365' | 'custom';
  host: string;
  port: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
  enabled: boolean;
}

const defaultConfigs: Record<string, Partial<EmailConfig>> = {
  gmail: {
    host: 'smtp.gmail.com',
    port: '587',
    secure: false,
    // Note: For Gmail with 2FA, use an App Password
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: '587',
    secure: false,
  },
  outlook365: {
    host: 'smtp.office365.com',
    port: '587',
    secure: false,
  },
  resend: {
    host: 'smtp.resend.com',
    port: '465',
    secure: true,
  },
  custom: {
    host: '',
    port: '587',
    secure: false,
  },
};

const defaultEmailConfig: EmailConfig = {
  provider: 'gmail',
  host: defaultConfigs.gmail.host || '',
  port: defaultConfigs.gmail.port || '',
  username: '',
  password: '',
  fromEmail: '',
  fromName: 'Resource Management System',
  secure: defaultConfigs.gmail.secure || false,
  enabled: false,
};

const validateEmailConfig = (config: EmailConfig): string[] => {
  const errors: string[] = [];
  
  if (config.enabled) {
    if (!config.host) errors.push('Host is required');
    if (!config.port) errors.push('Port is required');
    if (!config.username) errors.push('Username is required');
    if (!config.password) errors.push('Password is required');
    if (!config.fromEmail) {
      errors.push('From email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.fromEmail)) {
      errors.push('Valid from email is required');
    }
  }
  
  return errors;
};

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
      } else {
        updatedConfig = { ...emailConfig, ...config };
      }
      
      // Validate if enabled
      if (updatedConfig.enabled) {
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

  const sendTestEmail = async (recipient: string): Promise<{success: boolean; error?: string}> => {
    if (!emailConfig.enabled) {
      return { success: false, error: 'Email notifications are disabled' };
    }

    const validationErrors = validateEmailConfig(emailConfig);
    if (validationErrors.length > 0) {
      return { 
        success: false, 
        error: `Invalid email configuration: ${validationErrors.join(', ')}` 
      };
    }

    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return { success: false, error: 'Valid recipient email is required' };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Call the backend API to send the test email
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            ...emailConfig,
            // For security, we only include necessary fields
            provider: emailConfig.provider,
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secure,
            username: emailConfig.username,
            password: emailConfig.password,
            fromEmail: emailConfig.fromEmail,
            fromName: emailConfig.fromName,
          },
          recipient,
          subject: 'Test Email from Resource Management System',
          text: 'This is a test email to verify your SMTP configuration is working correctly.',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Test Email</h2>
              <p>This is a test email to verify your SMTP configuration is working correctly.</p>
              <p>If you received this email, your email system is properly configured!</p>
              <hr>
              <p style="color: #666; font-size: 12px;">Resource Management System</p>
            </div>
          `
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true };
      } else {
        const errorMsg = result.error || 'Failed to send email';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = `Email sending failed: ${err.message || 'Unknown error'}`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Get helpful tips for setting up specific email providers
  const getProviderHelp = (provider: EmailConfig['provider']): string => {
    switch(provider) {
      case 'gmail':
        return 'For Gmail, you need to use an App Password if 2FA is enabled. Go to your Google Account > Security > App passwords.';
      case 'outlook365':
        return 'For Outlook 365, make sure to use your full email as username and enable "Allow less secure apps" in your Microsoft account settings.';
      case 'yahoo':
        return 'For Yahoo, you need to generate an app password in your account security settings.';
      case 'resend':
        return 'For Resend, use your API key as the password.';
      default:
        return '';
    }
  };

  return {
    emailConfig,
    updateEmailConfig,
    sendTestEmail,
    providerDefaults: defaultConfigs,
    error,
    isLoading,
    getProviderHelp,
  };
};
