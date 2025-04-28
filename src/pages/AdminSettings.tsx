
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

export default function AdminSettings() {
  const { emailConfig, updateEmailConfig, sendTestEmail } = useEmailConfig();
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

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

  return (
    <>
      <Header title="Admin Settings" />
      <main className="flex-1 space-y-6 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Settings</h1>
        
        <Tabs defaultValue="email">
          <TabsList>
            <TabsTrigger value="email">Email Configuration</TabsTrigger>
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
        </Tabs>
      </main>
    </>
  );
}
