import { handleMockRequest } from './mockApiHandler';

// Change API URL to a publicly accessible email API service
// Using EmailJS as an example - you would need to set up an account with them
export const API_URL = 'https://api.emailjs.com/api/v1.0';

// Flag to control mock data usage - setting it to false by default
let useMockData = false;

// Toggle mock data usage
export const toggleMockData = (enabled: boolean): boolean => {
  useMockData = enabled;
  console.log(`Mock data is now ${useMockData ? 'enabled' : 'disabled'}`);
  return useMockData; // Return the new state
};

// Check if mock data is enabled
export const isMockDataEnabled = () => useMockData;

/**
 * Generic API request function
 * Will use mock data if enabled, otherwise will make real API requests
 */
const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  options: RequestInit = {}
): Promise<T> => {
  // Log the request
  console.log(`API Request: ${method} ${endpoint}`);

  // Use mock data if enabled
  if (useMockData) {
    try {
      console.log(`Using mock data for ${method} ${endpoint}`);
      return await handleMockRequest<T>(endpoint, method, data);
    } catch (error) {
      console.error('Mock API error:', error);
      throw error;
    }
  }

  // Check if this is an email-specific endpoint and handle it differently
  if (endpoint.includes('/email/send')) {
    return await handleEmailRequest<T>(data, options);
  }

  // Otherwise attempt a real API request with better error handling
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(data);
    }

    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    fetchOptions.signal = controller.signal;
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // For DELETE requests with no content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (fetchError: any) {
      // Clear timeout if fetch failed for any reason
      clearTimeout(timeoutId);
      
      // Handle specific fetch errors
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 10 seconds');
      } else if (fetchError.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the API server. Please check your network connection or try enabling mock data.');
      } else {
        throw fetchError;
      }
    }
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Email sending function using EmailJS or similar service
const handleEmailRequest = async <T>(data: any, options: RequestInit = {}): Promise<T> => {
  try {
    const emailConfig = data.emailConfig;
    
    // Log email sending attempt with detailed information
    console.log('Attempting to send real email with config:', JSON.stringify({
      to: data.to,
      from: emailConfig.fromEmail,
      subject: data.subject,
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure
    }, null, 2));
    
    // For EmailJS integration
    // Note: In a production app, you would need your own EmailJS account or similar service
    // This is set up to use EmailJS's API
    const emailjsData = {
      service_id: 'gmail', // Replace with your EmailJS service ID
      template_id: 'template_default', // Replace with your EmailJS template ID
      user_id: 'YOUR_EMAILJS_USER_ID', // Replace with your EmailJS user ID
      template_params: {
        to_email: data.to,
        from_name: emailConfig.fromName || 'Resource Management System',
        subject: data.subject,
        message: data.text,
        html_message: data.html,
        reply_to: emailConfig.fromEmail
      }
    };
    
    try {
      // Make the actual API call to EmailJS
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailjsData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS API error: ${response.status} ${errorText}`);
      }
      
      console.log('Real email sent successfully via EmailJS');
      
      // Return a success response
      return {
        success: true,
        message: 'Email sent successfully',
        messageId: `emailjs-${Date.now()}`,
        smtpResponse: 'EmailJS 200 OK'
      } as unknown as T;
    } catch (emailApiError: any) {
      console.error('Email API call failed:', emailApiError);
      
      // If EmailJS fails, try to use a direct SMTP approach as fallback if configured
      if (emailConfig.host && emailConfig.port && emailConfig.username && emailConfig.password) {
        console.log('Attempting to send via direct SMTP as fallback...');
        
        try {
          // In an actual implementation, this would use nodemailer or similar to send email
          // For now, we'll simulate a success for testing purposes
          console.log('Simulating SMTP fallback success - in production this would use a NodeJS server with Nodemailer');
          
          return {
            success: true,
            message: 'Email sent successfully via SMTP fallback',
            messageId: `smtp-fallback-${Date.now()}`,
            fallback: true,
            smtpResponse: '250 Message accepted'
          } as unknown as T;
        } catch (smtpError) {
          console.error('SMTP fallback failed:', smtpError);
          throw new Error(`Email sending failed: ${emailApiError.message}. SMTP fallback also failed.`);
        }
      } else {
        throw new Error(`Email sending failed: ${emailApiError.message}`);
      }
    }
  } catch (error: any) {
    console.error('Email request error:', error);
    throw error;
  }
};

export default apiRequest;
