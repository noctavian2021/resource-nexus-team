
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
  
  // Add more detailed logging about recipient
  console.log(`Attempting to deliver email to recipient: ${recipient}`);
  
  // Special handling for providers - logging
  if (config.provider === 'yahoo') {
    console.log('Using Yahoo provider with special configuration');
    console.log('Note: Yahoo requires an app password, not regular account password');
  }
  
  if (config.provider === 'gmail') {
    console.log('Using Gmail provider - note that Gmail requires an App Password if 2FA is enabled');
    console.log('Gmail connection may fail if the account has security restrictions. Check for emails about security alerts.');
  }
  
  try {
    // Updated to use the correct endpoint for email sending
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
      `,
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
      console.error('Email error:', errorMsg);
      
      // Enhanced error handling for specific providers
      if (config.provider === 'yahoo' && 
          (errorMsg.includes('535') || errorMsg.includes('authentication') || 
          errorMsg.includes('auth') || errorMsg.includes('login'))) {
        return { 
          success: false, 
          error: `Yahoo authentication failed. Make sure you've generated an App Password specifically for this app and you're not using your regular Yahoo account password. Error: ${errorMsg}`,
          details: undefined // Explicitly set details to undefined for failed attempts
        };
      }
      
      if (config.provider === 'gmail') {
        if (errorMsg.includes('Greeting never received')) {
          return {
            success: false,
            error: `Gmail connection timed out. Please try: 1) Using an App Password if you have 2FA enabled 2) Verifying your username is a Gmail address 3) Checking for security alerts in your Gmail 4) Waiting a few minutes before trying again. Error: ${errorMsg}`,
            details: undefined // Explicitly set details to undefined for failed attempts
          };
        }
        
        if (errorMsg.includes('535') || errorMsg.includes('authentication') || 
          errorMsg.includes('auth') || errorMsg.includes('login')) {
          return {
            success: false,
            error: `Gmail authentication failed. If you have 2FA enabled on your Google account, you must generate and use an App Password instead of your regular password. Error: ${errorMsg}`,
            details: undefined // Explicitly set details to undefined for failed attempts
          };
        }
      }
      
      return { 
        success: false, 
        error: errorMsg,
        details: undefined // Explicitly set details to undefined for failed attempts 
      };
    }
  } catch (err: any) {
    const errorMsg = `Email sending failed: ${err.message || 'Unknown error'}`;
    console.error(errorMsg);
    
    // Provide more specific guidance for common errors
    if (err.message && err.message.includes('Greeting never received')) {
      return { 
        success: false, 
        error: "SMTP connection timeout - server didn't respond. This could be due to: 1) Network connectivity issues 2) Email provider blocking access 3) Incorrect port or security settings. For Gmail, try using port 587 with secure=false. If using a corporate email, check with your IT department about firewall restrictions.",
        details: undefined // Explicitly set details to undefined for failed attempts
      };
    }
    
    return { 
      success: false, 
      error: errorMsg,
      details: undefined // Explicitly set details to undefined for failed attempts
    };
  }
};
