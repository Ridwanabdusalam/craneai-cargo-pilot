
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Bot, Layers } from 'lucide-react';
import ChatWindow from '@/components/ai-support/ChatWindow';

const SupportHub = () => {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-crane-blue/10 to-crane-teal/10 p-6 rounded-xl">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-crane-blue to-crane-teal bg-clip-text text-transparent">AI Support Hub</h1>
        <p className="text-muted-foreground mt-2">Intelligent customer and agent support powered by AI</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100/80 p-4 mb-4 shadow-inner">
              <Bot size={28} className="text-crane-blue" />
            </div>
            <CardTitle className="text-lg mb-2 font-medium">AI Assistant</CardTitle>
            <p className="text-sm text-muted-foreground">Answers customer inquiries using contextual knowledge</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-green-100/80 p-4 mb-4 shadow-inner">
              <Users size={28} className="text-crane-teal" />
            </div>
            <CardTitle className="text-lg mb-2 font-medium">Agent Support</CardTitle>
            <p className="text-sm text-muted-foreground">Provides agents with real-time information and suggestions</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-purple-100/80 p-4 mb-4 shadow-inner">
              <Layers size={28} className="text-purple-600" />
            </div>
            <CardTitle className="text-lg mb-2 font-medium">Knowledge Base</CardTitle>
            <p className="text-sm text-muted-foreground">Access to internal documentation and shipping regulations</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-orange-100/80 p-4 mb-4 shadow-inner">
              <MessageSquare size={28} className="text-orange-600" />
            </div>
            <CardTitle className="text-lg mb-2 font-medium">Multi-Channel</CardTitle>
            <p className="text-sm text-muted-foreground">Support across web, mobile, and internal platforms</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-none shadow-lg overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2 border-b border-border/30">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare size={20} className="text-crane-teal mr-2" />
            Conversation Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
              <TabsTrigger value="customer" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Customer View</TabsTrigger>
              <TabsTrigger value="agent" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Agent View</TabsTrigger>
            </TabsList>
            <TabsContent value="customer" className="mt-0 animate-fade-in">
              <div className="h-[600px] rounded-md overflow-hidden border border-border/30">
                <ChatWindow />
              </div>
            </TabsContent>
            <TabsContent value="agent" className="mt-0 animate-fade-in">
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="h-[600px] rounded-md overflow-hidden border border-border/30">
                  <ChatWindow />
                </div>
                <Card className="h-[600px] overflow-hidden border border-border/30 shadow-sm bg-white/80">
                  <CardHeader className="py-3 border-b border-border/30">
                    <CardTitle className="text-base font-medium">Agent Assist Panel</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 h-full overflow-auto">
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                        <h3 className="text-sm font-medium mb-3 text-crane-blue">Suggested Responses</h3>
                        <div className="space-y-2.5">
                          <div className="bg-white p-3 rounded-md border border-border/30 text-sm hover:bg-muted/20 cursor-pointer hover:shadow-sm transition-all">
                            "I can track your shipment CWL-29384. It's currently in transit and on schedule."
                          </div>
                          <div className="bg-white p-3 rounded-md border border-border/30 text-sm hover:bg-muted/20 cursor-pointer hover:shadow-sm transition-all">
                            "Would you like to receive email notifications for status updates?"
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                        <h3 className="text-sm font-medium mb-3 text-crane-blue">Shipment Information</h3>
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <span className="font-medium text-muted-foreground">ID:</span>
                            <span>CWL-29384</span>
                            <span className="font-medium text-muted-foreground">Status:</span>
                            <span className="text-crane-teal font-medium">In Transit</span>
                            <span className="font-medium text-muted-foreground">Origin:</span>
                            <span>Shanghai, China</span>
                            <span className="font-medium text-muted-foreground">Destination:</span>
                            <span>Los Angeles, USA</span>
                            <span className="font-medium text-muted-foreground">ETD:</span>
                            <span>May 10, 2025</span>
                            <span className="font-medium text-muted-foreground">ETA:</span>
                            <span>May 21, 2025</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                        <h3 className="text-sm font-medium mb-3 text-crane-blue">Customer Information</h3>
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <span className="font-medium text-muted-foreground">Name:</span>
                            <span>Global Trading Co.</span>
                            <span className="font-medium text-muted-foreground">Contact:</span>
                            <span>John Smith</span>
                            <span className="font-medium text-muted-foreground">Service Tier:</span>
                            <span className="text-amber-600 font-medium">Premium</span>
                            <span className="font-medium text-muted-foreground">Account Manager:</span>
                            <span>Sarah Johnson</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                        <h3 className="text-sm font-medium mb-3 text-crane-blue">Related Documents</h3>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center p-3 bg-white rounded-md border border-border/30 hover:bg-muted/20 cursor-pointer hover:shadow-sm transition-all">
                            <span className="flex-1">Commercial Invoice #INV-84993</span>
                          </div>
                          <div className="flex items-center p-3 bg-white rounded-md border border-border/30 hover:bg-muted/20 cursor-pointer hover:shadow-sm transition-all">
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
