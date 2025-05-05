export const getProviderHelp = (provider: string) => {
  switch (provider) {
    case 'gmail':
      return {
        title: 'Gmail Configuration Help',
        content: `
          To use Gmail, you'll need:
          - Host: smtp.gmail.com
          - Port: 587
          - Secure: No (uses STARTTLS)
          - Username: Your full Gmail address
          - Password: Your Gmail password OR an App Password
          
          If you have 2-factor authentication enabled, you MUST generate an App Password:
          1. Go to your Google Account > Security > App passwords
          2. Create a new App Password for "Mail" and "Other" (name it "Resource Management")
          3. Use the 16-character generated password in place of your regular password
          
          Note: Google limits sending to 500 emails per day for free accounts.
        `,
      };
    case 'outlook':
    case 'outlook365':
      return {
        title: 'Outlook Configuration Help',
        content: `
          To use Outlook/Office 365:
          - Host: smtp.office365.com
          - Port: 587
          - Secure: No (uses STARTTLS)
          - Username: Your full Outlook email
          - Password: Your Outlook password
          
          Note: If you use 2FA with your Microsoft account, you'll need to generate an app password
          from your Microsoft account security settings.
        `,
      };
    case 'yahoo':
      return {
        title: 'Yahoo Mail Configuration Help',
        content: `
          To use Yahoo Mail:
          - Host: smtp.mail.yahoo.com
          - Port: 465
          - Secure: Yes
          - Username: Your Yahoo email address
          - Password: Your Yahoo password OR an app password
          
          Important: If you have 2-step verification enabled for Yahoo:
          1. Go to Yahoo Account Security settings
          2. Generate an app password under "App passwords"
          3. Use that instead of your regular password
        `,
      };
    case 'resend':
      return {
        title: 'Resend Configuration Help',
        content: `
          To use Resend:
          - Host: smtp.resend.com
          - Port: 465
          - Secure: Yes
          - Username: Your Resend API key
          - Password: Can be left blank
          - From Email: Must use a verified domain or the default onboarding@resend.dev
          
          Resend requires domain verification for production use.
        `,
      };
    case 'custom':
    default:
      return {
        title: 'SMTP Configuration Help',
        content: `
          You'll need to get these details from your email provider:
          - SMTP host name
          - SMTP port (commonly 25, 465, or 587)
          - Whether a secure connection is required
          - Your username (often your email address)
          - Your password or an app-specific password
          
          Common issues:
          - Port 465 usually requires Secure = Yes
          - Port 587 usually requires Secure = No (STARTTLS)
          - If you use 2FA, you likely need an app-specific password
        `,
      };
  }
};

export const normalizeProviderConfig = (config: any) => {
  if (config.provider === 'resend') {
    config.port = '465';
    config.secure = true;
  }

  if (config.provider === 'yahoo') {
    config.port = '465';
    config.secure = true;
  }

  if (config.provider === 'outlook') {
    config.port = '587';
    config.secure = false;
  }

  if (config.provider === 'gmail') {
    config.port = '587';
    config.secure = false;
  }

  // Add special handling for Gmail
  if (config.provider === 'gmail') {
    // Make sure username is the full email address
    if (config.username && !config.username.includes('@')) {
      config.username = `${config.username}@gmail.com`;
    }
    
    // Make sure using correct port and secure settings
    if (config.port !== '587') {
      console.warn('Gmail typically uses port 587, but found', config.port);
    }
    
    if (config.secure !== false) {
      console.warn('Gmail on port 587 should have secure=false (uses STARTTLS)');
    }
  }

  return config;
};

export const getConnectionErrorHelp = (errorMessage: string, provider: string) => {
  // Special handling for Gmail authentication errors
  if (errorMessage.includes('Username and Password not accepted') && provider === 'gmail') {
    return "Authentication failed. If you have 2FA enabled on your Google account, you must use an App Password. Go to your Google Account > Security > App passwords to generate one.";
  }
  
  if (errorMessage.includes('Greeting never received')) {
    if (provider === 'gmail') {
      return "Connection timed out. This may be due to incorrect SMTP settings or firewall issues. Also, make sure you've enabled 'Less secure app access' in your Gmail settings or are using an App Password if you have 2FA enabled.";
    } else if (provider === 'yahoo') {
      return "Connection timed out. This may be due to incorrect SMTP settings. If you have 2-Step Verification enabled, you need to generate an App Password in your Yahoo account settings.";
    } else if (provider === 'outlook') {
      return "Connection timed out. This may be due to incorrect SMTP settings. If you have 2-Step Verification enabled, you need to generate an App Password in your Microsoft account settings.";
    } else {
      return "Connection timed out. This may be due to incorrect SMTP settings or firewall issues. Please check your email provider's documentation for the correct settings.";
    }
  }
  
  // Return default message if no specific match
  return errorMessage;
};
