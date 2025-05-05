
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
    
    // Use the consistent endpoint path with /api prefix
    const url = '/api/email/send';
    console.log(`Sending test email to endpoint: ${url}`);
    
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

      console.log('Email test response status:', response.status);
      
      // Handle different error codes specifically
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: "Email API endpoint not found. The server may not be running on port 5000."
          };
        }
        
        if (response.status === 500) {
          try {
            // Try to get error text
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            
            // Try to parse the error as JSON if possible
            try {
              const errorJson = JSON.parse(errorText);
              return {
                success: false,
                error: errorJson.error || `Server error: ${errorText || 'Unknown internal server error'}`
              };
            } catch (jsonParseError) {
              // If not valid JSON, just return the text
              return {
                success: false,
                error: `Server error: ${errorText || 'Unknown internal server error'}`
              };
            }
          } catch (textReadError) {
            // If we can't even read the response text
            return {
              success: false,
              error: "Server internal error. Check server logs for details."
            };
          }
        }
        
        // For any other error status
        try {
          const errorText = await response.text();
          // Try to parse as JSON first
          try {
            const errorJson = JSON.parse(errorText);
            return {
              success: false,
              error: errorJson.error || `API returned ${response.status}: ${errorText || response.statusText}`
            };
          } catch (jsonError) {
            // If not valid JSON, return the text
            return {
              success: false,
              error: `API returned ${response.status}: ${errorText || response.statusText}`
            };
          }
        } catch (textError) {
          return {
            success: false,
            error: `API returned ${response.status}: ${response.statusText}`
          };
        }
      }
      
      // Handle empty response
      let responseText;
      try {
        responseText = await response.text();
      } catch (error) {
        console.error('Error reading response text:', error);
        responseText = '';
      }
      
      if (!responseText) {
        console.log('Server returned empty response');
        return {
          success: true,
          details: {
            messageId: 'unknown',
            smtpResponse: 'Server returned empty response but status was OK'
          }
        };
      }
      
      // Parse the JSON only if we have content
      try {
        const result = JSON.parse(responseText);
        
        // Format the response according to our expected TestEmailResponse type
        if (result.success) {
          return {
            success: true,
            details: {
              messageId: result.messageId || 'unknown',
              smtpResponse: result.smtpResponse || 'Email sent successfully'
            }
          };
        } else {
          return {
            success: false,
            error: result.error || "Unknown error occurred while sending test email"
          };
        }
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError, 'Response text:', responseText);
        
        // If JSON parsing fails but status was OK, assume success
        if (response.ok) {
          return {
            success: true,
            details: {
              messageId: 'unknown',
              smtpResponse: 'Email sent successfully, but response format was unexpected'
            }
          };
        }
        
        return {
          success: false,
          error: `Failed to parse server response: ${responseText.substring(0, 100)}...`
        };
      }
    } catch (error: any) {
      // This handles fetch errors or JSON parsing errors
      console.error('Fetch error in sendTestEmail:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: "Network error: Unable to connect to the email server. Make sure the server is running at http://localhost:5000."
        };
      }
      
      if (error.message.includes('404')) {
        return {
          success: false,
          error: "Email API endpoint not found. The server may not be configured to handle email requests."
        };
      }
      
      // Check for JSON parsing errors
      if (error.message.includes('JSON')) {
        return {
          success: false,
          error: "Received invalid JSON response from server. Check server logs for details."
        };
      }
      
      return {
        success: false,
        error: error.message || "An unknown error occurred"
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
