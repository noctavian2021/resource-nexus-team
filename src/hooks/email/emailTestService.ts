
import { EmailConfig, TestEmailResponse } from './types';

export const sendTestEmail = async (
  config: EmailConfig, 
  recipient: string
): Promise<TestEmailResponse> => {
  try {
    if (!config.enabled) {
      console.log('Email test aborted: Email notifications are disabled');
      return {
        success: false,
        error: "Email notifications are disabled"
      };
    }

    if (!config.host || !config.port || !config.username || !config.password) {
      console.log('Email test aborted: Incomplete email configuration');
      return {
        success: false,
        error: "Incomplete email configuration"
      };
    }

    console.log(`Sending test email to ${recipient} using ${config.provider} configuration`);
    
    // Use the consistent endpoint path with /api prefix
    const url = '/api/email/send';
    console.log(`Sending test email to endpoint: ${url}`);
    
    try {
      // Call the email API endpoint with added error handling
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

      console.log('Email test response status:', response.status);
      
      // Display toast immediately when the server responds
      if (typeof window !== 'undefined') {
        // For client-side, show a toast for the server response
        const eventName = "lovable-toast-event";
        const toastEvent = new CustomEvent(eventName, { 
          detail: {
            title: response.ok ? "Email Server Response" : "Email Server Error",
            description: `Status: ${response.status} - ${response.ok ? "Server accepted the request" : "Server error occurred"}`,
            variant: response.ok ? "default" : "destructive",
          } 
        });
        window.dispatchEvent(toastEvent);
      }
      
      // Handle different error codes specifically
      if (!response.ok) {
        let errorText = '';
        
        try {
          errorText = await response.text();
          console.log('Error response text:', errorText);
          
          try {
            // Try to parse as JSON
            const errorJson = JSON.parse(errorText);
            return {
              success: false,
              error: errorJson.error || `Error (${response.status}): ${errorText}`
            };
          } catch (jsonError) {
            // Not valid JSON, return as string
            return {
              success: false,
              error: `Error (${response.status}): ${errorText}`
            };
          }
        } catch (e) {
          return {
            success: false,
            error: `Server returned error status ${response.status}`
          };
        }
      }
      
      // Handle successful response
      let responseData;
      try {
        const responseText = await response.text();
        console.log('Email test response text:', responseText);
        
        if (!responseText.trim()) {
          // Empty response but status was OK
          return {
            success: true,
            details: {
              messageId: 'unknown',
              smtpResponse: 'Email sent successfully (no details returned)'
            }
          };
        }
        
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        // If we can't parse but the status was OK, assume success
        return {
          success: true,
          details: {
            messageId: 'unknown',
            smtpResponse: 'Email sent successfully (response parsing error)'
          }
        };
      }
      
      // Return a properly structured response
      return {
        success: true,
        details: {
          messageId: responseData?.messageId || 'unknown',
          smtpResponse: responseData?.smtpResponse || 'Email sent successfully'
        }
      };
    } catch (error: any) {
      console.error('Fetch error in sendTestEmail:', error);
      
      // Show a toast for network errors
      if (typeof window !== 'undefined') {
        const eventName = "lovable-toast-event";
        const toastEvent = new CustomEvent(eventName, { 
          detail: {
            title: "Network Error",
            description: error.message || "Failed to connect to email server",
            variant: "destructive",
          } 
        });
        window.dispatchEvent(toastEvent);
      }
      
      return {
        success: false,
        error: error.message || "Failed to connect to email server"
      };
    }
  } catch (error: any) {
    console.error("Error in sendTestEmail:", error);
    return {
      success: false,
      error: error.message || "Failed to send test email"
    };
  }
};
