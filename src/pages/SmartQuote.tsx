
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, BarChart3, Ship, Plane, Truck, Search, CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PriceCard from '@/components/quoting/PriceCard';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

// Sample data for the charts
const laneData = [
  { name: 'Shanghai-LA', volume: 120, profit: 85, fill: '#0A2647' },
  { name: 'Rotterdam-NY', volume: 98, profit: 78, fill: '#2E8B57' },
  { name: 'Hamburg-Dubai', volume: 86, profit: 90, fill: '#FF6B6B' },
  { name: 'Singapore-SYD', volume: 99, profit: 65, fill: '#7AB8F5' },
  { name: 'LA-Tokyo', volume: 85, profit: 55, fill: '#9370DB' }
];

const SmartQuote = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const handleGenerateQuote = () => {
    toast.success("Quote request submitted for processing!");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-crane-blue">SmartQuote Optimizer</h1>
        <p className="text-muted-foreground">Intelligent freight quoting and lane optimization</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <DollarSign size={24} className="text-crane-teal" />
            </div>
            <CardTitle className="text-lg mb-1">Dynamic Pricing</CardTitle>
            <p className="text-sm text-muted-foreground">AI-optimized rates based on market conditions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100 p-3 mb-3">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <CardTitle className="text-lg mb-1">Lane Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">Profitability and optimization insights</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-purple-100 p-3 mb-3">
              <BarChart3 size={24} className="text-purple-600" />
            </div>
            <CardTitle className="text-lg mb-1">Market Intelligence</CardTitle>
            <p className="text-sm text-muted-foreground">Real-time data on rates and capacity</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lane Profitability Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={laneData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="volume" name="Volume" fill="#7AB8F5" />
                <Bar dataKey="profit" name="Profit Margin %" fill="#2E8B57" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Natural Language Quote Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea 
                placeholder="Describe your shipment needs in natural language. For example: 'I need to ship 2 containers of electronics from Shanghai to Los Angeles in the first week of June.'"
                className="h-[120px]"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Ship Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transport Mode</label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Ship size={16} className="mr-2" />
                      Ocean
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Plane size={16} className="mr-2" />
                      Air
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Truck size={16} className="mr-2" />
                      Road
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerateQuote}
                className="w-full bg-crane-blue hover:bg-opacity-90"
              >
                <Search size={16} className="mr-2" />
                Generate Quote Options
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <DollarSign size={18} className="text-crane-teal mr-2" />
              Smart Quote Results
            </CardTitle>
            <Badge variant="outline">Shanghai to Los Angeles • 2 Containers</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ocean" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ocean" className="flex items-center">
                <Ship size={16} className="mr-2" />
                Ocean
              </TabsTrigger>
              <TabsTrigger value="air" className="flex items-center">
                <Plane size={16} className="mr-2" />
                Air
              </TabsTrigger>
              <TabsTrigger value="multi" className="flex items-center">
                <Truck size={16} className="mr-2" />
                Multi-modal
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ocean" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PriceCard
                  title="Standard Service"
                  price={3250}
                  priceTrend="up"
                  trendPercentage={5}
                  validUntil="May 30, 2025"
                />
                <PriceCard
                  title="Express Service"
                  price={4500}
                  priceTrend="down"
                  trendPercentage={3}
                  validUntil="May 25, 2025"
                  recommended={true}
                />
                <PriceCard
                  title="Economy Service"
                  price={2950}
                  priceTrend="stable"
                  validUntil="June 5, 2025"
                />
              </div>
              
              <div className="mt-6 bg-muted/50 rounded-lg p-4 border border-border">
                <h3 className="text-sm font-medium mb-2">Market Intelligence:</h3>
                <p className="text-sm text-muted-foreground">
                  Rates on the Shanghai to Los Angeles route are expected to increase by 5-7% next month due to peak season demand. 
                  Booking within the next 7 days is recommended to secure current pricing. 
                  Current capacity utilization on this lane is at 82%.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="air">
              <div className="flex items-center justify-center h-52">
                <p className="text-muted-foreground">Air freight quote options will appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="multi">
              <div className="flex items-center justify-center h-52">
                <p className="text-muted-foreground">Multi-modal quote options will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartQuote;
