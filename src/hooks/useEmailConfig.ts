
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import apiRequest from '@/services/apiClient';

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
    secure: true, // Resend requires SSL/TLS for port 465
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
        
        // For Resend, enforce specific settings
        if (config.provider === 'resend') {
          updatedConfig.secure = true; // Always enable secure for Resend
          updatedConfig.fromEmail = 'onboarding@resend.dev'; // Default to the safe onboarding email
        }
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

  const sendTestEmail = async (recipient: string): Promise<{success: boolean; error?: string; details?: any}> => {
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
    
    // Enhanced logging for better debugging
    console.log('Sending test email to', recipient, 'with config:', JSON.stringify({
      provider: emailConfig.provider,
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      username: emailConfig.username,
      fromEmail: emailConfig.fromEmail,
      fromName: emailConfig.fromName,
      enabled: emailConfig.enabled
    }, null, 2));
    
    try {
      // Special handling for Resend provider
      let configToSend = {...emailConfig};
      
      // For Resend, ensure secure is true and using port 465
      if (configToSend.provider === 'resend') {
        configToSend.secure = true;
        configToSend.port = '465';
      }
      
      const result = await apiRequest<{
        success: boolean;
        message?: string;
        error?: string;
        messageId?: string;
        smtpResponse?: string;
      }>('/email/send-test', 'POST', {
        config: configToSend,
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
      });
      
      if (result.success) {
        console.log('Email sent successfully:', result);
        return { 
          success: true, 
          details: {
            messageId: result.messageId,
            smtpResponse: result.smtpResponse
          }
        };
      } else {
        const errorMsg = result.error || 'Unknown error sending email';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = `Email sending failed: ${err.message || 'Unknown error'}`;
      console.error(errorMsg);
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
        return 'For Resend, use your API key as both the username and password. You must use onboarding@resend.dev as the from email unless you have verified your domain in Resend.';
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
