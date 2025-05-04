
// Define email config type
export interface EmailConfig {
  enabled: boolean;
  provider: string;
  host: string;
  port: string;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface TestEmailResponse {
  success: boolean;
  error?: string;
  details?: {
    messageId?: string;
    smtpResponse?: string;
  };
}
