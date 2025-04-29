import React, { useState } from 'react';
import Header from '@/components/Layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEmailConfig, EmailConfig } from '@/hooks/useEmailConfig';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useBackupConfig } from '@/hooks/useBackupConfig';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Settings, Mail, Download, Upload, Clock, Database, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AdminSettings() {
  const { emailConfig, updateEmailConfig, sendTestEmail } = useEmailConfig();
  const { backupConfig, updateBackupConfig, createBackup, importBackup } = useBackupConfig();
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const isMobile = useIsMobile();

  const handleProviderChange = (provider: EmailConfig['provider']) => {
    updateEmailConfig({ provider });
  };

  const handleTestEmail = async () => {
    if (!testEmailRecipient) {
      toast({
        title: "Error",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    try {
      const success = await sendTestEmail(testEmailRecipient);
      if (success) {
        toast({
          title: "Test Email Sent",
          description: `A test email was sent to ${testEmailRecipient}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send test email. Please check your SMTP settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the test email.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveConfig = () => {
    updateEmailConfig(emailConfig);
    toast({
      title: "Settings Saved",
      description: "Email configuration has been saved.",
    });
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const result = await createBackup();
      if (result.success) {
        toast({
          title: "Backup Created",
          description: `Backup file "${result.filename}" has been created and downloaded.`,
        });
      } else {
        toast({
          title: "Backup Failed",
          description: "Failed to create backup. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the backup.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleImportBackup = async () => {
    if (!backupFile) {
      toast({
        title: "Error",
        description: "Please select a backup file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const result = await importBackup(backupFile);
      if (result.success) {
        toast({
          title: "Backup Imported",
          description: "Data has been successfully restored from backup.",
        });
        // Reload the page to reflect the imported data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({
          title: "Import Failed",
          description: result.error || "Failed to import backup. Please check the file format.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while importing the backup.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setBackupFile(null);
    }
  };

  const ScheduleBackupDialog = () => {
    return isMobile ? (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Schedule Backups</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Schedule Automatic Backups</DrawerTitle>
            <DrawerDescription>Configure when backups should be automatically created.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-backup"
                checked={backupConfig.enabled}
                onCheckedChange={(checked) => updateBackupConfig({ enabled: checked })}
              />
              <Label htmlFor="auto-backup">Enable automated backups</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select
                value={backupConfig.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  updateBackupConfig({ frequency: value })
                }
                disabled={!backupConfig.enabled}
              >
                <SelectTrigger id="backup-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-time">Backup Time</Label>
              <Select
                value={backupConfig.backupTime}
                onValueChange={(time) => updateBackupConfig({ backupTime: time })}
                disabled={!backupConfig.enabled}
              >
                <SelectTrigger id="backup-time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-retention">Keep backups for</Label>
              <Select
                value={backupConfig.retention.toString()}
                onValueChange={(days) => updateBackupConfig({ retention: parseInt(days) })}
                disabled={!backupConfig.enabled}
              >
                <SelectTrigger id="backup-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter>
            <Button 
              onClick={() => toast({ title: "Settings Saved", description: "Backup schedule has been updated" })}
            >
              Save Schedule
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ) : (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Schedule Backups</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Automatic Backups</DialogTitle>
            <DialogDescription>Configure when backups should be automatically created.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-backup-dialog"
                checked={backupConfig.enabled}
                onCheckedChange={(checked) => updateBackupConfig({ enabled: checked })}
              />
              <Label htmlFor="auto-backup-dialog">Enable automated backups</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-frequency-dialog">Backup Frequency</Label>
              <Select
                value={backupConfig.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  updateBackupConfig({ frequency: value })
                }
                disabled={!backupConfig.enabled}
              >
                <SelectTrigger id="backup-frequency-dialog">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-time-dialog">Backup Time</Label>
              <Select
                value={backupConfig.backupTime}
                onValueChange={(time) => updateBackupConfig({ backupTime: time })}
                disabled={!backupConfig.enabled}
              >
                <SelectTrigger id="backup-time-dialog">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-retention-dialog">Keep backups for</Label>
              <Select
                value={backupConfig.retention.toString()}
                onValueChange={(days) => updateBackupConfig({ retention: parseInt(days) })}
                disabled={!backupConfig.enabled}
              >
                <SelectTrigger id="backup-retention-dialog">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => toast({ title: "Settings Saved", description: "Backup schedule has been updated" })}
            >
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Header title="Admin Settings" />
      <main className="flex-1 space-y-6 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Settings</h1>
        
        <Tabs defaultValue="email">
          <TabsList>
            <TabsTrigger value="email">Email Configuration</TabsTrigger>
            <TabsTrigger value="backup">Data Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email SMTP Configuration</CardTitle>
                <CardDescription>
                  Configure email settings to enable sending notifications to users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="emailProvider">Email Provider</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['gmail', 'yahoo', 'outlook365', 'resend', 'custom'] as const).map((provider) => (
                      <Button
                        key={provider}
                        type="button"
                        variant={emailConfig.provider === provider ? "default" : "outline"}
                        onClick={() => handleProviderChange(provider)}
                        className="capitalize"
                      >
                        {provider === 'outlook365' ? 'Outlook 365' : provider}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input 
                      id="smtpHost"
                      value={emailConfig.host}
                      onChange={(e) => updateEmailConfig({ host: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={emailConfig.port}
                      onChange={(e) => updateEmailConfig({ port: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="smtpUsername">Username</Label>
                    <Input
                      id="smtpUsername"
                      value={emailConfig.username}
                      onChange={(e) => updateEmailConfig({ username: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="smtpPassword">Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailConfig.password}
                      onChange={(e) => updateEmailConfig({ password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      placeholder="notifications@example.com"
                      value={emailConfig.fromEmail}
                      onChange={(e) => updateEmailConfig({ fromEmail: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      placeholder="Resource Management System"
                      value={emailConfig.fromName}
                      onChange={(e) => updateEmailConfig({ fromName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="secureConnection"
                    checked={emailConfig.secure}
                    onCheckedChange={(checked) => updateEmailConfig({ secure: checked })}
                  />
                  <Label htmlFor="secureConnection">Use secure connection (SSL/TLS)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEmails"
                    checked={emailConfig.enabled}
                    onCheckedChange={(checked) => updateEmailConfig({ enabled: checked })}
                  />
                  <Label htmlFor="enableEmails">Enable email notifications</Label>
                </div>

                <div className="border p-4 rounded-md bg-muted/50 space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="testEmail">Test Email</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="testEmail"
                        placeholder="recipient@example.com"
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                      />
                      <Button 
                        onClick={handleTestEmail} 
                        disabled={isSendingTest || !emailConfig.enabled || !emailConfig.fromEmail || !emailConfig.host}
                      >
                        {isSendingTest ? "Sending..." : "Send Test"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveConfig}>Save Configuration</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Backup & Restore</CardTitle>
                <CardDescription>
                  Create manual backups, schedule automatic backups, or restore from previous backups.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Manual Backup</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a backup of all data and settings right now.
                    </p>
                  </div>
                  <Button 
                    onClick={handleCreateBackup}
                    disabled={isCreatingBackup}
                    className="gap-2"
                  >
                    <Database className="h-5 w-5 mr-2" />
                    {isCreatingBackup ? 'Creating Backup...' : 'Create Backup'}
                  </Button>
                </div>
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Scheduled Backups</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure automatic backups on a regular schedule.
                    </p>
                  </div>
                  <ScheduleBackupDialog />
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">Restore from Backup</h3>
                      <p className="text-sm text-muted-foreground">
                        Import a backup file to restore your data.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                        className="max-w-xs"
                      />
                      <Button 
                        onClick={handleImportBackup}
                        disabled={isImporting || !backupFile}
                        variant="outline"
                      >
                        {isImporting ? 'Importing...' : 'Import & Restore'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
