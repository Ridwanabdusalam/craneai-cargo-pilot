
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';

export type MessageType = 'user' | 'ai' | 'system';

interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, type, timestamp }) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={cn(
        "flex gap-3 mb-4 animate-slide-from-right",
        type === 'user' ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn("h-8 w-8", type === 'system' && "opacity-70")}>
        {type === 'user' ? (
          <>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-crane-blue text-white">U</AvatarFallback>
          </>
        ) : type === 'ai' ? (
          <>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-crane-teal text-white">AI</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-gray-400 text-white">SYS</AvatarFallback>
          </>
        )}
      </Avatar>

      <div 
        className={cn(
          "max-w-[80%] rounded-lg p-3",
          type === 'user' 
            ? "bg-crane-blue text-white" 
            : type === 'ai'
              ? "bg-white border border-border shadow-sm" 
              : "bg-muted text-muted-foreground text-sm italic"
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
        <div 
          className={cn(
            "text-xs mt-1 text-right",
            type === 'user' ? "text-blue-100" : "text-gray-500"
          )}
        >
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
