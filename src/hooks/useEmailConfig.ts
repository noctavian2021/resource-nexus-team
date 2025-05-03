
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
    port: '465', // Yahoo requires 465 port
    secure: true, // Yahoo requires SSL/TLS
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
        
        // For Gmail, provide safe defaults
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

      // Ensure Yahoo always uses the correct settings regardless of user changes
      if (updatedConfig.provider === 'yahoo') {
        updatedConfig.port = '465';
        updatedConfig.secure = true;
        updatedConfig.host = 'smtp.mail.yahoo.com';
      }
      
      // Ensure Gmail always uses the correct settings
      if (updatedConfig.provider === 'gmail') {
        updatedConfig.host = 'smtp.gmail.com';
        // Gmail can use either 465 (SSL) or 587 (STARTTLS)
        if (updatedConfig.port === '465') {
          updatedConfig.secure = true; // Direct SSL
        } else {
          updatedConfig.port = '587'; // Default to 587 if not 465
          updatedConfig.secure = false; // STARTTLS
        }
      }

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
      // Special handling for Yahoo - add extra logging
      if (emailConfig.provider === 'yahoo') {
        console.log('Using Yahoo provider with special configuration');
        console.log('Note: Yahoo requires an app password, not regular account password');
      }
      
      // Special handling for Gmail - add extra logging
      if (emailConfig.provider === 'gmail') {
        console.log('Using Gmail provider - note that Gmail requires an App Password if 2FA is enabled');
      }
      
      const configToSend = {
        ...emailConfig,
        // Ensure correct settings for yahoo
        ...(emailConfig.provider === 'yahoo' ? {
          host: 'smtp.mail.yahoo.com',
          port: '465',
          secure: true
        } : {}),
        // Ensure correct settings for gmail
        ...(emailConfig.provider === 'gmail' ? {
          host: 'smtp.gmail.com',
          port: '587',
          secure: false
        } : {})
      };
      
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
        
        // Special error handling for Yahoo
        if (emailConfig.provider === 'yahoo' && 
            (errorMsg.includes('535') || errorMsg.includes('authentication') || 
             errorMsg.includes('auth') || errorMsg.includes('login'))) {
          
          // Add more specific guidance for Yahoo auth issues
          setError(`Yahoo SMTP authentication failed. Please ensure you're using an App Password, not your regular Yahoo password. ${errorMsg}`);
          
          return { 
            success: false, 
            error: `Yahoo authentication failed. Make sure you've generated an App Password specifically for this app and you're not using your regular Yahoo account password. Error: ${errorMsg}`
          };
        }
        
        // Special error handling for Gmail
        if (emailConfig.provider === 'gmail') {
          if (errorMsg.includes('Greeting never received')) {
            setError(`Gmail SMTP greeting timeout. This might be due to network issues or Gmail security measures. Try using an App Password if you have 2FA enabled.`);
            return {
              success: false,
              error: `Gmail connection timed out. Please try: 1) Using an App Password if you have 2FA enabled 2) Verifying your username is a Gmail address 3) Waiting a few minutes before trying again. Error: ${errorMsg}`
            };
          }
          
          if (errorMsg.includes('535') || errorMsg.includes('authentication') || 
             errorMsg.includes('auth') || errorMsg.includes('login')) {
            setError(`Gmail authentication failed. If you have 2FA enabled, you need to use an App Password. ${errorMsg}`);
            return {
              success: false,
              error: `Gmail authentication failed. If you have 2FA enabled on your Google account, you must generate and use an App Password instead of your regular password. Error: ${errorMsg}`
            };
          }
        }
        
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
        return 'For Gmail, you need to: 1) Use your full Gmail address as username 2) Use an App Password if you have 2FA enabled (go to your Google Account > Security > App passwords) 3) Make sure "Less secure app access" is enabled if you don\'t use 2FA.';
      case 'outlook365':
        return 'For Outlook 365, make sure to use your full email as username and enable "Allow less secure apps" in your Microsoft account settings.';
      case 'yahoo':
        return 'For Yahoo Mail, you MUST use an App Password and not your regular Yahoo password. To generate an App Password: 1) Go to Yahoo Account Info > Account Security > Generate app password 2) Select "Other app" and name it 3) Copy the generated password and use it here. Also ensure you use your full Yahoo email as the username.';
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
