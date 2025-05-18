
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Database,
  Monitor,
  Plugin,
  RefreshCcw
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-crane-blue">Settings</h1>
        <p className="text-muted-foreground">Manage system settings and configurations</p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="flex h-auto flex-wrap justify-start border-b border-border p-0 mb-6">
          <TabsTrigger value="account" className="rounded-none border-b-2 border-transparent py-3 px-6 data-[state=active]:border-b-crane-blue data-[state=active]:bg-transparent">
            <User size={16} className="mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent py-3 px-6 data-[state=active]:border-b-crane-blue data-[state=active]:bg-transparent">
            <Bell size={16} className="mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-none border-b-2 border-transparent py-3 px-6 data-[state=active]:border-b-crane-blue data-[state=active]:bg-transparent">
            <Database size={16} className="mr-2" />
            AI Settings
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-none border-b-2 border-transparent py-3 px-6 data-[state=active]:border-b-crane-blue data-[state=active]:bg-transparent">
            <Plugin size={16} className="mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" defaultValue="Operations Manager" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" placeholder="Email" defaultValue="operations@craneww.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="operations">
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="operations">Operations Manager</SelectItem>
                      <SelectItem value="sales">Sales Representative</SelectItem>
                      <SelectItem value="customer-service">Customer Service Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-crane-blue hover:bg-opacity-90">Update Profile</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="Current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="New password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm password" />
                </div>
                <Button className="w-full bg-crane-blue hover:bg-opacity-90">Change Password</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Email Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shipment-alerts" className="flex-1">Shipment Alerts</Label>
                    <Switch id="shipment-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="document-updates" className="flex-1">Document Processing Updates</Label>
                    <Switch id="document-updates" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quote-notifications" className="flex-1">Quote Notifications</Label>
                    <Switch id="quote-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-updates" className="flex-1">System Updates & Maintenance</Label>
                    <Switch id="system-updates" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">In-App Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="realtime-alerts" className="flex-1">Real-time Alerts</Label>
                    <Switch id="realtime-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="chat-notifications" className="flex-1">Chat Notifications</Label>
                    <Switch id="chat-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="task-reminders" className="flex-1">Task Reminders</Label>
                    <Switch id="task-reminders" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Button className="bg-crane-blue hover:bg-opacity-90">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Default AI Model</Label>
                  <Select defaultValue="gpt4o">
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4o">GPT-4o</SelectItem>
                      <SelectItem value="mistral">Mistral Large</SelectItem>
                      <SelectItem value="llama">Llama 3</SelectItem>
                      <SelectItem value="claude">Claude 3 Opus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Response Temperature</Label>
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.7"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More Precise</span>
                    <span>More Creative</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="context-window" className="flex-1">Extended Context Window</Label>
                    <Switch id="context-window" defaultChecked />
                  </div>
                </div>
                <Button className="w-full bg-crane-blue hover:bg-opacity-90">Save Configuration</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="update-frequency">Update Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Document Sources</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customs-regulations" className="flex-1">Customs Regulations</Label>
                      <Switch id="customs-regulations" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="carrier-schedules" className="flex-1">Carrier Schedules</Label>
                      <Switch id="carrier-schedules" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pricing-database" className="flex-1">Pricing Database</Label>
                      <Switch id="pricing-database" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="internal-docs" className="flex-1">Internal Documentation</Label>
                      <Switch id="internal-docs" defaultChecked />
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  <RefreshCcw size={16} className="mr-2" />
                  Refresh Knowledge Base
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="rounded-md bg-blue-100 p-2 mr-3">
                          <Database size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">TMS Integration</h3>
                          <p className="text-xs text-muted-foreground">Transport Management System</p>
                        </div>
                      </div>
                      <Switch id="tms-integration" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect with your TMS to synchronize shipment data and tracking information.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Configure</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="rounded-md bg-green-100 p-2 mr-3">
                          <FileText size={20} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Document Management</h3>
                          <p className="text-xs text-muted-foreground">Document Repository</p>
                        </div>
                      </div>
                      <Switch id="document-integration" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect with your document management system for automated processing.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Configure</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="rounded-md bg-purple-100 p-2 mr-3">
                          <BarChart3 size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Business Intelligence</h3>
                          <p className="text-xs text-muted-foreground">Data Analytics Platform</p>
                        </div>
                      </div>
                      <Switch id="bi-integration" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect with your BI tools to export analytics and reports.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Configure</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="rounded-md bg-orange-100 p-2 mr-3">
                          <MessageSquare size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Communication Systems</h3>
                          <p className="text-xs text-muted-foreground">Email & Messaging</p>
                        </div>
                      </div>
                      <Switch id="comms-integration" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect with email and messaging platforms for notifications.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">Configure</Button>
                  </div>
                </div>
                
                <Button className="mt-4 bg-crane-blue hover:bg-opacity-90">
                  Save Integration Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
