
import { EmailConfig, EmailProviderConfig } from './types';

export const defaultConfigs: Record<string, EmailProviderConfig> = {
  gmail: {
    host: 'smtp.gmail.com',
    port: '587',
    secure: false,
    // Note: For Gmail with 2FA, use an App Password
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: '465', // Yahoo requires 465 port
    secure: true, // Yahoo requires SSL/TLS
  },
  outlook365: {
    host: 'smtp.office365.com',
    port: '587',
    secure: false,
  },
  resend: {
    host: 'smtp.resend.com',
    port: '465',
    secure: true, // Resend requires SSL/TLS for port 465
  },
  custom: {
    host: '',
    port: '587',
    secure: false,
  },
};

export const defaultEmailConfig: EmailConfig = {
  provider: 'gmail',
  host: defaultConfigs.gmail.host || '',
  port: defaultConfigs.gmail.port || '',
  username: '',
  password: '',
  fromEmail: '',
  fromName: 'Resource Management System',
  secure: defaultConfigs.gmail.secure || false,
  enabled: false,
};
