
import { EmailConfig, EmailProviderType } from './types';

export const getProviderHelp = (provider: EmailProviderType): string => {
  switch(provider) {
    case 'gmail':
      return 'For Gmail, you need to: 1) Use your full Gmail address as username 2) Use an App Password if you have 2FA enabled (go to your Google Account > Security > App passwords) 3) Make sure "Less secure app access" is enabled if you don\'t use 2FA. 4) Check your Gmail account for security alerts that may be blocking connection attempts.';
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
    
    // Gmail should use 587 with STARTTLS (secure=false) for better reliability
    normalizedConfig.port = '587';
    normalizedConfig.secure = false;
  } else if (config.provider === 'outlook365') {
    normalizedConfig.host = 'smtp.office365.com';
    normalizedConfig.port = '587';
    normalizedConfig.secure = false;
  } else if (config.provider === 'resend') {
    normalizedConfig.host = 'smtp.resend.com';
    normalizedConfig.port = '465';
    normalizedConfig.secure = true;
  } else {
    // For other providers, set secure based on port number
    if (config.port === '465') {
      normalizedConfig.secure = true;
    } else if (config.port === '587') {
      normalizedConfig.secure = false;
    }
  }
  
  // Handle example.com domain email addresses
  if (config.username?.includes('@example.com') || config.fromEmail?.includes('@example.com')) {
    console.log('⚠️ Example.com domain detected - these are simulator emails and may not be delivered to real addresses');
    
    // Log detailed debug info for example.com domains
    try {
      console.log('Email config with example.com domain:', JSON.stringify(normalizedConfig, null, 2));
    } catch (err) {
      console.error('Error logging email config:', err);
    }
  }
  
  return normalizedConfig;
};

// New helper function to handle common email connection errors
export const getConnectionErrorHelp = (errorMessage: string, provider: EmailProviderType): string => {
  if (errorMessage.includes('Greeting never received')) {
    if (provider === 'gmail') {
      return 'Gmail connection timed out. This often happens due to security restrictions. Try: 1) Using an App Password if you have 2FA enabled 2) Check your Gmail inbox for security alerts 3) Try again in a few minutes';
    }
    
    return 'Connection timed out. This could be due to network issues, incorrect server settings, or the email provider blocking your connection. Verify your settings and try again later.';
  }
  
  if (errorMessage.includes('SSL routines') || errorMessage.includes('wrong version number')) {
    return 'SSL/TLS connection failed. Your secure setting may not match what the server expects. If your port is 587, try setting secure=false. If your port is 465, try setting secure=true.';
  }
  
  // Special handling for example.com domain emails
  if (errorMessage.includes('example.com')) {
    return 'You are using example.com domain email addresses which are not valid for real email delivery. Please use valid email addresses in your configuration.';
  }
  
  return `Email error: ${errorMessage}`;
};
