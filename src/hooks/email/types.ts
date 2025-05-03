
export interface EmailConfig {
  provider: 'gmail' | 'resend' | 'yahoo' | 'outlook365' | 'custom';
  host: string;
  port: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure: boolean;
  enabled: boolean;
}

export interface EmailProviderConfig extends Partial<EmailConfig> {}

export interface TestEmailResponse {
  success: boolean;
  error?: string;
  details?: {
    messageId?: string;
    smtpResponse?: string;
  };
}

export type EmailProviderType = EmailConfig['provider'];
