
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

  // Production environment logging - more minimal
  console.log('Sending test email to', recipient);
  console.log('Provider:', config.provider);
  
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
      config: {
        ...config,
        // Add extended timeout values for SMTP operations
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,   // 30 seconds
      },
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
    
    // Production-appropriate logging
    if (result.success) {
      console.log('Email sent successfully');
      
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
      console.error('Email error:', errorMsg);
      
      // Simpler error handling for production
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
