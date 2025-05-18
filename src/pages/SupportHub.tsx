
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Bot, Layers } from 'lucide-react';
import ChatWindow from '@/components/ai-support/ChatWindow';

const SupportHub = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-crane-blue">AI Support Hub</h1>
        <p className="text-muted-foreground">Intelligent customer and agent support powered by AI</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100 p-3 mb-3">
              <Bot size={24} className="text-crane-blue" />
            </div>
            <CardTitle className="text-lg mb-1">AI Assistant</CardTitle>
            <p className="text-sm text-muted-foreground">Answers customer inquiries using contextual knowledge</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <Users size={24} className="text-crane-teal" />
            </div>
            <CardTitle className="text-lg mb-1">Agent Support</CardTitle>
            <p className="text-sm text-muted-foreground">Provides agents with real-time information and suggestions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-purple-100 p-3 mb-3">
              <Layers size={24} className="text-purple-600" />
            </div>
            <CardTitle className="text-lg mb-1">Knowledge Base</CardTitle>
            <p className="text-sm text-muted-foreground">Access to internal documentation and shipping regulations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-orange-100 p-3 mb-3">
              <MessageSquare size={24} className="text-orange-600" />
            </div>
            <CardTitle className="text-lg mb-1">Multi-Channel</CardTitle>
            <p className="text-sm text-muted-foreground">Support across web, mobile, and internal platforms</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare size={18} className="text-crane-teal mr-2" />
            Conversation Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer View</TabsTrigger>
              <TabsTrigger value="agent">Agent View</TabsTrigger>
            </TabsList>
            <TabsContent value="customer" className="mt-4">
              <div className="h-[600px]">
                <ChatWindow />
              </div>
            </TabsContent>
            <TabsContent value="agent" className="mt-4">
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="h-[600px]">
                  <ChatWindow />
                </div>
                <Card className="h-[600px] overflow-hidden">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">Agent Assist Panel</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-full overflow-auto">
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-3 rounded-md border border-border">
                        <h3 className="text-sm font-medium mb-2">Suggested Responses</h3>
                        <div className="space-y-2">
                          <div className="bg-white p-2 rounded border border-border text-sm hover:bg-muted/20 cursor-pointer">
                            "I can track your shipment CWL-29384. It's currently in transit and on schedule."
                          </div>
                          <div className="bg-white p-2 rounded border border-border text-sm hover:bg-muted/20 cursor-pointer">
                            "Would you like to receive email notifications for status updates?"
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-md border border-border">
                        <h3 className="text-sm font-medium mb-2">Shipment Information</h3>
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-2 gap-1">
                            <span className="font-medium">ID:</span>
                            <span>CWL-29384</span>
                            <span className="font-medium">Status:</span>
                            <span>In Transit</span>
                            <span className="font-medium">Origin:</span>
                            <span>Shanghai, China</span>
                            <span className="font-medium">Destination:</span>
                            <span>Los Angeles, USA</span>
                            <span className="font-medium">ETD:</span>
                            <span>May 10, 2025</span>
                            <span className="font-medium">ETA:</span>
                            <span>May 21, 2025</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-md border border-border">
                        <h3 className="text-sm font-medium mb-2">Customer Information</h3>
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-2 gap-1">
                            <span className="font-medium">Name:</span>
                            <span>Global Trading Co.</span>
                            <span className="font-medium">Contact:</span>
                            <span>John Smith</span>
                            <span className="font-medium">Service Tier:</span>
                            <span>Premium</span>
                            <span className="font-medium">Account Manager:</span>
                            <span>Sarah Johnson</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-md border border-border">
                        <h3 className="text-sm font-medium mb-2">Related Documents</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center p-2 bg-white rounded border border-border hover:bg-muted/20 cursor-pointer">
                            <span className="flex-1">Commercial Invoice #INV-84993</span>
                          </div>
                          <div className="flex items-center p-2 bg-white rounded border border-border hover:bg-muted/20 cursor-pointer">
                            <span className="flex-1">Bill of Lading #BL-39485</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportHub;
