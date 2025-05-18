
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Bot, RefreshCw } from 'lucide-react';
import { queryWithContext, seedKnowledgeBase } from '@/services/mcpService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Seed the knowledge base on component mount
  useEffect(() => {
    const initKnowledgeBase = async () => {
      setIsSeeding(true);
      await seedKnowledgeBase();
      setIsSeeding(false);
      
      // Add welcome message
      setMessages([{
        id: 'welcome',
        content: "Hello! I'm your Crane Worldwide Logistics assistant. How can I help you with your shipping, customs, or supply chain needs?",
        sender: 'ai',
        timestamp: new Date()
      }]);
    };
    
    initKnowledgeBase();
  }, []);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get AI response using Model Context Protocol
      const aiResponse = await queryWithContext(input);
      
      // Add AI message
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            <Bot className="h-5 w-5 text-crane-blue mr-2" />
            Crane Logistics Assistant
          </CardTitle>
          {isSeeding && (
            <div className="flex items-center text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              Initializing knowledge...
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto px-4 pt-2 pb-0">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className={`h-8 w-8 ${message.sender === 'user' ? 'ml-2' : 'mr-2'}`}>
                  <div className={`h-full w-full flex items-center justify-center ${message.sender === 'user' ? 'bg-crane-blue text-white' : 'bg-muted'}`}>
                    {message.sender === 'user' ? 'U' : <Bot className="h-4 w-4" />}
                  </div>
                </Avatar>
                
                <div 
                  className={`py-2 px-3 rounded-xl ${
                    message.sender === 'user' 
                      ? 'bg-crane-blue text-white' 
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-[10px] mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <Avatar className="h-8 w-8 mr-2">
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <Bot className="h-4 w-4" />
                  </div>
                </Avatar>
                
                <div className="py-3 px-4 rounded-xl bg-muted">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground animate-bounce rounded-full" />
                    <div className="w-2 h-2 bg-muted-foreground animate-bounce rounded-full [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-muted-foreground animate-bounce rounded-full [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex w-full space-x-2"
        >
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isSeeding}
            className="flex-1"
            autoFocus
          />
          <Button 
            type="submit"
            disabled={isLoading || isSeeding || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
