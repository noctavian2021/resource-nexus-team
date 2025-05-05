
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
  
  // Store original mock data state to restore later if needed
  const wasMockDataEnabled = isMockDataEnabled();
  
  try {
    // Always attempt to use real API first
    if (wasMockDataEnabled) {
      // Temporarily disable mock data for this request
      toggleMockData(false);
      console.log('Temporarily disabled mock data for email test');
    }
    
    // Make the real API call
    try {
      const result = await apiRequest<{
        success: boolean;
        message?: string;
        error?: string;
        messageId?: string;
        smtpResponse?: string;
      }>('/email/send', 'POST', {
        to: recipient,
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
        // Ensure config is normalized correctly
        emailConfig: {
          ...config,
          // Ensure port is string and secured is properly set based on port
          port: String(config.port),
          secure: config.port === '465' ? true : (config.port === '587' ? false : config.secure),
          // Add connection timeout settings
          connectionTimeout: 30000, // 30 seconds
          greetingTimeout: 30000    // 30 seconds
        }
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
        
        // Provide more helpful error messages for common issues
        if (config.provider === 'yahoo' && 
            (errorMsg.includes('535') || errorMsg.includes('authentication') || 
            errorMsg.includes('auth') || errorMsg.includes('login'))) {
          return { 
            success: false, 
            error: `Yahoo authentication failed. Make sure you've generated an App Password specifically for this app and you're not using your regular Yahoo account password. Error: ${errorMsg}`,
            details: undefined 
          };
        }
        
        if (config.provider === 'gmail') {
          if (errorMsg.includes('Greeting never received')) {
            return {
              success: false,
              error: `Gmail connection timed out. Please try: 1) Using an App Password if you have 2FA enabled 2) Verifying your username is a Gmail address 3) Checking for security alerts in your Gmail 4) Waiting a few minutes before trying again. Error: ${errorMsg}`,
              details: undefined 
            };
          }
          
          if (errorMsg.includes('535') || errorMsg.includes('authentication') || 
            errorMsg.includes('auth') || errorMsg.includes('login')) {
            return {
              success: false,
              error: `Gmail authentication failed. If you have 2FA enabled on your Google account, you must generate and use an App Password instead of your regular password. Error: ${errorMsg}`,
              details: undefined 
            };
          }
        }
        
        return { 
          success: false, 
          error: errorMsg,
          details: undefined 
        };
      }
    } catch (apiError: any) {
      // If real API call fails with a connection error, fall back to simulation
      console.error('API connection error:', apiError.message);
      
      if (apiError.message.includes('Unable to connect') || 
          apiError.message.includes('Failed to fetch') || 
          apiError.message.includes('timed out')) {
        console.log('API connection failed, falling back to simulated email test');
        
        // Enable mock data temporarily for simulating the response
        toggleMockData(true);
        
        // Use simulated email test with detailed result
        const simulatedResult = await simulateMockEmailSending(config, recipient);
        
        // Add a warning that this was simulated
        if (simulatedResult.success) {
          simulatedResult.details = {
            ...simulatedResult.details,
            smtpResponse: (simulatedResult.details?.smtpResponse || '') + ' [SIMULATED - API UNREACHABLE]'
          };
        } else {
          simulatedResult.error = (simulatedResult.error || '') + ' [SIMULATED - API UNREACHABLE]';
        }
        
        // Restore original mock data state
        toggleMockData(wasMockDataEnabled);
        
        return simulatedResult;
      }
      
      // For other API errors, just pass through the error
      return {
        success: false,
        error: `API Error: ${apiError.message}`,
        details: undefined
      };
    }
  } finally {
    // Always restore original mock data state
    toggleMockData(wasMockDataEnabled);
  }
};

// Helper function to simulate email sending with mock data
async function simulateMockEmailSending(config: EmailConfig, recipient: string): Promise<TestEmailResponse> {
  // Wait a moment to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Simulating email sending with mock data');
  
  // Check for specific patterns in the email or configurations that might cause "errors"
  // to simulate different scenarios
  
  // Simulate Yahoo authentication issues
  if (config.provider === 'yahoo' && !config.password.includes('app-')) {
    return {
      success: false,
      error: 'Yahoo authentication failed. Make sure you\'ve generated an App Password specifically for this app.',
      details: undefined
    };
  }
  
  // Simulate Gmail auth issues
  if (config.provider === 'gmail' && config.username && !config.username.includes('@gmail.com')) {
    return {
      success: false,
      error: 'Gmail authentication failed. Username must be a valid Gmail address.',
      details: undefined
    };
  }
  
  // Simulate connection issues for wrong port settings
  if ((config.port === '465' && !config.secure) || (config.port === '587' && config.secure)) {
    return {
      success: false,
      error: 'Connection failed due to mismatched port and security settings. For port 465, secure should be true. For port 587, secure should be false.',
      details: undefined
    };
  }
  
  // Simulate invalid recipient issues
  if (recipient.includes('invalid') || recipient.includes('fail')) {
    return {
      success: false,
      error: 'Failed to send email: Invalid recipient address',
      details: undefined
    };
  }

  // By default, simulate successful sending
  return {
    success: true,
    details: {
      messageId: `mock-message-id-${Date.now()}@${config.provider}.mock`,
      smtpResponse: `250 OK id=mock-${Date.now()}`
    }
  };
}
