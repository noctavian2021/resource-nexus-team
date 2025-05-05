import { handleMockRequest } from './mockApiHandler';
import { EmailConfig } from '@/hooks/email/types';

// API URL configuration
export const API_URL = 'https://api.example.com/v1'; // This is a placeholder, as we're mostly using mock data

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

/**
 * Direct SMTP email handling using the configured email settings
 * In a production environment, this would be handled by a NodeJS server with Nodemailer
 * For this client-side implementation, we simulate the SMTP connection for demonstration
 */
const handleEmailRequest = async <T>(data: any, options: RequestInit = {}): Promise<T> => {
  try {
    const emailConfig = data.emailConfig as EmailConfig;
    
    // Log email sending attempt with detailed information
    console.log('Attempting to send email with config:', JSON.stringify({
      to: data.to,
      from: emailConfig.fromEmail,
      subject: data.subject,
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      username: emailConfig.username,
      // Don't log the password for security
    }, null, 2));
    
    // In a real production environment, this would connect to the SMTP server
    // and send the email directly. For this client-side app, we simulate the process
    // with detailed logging to show what would happen
    
    // Connection simulation based on email provider
    console.log(`[SMTP Simulation] Connecting to ${emailConfig.host}:${emailConfig.port} (secure: ${emailConfig.secure ? 'yes' : 'no'})`);
    
    // Authentication simulation
    console.log(`[SMTP Simulation] Authenticating as ${emailConfig.username}`);
    
    // Message preparation simulation
    console.log(`[SMTP Simulation] Preparing message from ${emailConfig.fromEmail} to ${data.to}`);
    console.log(`[SMTP Simulation] Subject: ${data.subject}`);
    
    // Email sending simulation with provider-specific details
    if (emailConfig.provider === 'gmail') {
      console.log('[SMTP Simulation] Using Gmail SMTP with STARTTLS');
      console.log('[SMTP Simulation] Gmail requires App Password if 2FA is enabled');
    } else if (emailConfig.provider === 'yahoo') {
      console.log('[SMTP Simulation] Using Yahoo SMTP with SSL/TLS');
      console.log('[SMTP Simulation] Yahoo requires App Password, not regular account password');
    } else if (emailConfig.provider === 'outlook365') {
      console.log('[SMTP Simulation] Using Outlook 365 with Modern Authentication');
    }
    
    // -------------------------------------------------------------------------
    // IMPORTANT: In production, use a server-side API with Nodemailer or similar
    // This client-side implementation can only simulate email sending
    // -------------------------------------------------------------------------
    console.log('[SMTP Simulation] In a production environment, this would use real SMTP connection with Nodemailer or similar');

    // Check for obvious configuration errors that would prevent successful email sending
    if (!emailConfig.host || !emailConfig.port) {
      throw new Error('Missing SMTP host or port configuration');
    }
    
    if (!emailConfig.username || !emailConfig.password) {
      throw new Error('Missing SMTP authentication credentials');
    }
    
    if (!emailConfig.fromEmail) {
      throw new Error('Missing sender email address');
    }

    // Simulate a successful email send for testing purposes
    console.log('[SMTP Simulation] Email simulation completed successfully');
    
    return {
      success: true,
      message: 'Email simulation completed. In production, this would send a real email via SMTP.',
      messageId: `smtp-simulation-${Date.now()}`,
      smtpResponse: '250 Message accepted for delivery',
      details: {
        provider: emailConfig.provider,
        host: emailConfig.host,
        port: emailConfig.port,
        simulated: true
      }
    } as unknown as T;
  } catch (error: any) {
    console.error('Email sending error:', error);
    
    // Properly format the error response
    return {
      success: false,
      error: `Email sending failed: ${error.message}`,
      details: {
        simulated: true,
        errorType: error.name,
        errorTime: new Date().toISOString()
      }
    } as unknown as T;
  }
};

export default apiRequest;
