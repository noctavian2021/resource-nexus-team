const express = require('express');
const cors = require('cors');
const { db, getNextId } = require('./data');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure backups directory exists
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Middleware with increased request size limit
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root API route for testing connection
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.path}`);
  next();
});

app.get('/api', (req, res) => {
  res.json({ message: 'Resource Nexus API is running' });
});

// --- Team Members Endpoints ---
// Get all team members
app.get('/api/team-members', (req, res) => {
  res.json(db.teamMembers);
});

// Get team member by ID
app.get('/api/team-members/:id', (req, res) => {
  const member = db.teamMembers.find(m => m.id === req.params.id);
  if (!member) return res.status(404).json({ error: 'Team member not found' });
  res.json(member);
});

// Create team member
app.post('/api/team-members', (req, res) => {
  const newMember = {
    id: getNextId('teamMembers'),
    ...req.body,
    projects: req.body.projects || []
  };
  
  db.teamMembers.push(newMember);
  res.status(201).json(newMember);
});

// Update team member
app.put('/api/team-members/:id', (req, res) => {
  const index = db.teamMembers.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Team member not found' });
  
  db.teamMembers[index] = { ...db.teamMembers[index], ...req.body };
  res.json(db.teamMembers[index]);
});

// Delete team member
app.delete('/api/team-members/:id', (req, res) => {
  const index = db.teamMembers.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Team member not found' });
  
  const deletedMember = db.teamMembers[index];
  db.teamMembers.splice(index, 1);
  res.json({ message: 'Team member deleted', member: deletedMember });
});

// --- Departments Endpoints ---
// Get all departments
app.get('/api/departments', (req, res) => {
  res.json(db.departments);
});

// Get department by ID
app.get('/api/departments/:id', (req, res) => {
  const department = db.departments.find(d => d.id === req.params.id);
  if (!department) return res.status(404).json({ error: 'Department not found' });
  res.json(department);
});

// Create department - Updated to properly handle optional leadId
app.post('/api/departments', (req, res) => {
  const newDepartment = {
    id: getNextId('departments'),
    ...req.body,
    // Only set leadId if it's provided in the request body
    leadId: req.body.leadId ?? '', // Use nullish coalescing to handle null/undefined
    isHidden: false // Set default value for isHidden
  };
  
  db.departments.push(newDepartment);
  res.status(201).json(newDepartment);
});

// Update department
app.put('/api/departments/:id', (req, res) => {
  const index = db.departments.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Department not found' });
  
  db.departments[index] = { ...db.departments[index], ...req.body };
  res.json(db.departments[index]);
});

// Delete department
app.delete('/api/departments/:id', (req, res) => {
  const index = db.departments.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Department not found' });
  
  const deletedDepartment = db.departments[index];
  db.departments.splice(index, 1);
  res.json({ message: 'Department deleted', department: deletedDepartment });
});

// --- Projects Endpoints ---
// Get all projects
app.get('/api/projects', (req, res) => {
  res.json(db.projects);
});

// Get project by ID
app.get('/api/projects/:id', (req, res) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// Create project - Now setting default isHidden to false
app.post('/api/projects', (req, res) => {
  const newProject = {
    id: getNextId('projects'),
    ...req.body,
    teamMembers: req.body.teamMembers || [],
    progress: req.body.progress || 0,
    isHidden: false // Set default value for isHidden
  };
  
  db.projects.push(newProject);
  res.status(201).json(newProject);
});

// Update project - Now properly handling isHidden property
app.put('/api/projects/:id', (req, res) => {
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });
  
  db.projects[index] = { ...db.projects[index], ...req.body };
  res.json(db.projects[index]);
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  const index = db.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });
  
  const deletedProject = db.projects[index];
  db.projects.splice(index, 1);
  res.json({ message: 'Project deleted', project: deletedProject });
});

// --- Email API ---
// New endpoint for sending test emails
app.post('/api/email/send-test', async (req, res) => {
  try {
    const { config, recipient, subject, text, html } = req.body;
    
    if (!config || !recipient) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email configuration and recipient are required' 
      });
    }

    console.log('Sending test email to:', recipient);
    console.log('Using email configuration:', JSON.stringify({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        // Mask password in logs
        pass: '********'
      },
      from: `"${config.fromName}" <${config.fromEmail}>`,
    }, null, 2));

    // Configure appropriate options based on port and provider
    const transportOptions = {
      host: config.host,
      port: parseInt(config.port),
      secure: config.secure, // Use config.secure value
      auth: {
        user: config.username,
        pass: config.password,
      },
      // Extended timeout settings
      connectionTimeout: 30000,  // 30 seconds
      greetingTimeout: 30000,    // 30 seconds
      socketTimeout: 30000,      // 30 seconds
      debug: true,
      logger: true,
    };
    
    // Add TLS options for all email providers to improve connection reliability
    transportOptions.tls = {
      // Don't reject connections with self-signed certificates
      rejectUnauthorized: false,
      // Ensure we use modern TLS versions
      minVersion: 'TLSv1.2',
      // Use secure ciphers
      ciphers: 'HIGH:!aNULL:!MD5',
    };
    
    // Special Gmail settings
    if (config.provider === 'gmail') {
      console.log('Adding special TLS options for Gmail');
      // Gmail specific settings already added in common TLS block above
    }

    // Create a transporter with the provided configuration
    const transporter = nodemailer.createTransport(transportOptions);

    // Verify connection configuration
    try {
      console.log('Verifying SMTP connection...');
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      let errorMessage = `Failed to connect to SMTP server: ${verifyError.message}`;
      
      // Enhanced error messages for common issues
      if (verifyError.message.includes('Greeting never received')) {
        errorMessage = 'SMTP greeting timeout. This might be due to network issues, temporarily blocked IP, or incorrect credentials. Try again in a few minutes.';
      }
      
      if (verifyError.message.includes('SSL routines') || verifyError.message.includes('wrong version number')) {
        errorMessage = 'SSL/TLS connection failed. Your secure setting may not match what the server expects. If your port is 587, try setting secure=false. If your port is 465, try setting secure=true.';
      }
      
      return res.status(400).json({ 
        success: false, 
        error: errorMessage
      });
    }

    // Send mail
    const mailOptions = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: recipient,
      subject,
      text,
      html,
    };

    console.log('Sending email with these options:', JSON.stringify(mailOptions, null, 2));
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info);
    console.log('Message ID:', info.messageId);
    console.log('SMTP response:', info.response);

    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: info.messageId,
      smtpResponse: info.response
    });
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Enhanced error handling with specific guidance
    let errorMessage = `Failed to send email: ${error.message}`;
    
    // SSL/TLS specific error messages
    if (error.message.includes('SSL routines') || error.message.includes('wrong version number')) {
      errorMessage = 'SSL/TLS connection failed. Your secure setting may not match what the server expects. If your port is 587, try setting secure=false. If your port is 465, try setting secure=true.';
    }
    
    if (error.message.includes('Greeting never received')) {
      errorMessage = 'SMTP connection timed out waiting for greeting. This could be due to network issues or security measures. Try again in a few minutes or check your credentials.';
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage
    });
  }
});

app.post('/api/email/send-welcome', async (req, res) => {
  try {
    const { email, replacingMember, additionalNotes, requiredResources = [], emailConfig } = req.body;
    
    // Check if we have email configuration
    if (!emailConfig || !emailConfig.enabled) {
      // Fall back to the simulated email if no config
      console.log('Sending welcome email to:', email);
      console.log('Replacing member:', replacingMember);
      console.log('Additional notes:', additionalNotes);
      console.log('Required resources:', requiredResources);
      
      // Simulate email send
      setTimeout(() => {
        res.json({ 
          success: true, 
          message: 'Welcome email sent successfully (simulated)' 
        });
      }, 1000);
      return;
    }
    
    // If we have email config, try to send a real email
    console.log('Attempting to send real email with config:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      provider: emailConfig.provider
    });
    
    // Configure appropriate options based on port and provider
    const transportOptions = {
      host: emailConfig.host,
      port: parseInt(emailConfig.port),
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.username,
        pass: emailConfig.password,
      },
      // Extended timeout settings for slower connections
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 30000,     // 30 seconds
    };
    
    // Add TLS options to improve connection reliability for ALL email providers
    transportOptions.tls = {
      // Don't fail on invalid certificates - many email providers use self-signed certs
      rejectUnauthorized: false,
      // Use modern TLS versions only
      minVersion: 'TLSv1.2',
      // Use secure ciphers
      ciphers: 'HIGH:!aNULL:!MD5'
    };
    
    // Create transporter with the enhanced options
    const transporter = nodemailer.createTransport(transportOptions);

    // Verify connection first
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      
      // Provide detailed error message based on the specific error
      let errorMessage = `Failed to connect to SMTP server: ${verifyError.message}`;
      
      if (verifyError.message.includes('SSL routines') || verifyError.message.includes('wrong version number')) {
        errorMessage = 'SSL/TLS connection failed. Your secure setting may not match what the server expects. If your port is 587, try setting secure=false. If your port is 465, try setting secure=true.';
      }
      
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }

    const mailOptions = {
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: email,
      subject: 'Welcome to the Team!',
      text: `Welcome to the team! ${additionalNotes || ''}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the Team!</h2>
          <p>We're excited to have you join us.</p>
          ${replacingMember && replacingMember !== 'none' ? 
            `<p>You'll be replacing ${replacingMember}. They'll help with the transition.</p>` : ''}
          ${additionalNotes ? `<p>${additionalNotes}</p>` : ''}
          <hr>
          <p style="color: #666; font-size: 12px;">Resource Management System</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info);

    res.json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Welcome email sending error:', error);
    
    // Provide more specific error message based on the error type
    let errorMessage = `Failed to send welcome email: ${error.message}`;
    
    // Handle SSL/TLS specific errors with clear guidance
    if (error.message.includes('SSL routines') || error.message.includes('wrong version number')) {
      errorMessage = 'SSL/TLS connection failed. Your secure setting may not match what the server expects. If your port is 587, try setting secure=false. If your port is 465, try setting secure=true.';
    }
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

// New endpoint for sending activity reports
app.post('/api/email/send-activity-report', async (req, res) => {
  try {
    const { recipients, reportType, activities, emailConfig } = req.body;
    
    // Check if we have email configuration
    if (!emailConfig || !emailConfig.enabled) {
      // Fall back to the simulated email if no config
      console.log('Sending activity report to:', recipients);
      console.log('Report type:', reportType);
      console.log('Activities count:', activities ? activities.length : 0);
      
      // Simulate email send
      setTimeout(() => {
        res.json({ 
          success: true, 
          message: 'Activity report sent successfully (simulated)',
          recipientCount: recipients.length,
          timestamp: new Date().toISOString()
        });
      }, 1000);
      return;
    }
    
    // If we have email config, try to send a real email
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: parseInt(emailConfig.port),
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.username,
        pass: emailConfig.password,
      },
    });

    const mailOptions = {
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: recipients.join(', '),
      subject: `${reportType} Activity Report`,
      text: `Here is your ${reportType} activity report with ${activities.length} activities.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${reportType} Activity Report</h2>
          <p>This report contains ${activities ? activities.length : 0} activities.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Resource Management System</p>
        </div>
      `,
      // In a real implementation, attach the PDF report here
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Activity report email sent successfully:', info);

    res.json({ 
      success: true, 
      message: 'Activity report sent successfully',
      recipientCount: recipients.length,
      timestamp: new Date().toISOString(),
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Activity report email sending error:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to send activity report: ${error.message}` 
    });
  }
});

// New endpoint for managing scheduled reports
app.post('/api/email/schedule-report', (req, res) => {
  const { schedule } = req.body;
  
  // In a real app, this would save the schedule to a database
  // and a scheduled task would handle sending the reports
  console.log('Setting up report schedule:', schedule);
  
  res.json({
    success: true,
    message: 'Report schedule saved successfully',
    schedule
  });
});

// --- Backup & Restore API ---
// Create a backup of all data
app.post('/api/backup/create', (req, res) => {
  try {
    // Create backup object with metadata
    const timestamp = new Date();
    const backupData = {
      metadata: {
        version: '1.0',
        createdAt: timestamp.toISOString(),
        type: 'resource-nexus-server-backup'
      },
      data: db
    };
    
    // Generate unique filename
    const filename = `backup-${timestamp.toISOString().replace(/:/g, '-')}.json`;
    const filePath = path.join(backupsDir, filename);
    
    // Write backup file
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    
    res.status(200).json({
      success: true,
      message: 'Backup created successfully',
      filename,
      timestamp: timestamp.toISOString(),
      size: fs.statSync(filePath).size
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create backup',
      details: error.message
    });
  }
});

// Export server data for integrated backup - FIXED ENDPOINT
app.get('/api/backup/export-data', (req, res) => {
  try {
    // Return the current database state
    res.status(200).json({
      success: true,
      data: db
    });
  } catch (error) {
    console.error('Error exporting server data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export server data',
      details: error.message
    });
  }
});

// Get list of available backups
app.get('/api/backup/list', (req, res) => {
  try {
    const files = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          created: stats.birthtime,
          size: stats.size
        };
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    
    res.json({
      success: true,
      backups: files
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list backups',
      details: error.message
    });
  }
});

// Download a specific backup
app.get('/api/backup/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(backupsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Backup file not found'
      });
    }
    
    res.download(filePath, filename);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download backup',
      details: error.message
    });
  }
});

// Restore from a backup file
app.post('/api/backup/restore', express.raw({ type: 'application/json', limit: '50mb' }), (req, res) => {
  try {
    // Parse the uploaded backup
    const backupData = JSON.parse(req.body.toString());
    
    // Validate backup file
    if (!backupData.metadata) {
      return res.status(400).json({
        success: false,
        error: 'Invalid backup file format: missing metadata'
      });
    }
    
    // Check valid backup types
    const validTypes = [
      'resource-nexus-backup',          // Legacy type
      'resource-nexus-server-backup',   // New server type
      'resource-nexus-pre-restore-backup'
    ];
    
    if (!validTypes.includes(backupData.metadata.type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid backup type: ${backupData.metadata.type}`
      });
    }
    
    // Check that we have data to restore
    if (!backupData.data) {
      return res.status(400).json({
        success: false,
        error: 'No data found in backup file'
      });
    }
    
    // Back up the current state before restoring
    const timestamp = new Date();
    const preRestoreBackupName = `pre-restore-backup-${timestamp.toISOString().replace(/:/g, '-')}.json`;
    const preRestoreBackupPath = path.join(backupsDir, preRestoreBackupName);
    
    const currentData = {
      metadata: {
        version: '1.0',
        createdAt: timestamp.toISOString(),
        type: 'resource-nexus-pre-restore-backup'
      },
      data: db
    };
    
    fs.writeFileSync(preRestoreBackupPath, JSON.stringify(currentData, null, 2));
    
    // Restore the data
    Object.assign(db, backupData.data);
    
    res.status(200).json({
      success: true,
      message: 'Backup restored successfully',
      preRestoreBackup: preRestoreBackupName
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore backup',
      details: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
