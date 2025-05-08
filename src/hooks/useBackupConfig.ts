import { useState, useEffect } from 'react';
import apiRequest, { API_URL } from '@/services/apiClient';

export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string; // Format: "HH:00"
  retention: number; // Days to keep backups
  lastBackup: string | null; // ISO date string
}

export interface ServerBackupInfo {
  filename: string;
  created: string;
  size: number;
}

const defaultConfig: BackupConfig = {
  enabled: false,
  frequency: 'daily',
  backupTime: '03:00', // Default to 3 AM
  retention: 30, // 30 days default
  lastBackup: null,
};

export const useBackupConfig = () => {
  const [backupConfig, setBackupConfig] = useState<BackupConfig>(defaultConfig);
  const [backupsHistory, setBackupsHistory] = useState<Array<{ date: string; filename: string; type: 'client' | 'server' | 'integrated' }>>([]);
  const [serverBackups, setServerBackups] = useState<ServerBackupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    const storedConfig = localStorage.getItem('backupConfig');
    if (storedConfig) {
      try {
        setBackupConfig(JSON.parse(storedConfig));
      } catch (e) {
        console.error('Failed to parse backup config:', e);
        // Reset to default if parsing fails
        localStorage.setItem('backupConfig', JSON.stringify(defaultConfig));
      }
    } else {
      // Save default config to localStorage if none exists
      localStorage.setItem('backupConfig', JSON.stringify(defaultConfig));
    }
    
    // Load backup history
    const storedHistory = localStorage.getItem('backupsHistory');
    if (storedHistory) {
      try {
        setBackupsHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Failed to parse backups history:', e);
      }
    }

    // Fetch server backups
    fetchServerBackups();
  }, []);

  // Fetch available server backups
  const fetchServerBackups = async () => {
    try {
      const response = await apiRequest<{ success: boolean; backups: ServerBackupInfo[] }>('backup/list');
      if (response.success && response.backups) {
        setServerBackups(response.backups);
      }
    } catch (error) {
      console.error('Failed to fetch server backups:', error);
    }
  };

  // Update backup configuration
  const updateBackupConfig = (config: Partial<BackupConfig>) => {
    const updatedConfig = { ...backupConfig, ...config };
    setBackupConfig(updatedConfig);
    localStorage.setItem('backupConfig', JSON.stringify(updatedConfig));
    return updatedConfig;
  };

  // Check if it's time to run a scheduled backup
  useEffect(() => {
    if (!backupConfig.enabled) return;

    const checkSchedule = () => {
      const now = new Date();
      const [hour, minute] = backupConfig.backupTime.split(':').map(Number);
      
      // Check if it's time for backup
      if (now.getHours() === hour && now.getMinutes() === 0) {
        // Check frequency
        if (backupConfig.frequency === 'daily' || 
            (backupConfig.frequency === 'weekly' && now.getDay() === 0) || // Sunday
            (backupConfig.frequency === 'monthly' && now.getDate() === 1)) { // First day of month
          
          // Check if we already had a backup today
          const lastBackupDate = backupConfig.lastBackup ? new Date(backupConfig.lastBackup) : null;
          if (!lastBackupDate || lastBackupDate.toDateString() !== now.toDateString()) {
            createIntegratedBackup();
          }
        }
      }
    };

    // Check once on mount, then every minute
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [backupConfig]);

  // Create a client-only backup (localStorage data)
  const createClientBackup = async () => {
    console.log('Creating client backup...');
    
    try {
      // Collect all data from localStorage
      const data: Record<string, any> = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            // Skip certain keys that don't need backup
            if (['token', 'session'].includes(key)) continue;
            
            data[key] = JSON.parse(localStorage.getItem(key) || 'null');
          } catch {
            // If it's not JSON, store as string
            data[key] = localStorage.getItem(key);
          }
        }
      }
      
      // Add metadata
      const timestamp = new Date();
      const metadata = {
        version: '1.0',
        createdAt: timestamp.toISOString(),
        type: 'resource-nexus-client-backup'
      };
      
      const backup = { metadata, data };
      
      // Create file for download
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create filename
      const filename = `resource-nexus-client-backup-${timestamp.toISOString().replace(/:/g, '-')}.json`;
      
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      // Update last backup time
      updateBackupConfig({ lastBackup: timestamp.toISOString() });
      
      // Add to history
      const updatedHistory = [
        { date: timestamp.toISOString(), filename, type: 'client' as const },
        ...backupsHistory.slice(0, 9) // Keep only the 10 most recent entries
      ];
      setBackupsHistory(updatedHistory);
      localStorage.setItem('backupsHistory', JSON.stringify(updatedHistory));
      
      return { success: true, filename };
    } catch (error) {
      console.error('Client backup creation failed:', error);
      return { success: false, error: String(error) };
    }
  };

  // Create a server-only backup
  const createServerBackup = async () => {
    console.log('Creating server backup...');
    
    try {
      setIsLoading(true);
      const response = await apiRequest<{
        success: boolean;
        filename: string;
        timestamp: string;
        size: number;
        error?: string;
      }>('backup/create', 'POST');
      
      if (!response.success) {
        throw new Error(response.error || 'Server backup failed');
      }
      
      // Add to history
      const updatedHistory = [
        { 
          date: response.timestamp, 
          filename: response.filename, 
          type: 'server' as const 
        },
        ...backupsHistory.slice(0, 9) // Keep only the 10 most recent entries
      ];
      setBackupsHistory(updatedHistory);
      localStorage.setItem('backupsHistory', JSON.stringify(updatedHistory));
      
      // Refresh server backups list
      await fetchServerBackups();
      
      return { 
        success: true, 
        filename: response.filename,
        timestamp: response.timestamp
      };
    } catch (error) {
      console.error('Server backup creation failed:', error);
      return { success: false, error: String(error) };
    } finally {
      setIsLoading(false);
    }
  };

  // Create an integrated backup (both client and server data)
  const createIntegratedBackup = async () => {
    console.log('Creating integrated backup...');
    
    try {
      setIsLoading(true);
      
      // Collect all data from localStorage
      const clientData: Record<string, any> = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            // Skip certain keys that don't need backup
            if (['token', 'session'].includes(key)) continue;
            
            clientData[key] = JSON.parse(localStorage.getItem(key) || 'null');
          } catch {
            // If it's not JSON, store as string
            clientData[key] = localStorage.getItem(key);
          }
        }
      }
      
      // Get server data via API
      const serverResponse = await apiRequest<any>('backup/export-data', 'GET');
      
      if (!serverResponse.success) {
        throw new Error('Failed to export server data');
      }
      
      // Create integrated backup object
      const timestamp = new Date();
      const metadata = {
        version: '1.1',
        createdAt: timestamp.toISOString(),
        type: 'resource-nexus-integrated-backup'
      };
      
      const backup = { 
        metadata, 
        clientData,
        serverData: serverResponse.data
      };
      
      // Create file for download
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create filename
      const filename = `resource-nexus-integrated-backup-${timestamp.toISOString().replace(/:/g, '-')}.json`;
      
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      // Update last backup time
      updateBackupConfig({ lastBackup: timestamp.toISOString() });
      
      // Add to history
      const updatedHistory = [
        { 
          date: timestamp.toISOString(), 
          filename, 
          type: 'integrated' as const
        },
        ...backupsHistory.slice(0, 9) // Keep only the 10 most recent entries
      ];
      setBackupsHistory(updatedHistory);
      localStorage.setItem('backupsHistory', JSON.stringify(updatedHistory));
      
      return { success: true, filename };
    } catch (error) {
      console.error('Integrated backup creation failed:', error);
      return { success: false, error: String(error) };
    } finally {
      setIsLoading(false);
    }
  };

  // Import and restore from backup
  const importBackup = async (file: File) => {
    try {
      setIsLoading(true);
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            if (!event.target?.result) {
              resolve({ success: false, error: 'Failed to read file' });
              return;
            }
            
            const backupData = JSON.parse(event.target.result as string);
            
            // Validate backup file type
            if (!backupData.metadata) {
              resolve({ success: false, error: 'Invalid backup file: missing metadata' });
              return;
            }
            
            // Handle different types of backups
            switch(backupData.metadata.type) {
              case 'resource-nexus-client-backup':
                await handleClientRestore(backupData);
                resolve({ success: true });
                break;
                
              case 'resource-nexus-backup': // Legacy type
              case 'resource-nexus-server-backup':
                await handleServerRestore(backupData);
                resolve({ success: true });
                break;
                
              case 'resource-nexus-integrated-backup':
                await handleIntegratedRestore(backupData);
                resolve({ success: true });
                break;
                
              default:
                resolve({ success: false, error: 'Unknown backup type' });
            }
          } catch (error) {
            console.error('Error parsing backup file:', error);
            resolve({ success: false, error: 'Could not parse backup file' });
          } finally {
            setIsLoading(false);
          }
        };
        
        reader.onerror = () => {
          setIsLoading(false);
          resolve({ success: false, error: 'Failed to read file' });
        };
        
        reader.readAsText(file);
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Import failed:', error);
      return { success: false, error: String(error) };
    }
  };
  
  // Handle restoration of client-only backup
  const handleClientRestore = async (backupData: any) => {
    if (!backupData.data) {
      throw new Error('No data found in backup file');
    }
    
    // Restore all data to localStorage
    Object.entries(backupData.data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, String(value));
      }
    });
    
    // Refresh the page to apply changes
    window.location.reload();
    return { success: true };
  };
  
  // Handle restoration of server-only backup
  const handleServerRestore = async (backupData: any) => {
    // Send the backup data to server for restoration
    const response = await apiRequest<{ success: boolean; error?: string }>('backup/restore', 'POST', backupData);
    
    if (!response.success) {
      throw new Error(response.error || 'Server restore failed');
    }
    
    // Refresh the page to apply changes
    window.location.reload();
    return { success: true };
  };
  
  // Handle restoration of integrated backup
  const handleIntegratedRestore = async (backupData: any) => {
    // Validate backup data
    if (!backupData.clientData) {
      throw new Error('No client data found in backup file');
    }
    
    if (!backupData.serverData) {
      throw new Error('No server data found in backup file');
    }
    
    // First restore client data (localStorage)
    Object.entries(backupData.clientData).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, String(value));
      }
    });
    
    // Then restore server data
    const serverRestorePayload = {
      metadata: backupData.metadata,
      data: backupData.serverData
    };
    
    const response = await apiRequest<{ success: boolean; error?: string }>('backup/restore', 'POST', serverRestorePayload);
    
    if (!response.success) {
      throw new Error(response.error || 'Server data restore failed');
    }
    
    // Refresh the page to apply changes
    window.location.reload();
    return { success: true };
  };

  // Download a server backup file
  const downloadServerBackup = async (filename: string) => {
    try {
      window.open(`${API_URL}/api/backup/download/${filename}`, '_blank');
      return { success: true };
    } catch (error) {
      console.error('Error downloading server backup:', error);
      return { success: false, error: String(error) };
    }
  };

  return {
    backupConfig,
    updateBackupConfig,
    createClientBackup,
    createServerBackup,
    createIntegratedBackup,
    importBackup,
    backupsHistory,
    serverBackups,
    downloadServerBackup,
    isLoading
  };
};
