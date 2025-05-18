
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIChat from '@/components/ai-support/AIChat';
import ChatWindow from '@/components/ai-support/ChatWindow';

const SupportHub = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Hub</h1>
        <p className="text-muted-foreground">
          Get assistance with your logistics needs and documentation
        </p>
      </div>
      
      <Tabs defaultValue="ai-assistant" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="support-agent">Support Agent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-assistant" className="space-y-4">
          <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Logistics AI Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ask any questions about shipping, customs clearance, documentation, and more.
                Our AI is trained on Crane Worldwide Logistics' expertise and procedures.
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <AIChat />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="support-agent" className="space-y-4">
          <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Live Support Agent</CardTitle>
              <p className="text-sm text-muted-foreground">
                Need to speak with a human agent? Our support team is here to help.
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <ChatWindow />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportHub;
