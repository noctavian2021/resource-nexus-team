
import { EmailConfig, TestEmailResponse } from './types';
import apiRequest from '@/services/apiClient';
import { isMockDataEnabled, toggleMockData } from '@/services/apiClient';

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

  // Ensure mock data is disabled for real emails
  const wasMockDataEnabled = isMockDataEnabled();
  if (wasMockDataEnabled) {
    toggleMockData(false);
    console.log('Temporarily disabled mock data to send a real email');
  }
  
  try {
    // Use the correct endpoint path for email testing
    const result = await apiRequest<{
      success: boolean;
      message?: string;
      error?: string;
      messageId?: string;
      smtpResponse?: string;
    }>('/api/email/send-test', 'POST', {
      config: config,
      recipient: recipient,
      subject: 'Test Email from Resource Management System',
      text: 'This is a test email to verify your SMTP configuration is working correctly.',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email</h2>
          <p>This is a test email to verify your SMTP configuration is working correctly.</p>
          <p>If you received this email, your email system is properly configured!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Resource Management System</p>
        </div>
      `
    });
    
    // Enhanced logging of the email sending result
    if (result.success) {
      console.log('Email server responded with success:', result);
      
      return { 
        success: true, 
        details: {
          messageId: result.messageId,
          smtpResponse: result.smtpResponse,
          fallback: false,
          simulated: false,
          provider: config.provider
        }
      };
    } else {
      const errorMsg = result.error || 'Unknown error sending email';
      console.error('Email error from server:', errorMsg);
      
      // Provide more helpful error messages for common issues
      if (config.provider === 'yahoo' && 
          (errorMsg.includes('535') || errorMsg.includes('authentication') || 
          errorMsg.includes('auth') || errorMsg.includes('login'))) {
        return { 
          success: false, 
          error: `Yahoo authentication failed. Make sure you've generated an App Password specifically for this app and you're not using your regular Yahoo account password. Error: ${errorMsg}`,
          details: {
            errorType: 'AuthenticationError',
            provider: config.provider,
            errorTime: new Date().toISOString()
          } 
        };
      }
      
      if (config.provider === 'gmail') {
        if (errorMsg.includes('Greeting never received')) {
          return {
            success: false,
            error: `Gmail connection timed out. Please try: 1) Using an App Password if you have 2FA enabled 2) Verifying your username is a Gmail address 3) Checking for security alerts in your Gmail 4) Waiting a few minutes before trying again. Error: ${errorMsg}`,
            details: {
              errorType: 'ConnectionTimeoutError',
              provider: config.provider,
              errorTime: new Date().toISOString()
            }
          };
        }
        
        if (errorMsg.includes('535') || errorMsg.includes('authentication') || 
          errorMsg.includes('auth') || errorMsg.includes('login')) {
          return {
            success: false,
            error: `Gmail authentication failed. If you have 2FA enabled on your Google account, you must generate and use an App Password instead of your regular password. Error: ${errorMsg}`,
            details: {
              errorType: 'AuthenticationError',
              provider: config.provider,
              errorTime: new Date().toISOString()
            }
          };
        }
      }
      
      return { 
        success: false, 
        error: errorMsg,
        details: {
          errorType: 'ServerError',
          provider: config.provider,
          errorTime: new Date().toISOString()
        }
      };
    }
  } catch (apiError: any) {
    console.error('API error when sending email:', apiError.message);
    
    // Return a properly formatted error response
    return {
      success: false,
      error: `API Error: ${apiError.message}`,
      details: {
        errorType: 'ApiError',
        errorTime: new Date().toISOString()
      }
    };
  } finally {
    // If we temporarily disabled mock data, restore its previous state
    if (wasMockDataEnabled !== isMockDataEnabled()) {
      toggleMockData(wasMockDataEnabled);
      console.log('Restored mock data setting to original state');
    }
  }
};
