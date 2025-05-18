
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatCard = ({ title, value, change, icon, trend = 'neutral', className }: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            
            {change && (
              <div className="flex items-center mt-1">
                <span 
                  className={cn("text-xs font-medium", {
                    "text-green-600": trend === 'up',
                    "text-red-600": trend === 'down',
                    "text-gray-500": trend === 'neutral'
                  })}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          
          <div className={cn(
            "rounded-full p-3", 
            {
              "bg-green-100 text-green-600": trend === 'up',
              "bg-red-100 text-red-600": trend === 'down',
              "bg-blue-100 text-blue-600": trend === 'neutral'
            }
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
