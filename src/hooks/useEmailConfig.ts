
import { useState, useEffect } from 'react';

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

export const useEmailConfig = () => {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(defaultEmailConfig);

  useEffect(() => {
    const storedConfig = localStorage.getItem('emailConfig');
    if (storedConfig) {
      setEmailConfig(JSON.parse(storedConfig));
    }
  }, []);

  const updateEmailConfig = (config: Partial<EmailConfig>) => {
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
    
    setEmailConfig(updatedConfig);
    localStorage.setItem('emailConfig', JSON.stringify(updatedConfig));
    return updatedConfig;
  };

  const sendTestEmail = async (recipient: string): Promise<boolean> => {
    // In a real app, this would connect to an API to send the test email
    // For now, simulate sending and return success
    console.log('Sending test email to', recipient, 'with config:', emailConfig);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate success for now
        resolve(true);
      }, 1000);
    });
  };

  return {
    emailConfig,
    updateEmailConfig,
    sendTestEmail,
    providerDefaults: defaultConfigs,
  };
};
