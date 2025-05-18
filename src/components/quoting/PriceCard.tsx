
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PriceCardProps {
  title: string;
  price: number;
  currency?: string;
  priceTrend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  unit?: string;
  validUntil?: string;
  className?: string;
  recommended?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({
  title,
  price,
  currency = 'USD',
  priceTrend,
  trendPercentage,
  unit = 'container',
  validUntil,
  className,
  recommended = false,
}) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <Card className={cn(
      "overflow-hidden border hover:shadow-md transition-shadow", 
      recommended && "border-crane-teal ring-1 ring-crane-teal",
      className
    )}>
      {recommended && (
        <div className="bg-crane-teal text-white text-center py-1 text-xs font-medium">
          RECOMMENDED
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {priceTrend && trendPercentage && (
            <div className={cn(
              "flex items-center text-xs font-medium rounded-full px-2 py-1",
              priceTrend === 'up' 
                ? "bg-red-100 text-red-700" 
                : priceTrend === 'down'
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
            )}>
              {priceTrend === 'up' ? (
                <ArrowUp size={14} className="mr-1" />
              ) : (
                <ArrowDown size={14} className="mr-1" />
              )}
              {trendPercentage}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">{formattedPrice}</span>
          <span className="text-sm text-muted-foreground ml-1">/ {unit}</span>
        </div>
        
        <div className="space-y-2 text-sm">
          {validUntil && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid until:</span>
              <span>{validUntil}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Market price:</span>
            <div className="flex items-center">
              <span>Dynamic</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                      <Info size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      This price is dynamically calculated based on current market conditions, historical data, and available capacity.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <Button className="w-full mt-4 bg-crane-blue hover:bg-opacity-90">
          Generate Quote
        </Button>
      </CardContent>
    </Card>
  );
};

export default PriceCard;
