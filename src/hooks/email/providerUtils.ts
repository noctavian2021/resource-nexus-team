
import { EmailConfig, EmailProviderType } from './types';

export const getProviderHelp = (provider: EmailProviderType): string => {
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

export const normalizeProviderConfig = (config: EmailConfig): EmailConfig => {
  let normalizedConfig = { ...config };
  
  // Normalize port and secure settings based on provider
  if (config.provider === 'yahoo') {
    normalizedConfig.host = 'smtp.mail.yahoo.com';
    normalizedConfig.port = '465';
    normalizedConfig.secure = true;
  } else if (config.provider === 'gmail') {
    normalizedConfig.host = 'smtp.gmail.com';
    
    // Gmail can use either 465 (SSL) or 587 (STARTTLS)
    if (config.port === '465') {
      normalizedConfig.secure = true; // Direct SSL
    } else {
      normalizedConfig.port = '587'; // Default to 587 if not 465
      normalizedConfig.secure = false; // STARTTLS
    }
  } else {
    // For other providers, set secure based on port number
    if (config.port === '465') {
      normalizedConfig.secure = true;
    } else if (config.port === '587') {
      normalizedConfig.secure = false;
    }
  }
  
  return normalizedConfig;
};
