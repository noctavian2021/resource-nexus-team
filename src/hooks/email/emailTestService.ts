
import { EmailConfig, TestEmailResponse } from './types';

export const sendTestEmail = async (
  config: EmailConfig, 
  recipient: string
): Promise<TestEmailResponse> => {
  try {
    if (!config.enabled) {
      return {
        success: false,
        error: "Email notifications are disabled"
      };
    }

    if (!config.host || !config.port || !config.username || !config.password) {
      return {
        success: false,
        error: "Incomplete email configuration"
      };
    }

    console.log(`Sending test email to ${recipient} using ${config.provider} configuration`);
    
    // Modified: Use the correct path based on API endpoint availability
    const url = '/api/email/send';
    
    try {
      // Call the email API endpoint
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          emailConfig: {
            ...config,
            // Ensure port is string
            port: String(config.port),
            // Add connection timeouts
            connectionTimeout: 30000,
            greetingTimeout: 30000
          }
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText || response.statusText}`);
      }
      
      // Handle empty response
      const responseText = await response.text();
      if (!responseText) {
        return {
          success: false,
          error: "Server returned an empty response"
        };
      }
      
      // Parse the JSON only if we have content
      const result = JSON.parse(responseText);
      
      // Format the response according to our expected TestEmailResponse type
      if (result.success) {
        return {
          success: true,
          details: {
            messageId: result.messageId,
            smtpResponse: result.smtpResponse
          }
        };
      } else {
        return {
          success: false,
          error: result.error || "Unknown error occurred while sending test email"
        };
      }
    } catch (error: any) {
      // This handles fetch errors or JSON parsing errors
      if (error.message.includes('404')) {
        return {
          success: false,
          error: "Email API endpoint not found. The server may not be configured to handle email requests."
        };
      }
      throw error; // Re-throw other errors to be caught by the outer try-catch
    }
  } catch (error: any) {
    console.error("Error in sendTestEmail:", error);
    return {
      success: false,
      error: error.message || "Failed to send test email"
    };
  }
};
