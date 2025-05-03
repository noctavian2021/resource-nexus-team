
import { EmailConfig, TestEmailResponse } from './types';
import apiRequest from '@/services/apiClient';

export const sendTestEmail = async (
  config: EmailConfig, 
  recipient: string
): Promise<TestEmailResponse> => {
  if (!config.enabled) {
    return { success: false, error: 'Email notifications are disabled' };
  }

  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return { success: false, error: 'Valid recipient email is required' };
  }

  // Enhanced logging for better debugging
  console.log('Sending test email to', recipient, 'with config:', JSON.stringify({
    provider: config.provider,
    host: config.host,
    port: config.port,
    secure: config.secure,
    username: config.username,
    fromEmail: config.fromEmail,
    fromName: config.fromName,
    enabled: config.enabled
  }, null, 2));
  
  // Special handling for providers - logging
  if (config.provider === 'yahoo') {
    console.log('Using Yahoo provider with special configuration');
    console.log('Note: Yahoo requires an app password, not regular account password');
  }
  
  if (config.provider === 'gmail') {
    console.log('Using Gmail provider - note that Gmail requires an App Password if 2FA is enabled');
  }
  
  try {
    const result = await apiRequest<{
      success: boolean;
      message?: string;
      error?: string;
      messageId?: string;
      smtpResponse?: string;
    }>('/email/send-test', 'POST', {
      config,
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
      
      // Enhanced error handling for specific providers
      if (config.provider === 'yahoo' && 
          (errorMsg.includes('535') || errorMsg.includes('authentication') || 
          errorMsg.includes('auth') || errorMsg.includes('login'))) {
        return { 
          success: false, 
          error: `Yahoo authentication failed. Make sure you've generated an App Password specifically for this app and you're not using your regular Yahoo account password. Error: ${errorMsg}`
        };
      }
      
      if (config.provider === 'gmail') {
        if (errorMsg.includes('Greeting never received')) {
          return {
            success: false,
            error: `Gmail connection timed out. Please try: 1) Using an App Password if you have 2FA enabled 2) Verifying your username is a Gmail address 3) Waiting a few minutes before trying again. Error: ${errorMsg}`
          };
        }
        
        if (errorMsg.includes('535') || errorMsg.includes('authentication') || 
          errorMsg.includes('auth') || errorMsg.includes('login')) {
          return {
            success: false,
            error: `Gmail authentication failed. If you have 2FA enabled on your Google account, you must generate and use an App Password instead of your regular password. Error: ${errorMsg}`
          };
        }
      }
      
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    const errorMsg = `Email sending failed: ${err.message || 'Unknown error'}`;
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
};
