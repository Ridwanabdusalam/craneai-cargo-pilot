
import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, PaperclipIcon, Info, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Added import for Avatar components
import ChatMessage, { MessageType } from './ChatMessage';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

// Sample messages for demo
const initialMessages: Message[] = [
  {
    id: generateId(),
    content: "Welcome to CraneAI Support. How can I assist you today with your logistics needs?",
    type: 'ai',
    timestamp: new Date()
  },
  {
    id: generateId(),
    content: "System connected to shipment tracking and quoting engines.",
    type: 'system',
    timestamp: new Date()
  }
];

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      // This would typically be an API call to an LLM
      let aiResponse: string;
      
      if (inputValue.toLowerCase().includes('track') || inputValue.toLowerCase().includes('shipment')) {
        aiResponse = "I found your shipment #CWL-29384. It's currently in transit from Shanghai to Los Angeles. Estimated arrival: May 21, 2025. The shipment is on schedule with no delays reported. Would you like to receive status updates via email?";
      } else if (inputValue.toLowerCase().includes('quote') || inputValue.toLowerCase().includes('price')) {
        aiResponse = "Based on current rates, a standard container from Rotterdam to New York would cost approximately $3,200-3,500 USD. I can prepare a detailed quote if you provide specific cargo details, dimensions, and desired shipping dates.";
      } else if (inputValue.toLowerCase().includes('document') || inputValue.toLowerCase().includes('customs')) {
        aiResponse = "For customs clearance in the EU, you'll need: Commercial Invoice, Bill of Lading, Packing List, and Certificate of Origin. Would you like me to send you templates for these documents or connect you with our customs broker team?";
      } else {
        aiResponse = "Thank you for your message. I'm analyzing your request and will respond shortly. For immediate assistance with complex inquiries, I can connect you with a customer support agent.";
      }
      
      const aiMessage: Message = {
        id: generateId(),
        content: aiResponse,
        type: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleFileUpload = () => {
    toast.info("File upload functionality will be available in the next release.");
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-crane-gray">
      <div className="p-4 bg-white border-b border-border flex justify-between items-center">
        <div className="flex items-center">
          <Bot size={20} className="text-crane-teal mr-2" />
          <h2 className="font-semibold">CraneAI Support</h2>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              This AI assistant can help with tracking shipments, generating quotes, providing documentation guidance, and answering logistics questions.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            type={message.type}
            timestamp={message.timestamp}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-crane-teal text-white">AI</AvatarFallback>
            </Avatar>
            <div className="bg-white border border-border rounded-lg p-4 w-fit">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-crane-teal rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-2 h-2 bg-crane-teal rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-2 h-2 bg-crane-teal rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-white border-t border-border">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleFileUpload}
          >
            <PaperclipIcon size={18} />
          </Button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="w-full px-4 py-2 rounded-full border border-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-crane-blue hover:bg-opacity-90"
          >
            <SendHorizontal size={18} className="mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
