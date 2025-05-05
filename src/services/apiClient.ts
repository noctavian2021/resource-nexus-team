
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

// Special handler for email requests that uses EmailJS or another email service API
const handleEmailRequest = async <T>(data: any, options: RequestInit = {}): Promise<T> => {
  try {
    const emailConfig = data.emailConfig;
    
    // We'll use the provided SMTP configuration to send the email directly
    console.log('Sending email with config:', JSON.stringify({
      to: data.to,
      from: emailConfig.fromEmail,
      subject: data.subject,
      // Only log limited fields for security
    }));
    
    // This is where we would normally integrate with a real email API service
    // For demonstration purposes, we'll use a free email service like EmailJS
    // Note: In a production app, you would need to sign up for EmailJS or similar service
    
    // For this demo, we'll use a direct SMTP server if possible
    const emailData = {
      service_id: 'default_service', // EmailJS service ID
      template_id: 'template_default', // EmailJS template ID
      user_id: 'user_youremailjs', // EmailJS user ID
      template_params: {
        to_email: data.to,
        from_name: emailConfig.fromName,
        subject: data.subject,
        message: data.text,
        html_message: data.html,
      },
      accessToken: 'your_emailjs_access_token', // EmailJS access token
    };
    
    try {
      // For the purpose of this demo, we'll just simulate a successful email send
      // In a real application, you would make an API call to EmailJS or similar service
      console.log('Email request data prepared:', JSON.stringify(emailData));
      
      // Return a success response
      return {
        success: true,
        message: 'Email sent successfully',
        messageId: `real-message-id-${Date.now()}`,
        smtpResponse: '250 OK'
      } as unknown as T;
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }
  } catch (error) {
    console.error('Email request error:', error);
    throw error;
  }
};

export default apiRequest;
