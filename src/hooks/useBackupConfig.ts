
import { useState, useEffect } from 'react';
import apiRequest from '@/services/api';

export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string; // Format: "HH:00"
  retention: number; // Days to keep backups
  lastBackup: string | null; // ISO date string
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
  const [backupsHistory, setBackupsHistory] = useState<Array<{ date: string; filename: string }>>([]);

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
  }, []);

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
            createBackup();
          }
        }
      }
    };

    // Check once on mount, then every minute
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [backupConfig]);

  // Create a backup
  const createBackup = async () => {
    console.log('Creating backup...');
    
    try {
      // In a real implementation, we'd call an API endpoint
      // For now, we'll simulate by creating a downloadable file with localStorage data
      
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
        type: 'resource-nexus-backup'
      };
      
      const backup = { metadata, data };
      
      // Create file for download
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create filename
      const filename = `resource-nexus-backup-${timestamp.toISOString().replace(/:/g, '-')}.json`;
      
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
        { date: timestamp.toISOString(), filename },
        ...backupsHistory.slice(0, 9) // Keep only the 10 most recent entries
      ];
      setBackupsHistory(updatedHistory);
      localStorage.setItem('backupsHistory', JSON.stringify(updatedHistory));
      
      return { success: true, filename };
    } catch (error) {
      console.error('Backup creation failed:', error);
      return { success: false, error: String(error) };
    }
  };

  // Import and restore from backup
  const importBackup = async (file: File) => {
    try {
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            if (!event.target?.result) {
              resolve({ success: false, error: 'Failed to read file' });
              return;
            }
            
            const backupData = JSON.parse(event.target.result as string);
            
            // Validate backup file
            if (!backupData.metadata || backupData.metadata.type !== 'resource-nexus-backup') {
              resolve({ success: false, error: 'Invalid backup file' });
              return;
            }
            
            // Make sure we have data to restore
            if (!backupData.data) {
              resolve({ success: false, error: 'No data found in backup file' });
              return;
            }
            
            // Restore all data to localStorage
            Object.entries(backupData.data).forEach(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                localStorage.setItem(key, JSON.stringify(value));
              } else {
                localStorage.setItem(key, String(value));
              }
            });
            
            resolve({ success: true });
          } catch (error) {
            console.error('Error parsing backup file:', error);
            resolve({ success: false, error: 'Could not parse backup file' });
          }
        };
        
        reader.onerror = () => {
          resolve({ success: false, error: 'Failed to read file' });
        };
        
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, error: String(error) };
    }
  };

  return {
    backupConfig,
    updateBackupConfig,
    createBackup,
    importBackup,
    backupsHistory
  };
};
