
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
import { supabase } from '@/integrations/supabase/client';
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
  const [quotePrompt, setQuotePrompt] = React.useState('');
  const [selectedModes, setSelectedModes] = React.useState<string[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [quoteResults, setQuoteResults] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState('ocean');
  
  const handleModeToggle = (mode: string) => {
    setSelectedModes(prev => 
      prev.includes(mode) 
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const handleGenerateQuote = async () => {
    if (!quotePrompt.trim()) {
      toast.error("Please describe your shipment needs");
      return;
    }

    setIsGenerating(true);
    toast.loading("Generating AI-powered quotes...", { id: 'quote-generation' });

    try {
      const { data, error } = await supabase.functions.invoke('generate-smart-quote', {
        body: {
          prompt: quotePrompt,
          shipDate: date ? format(date, "PPP") : undefined,
          selectedModes: selectedModes.length > 0 ? selectedModes : ['ocean', 'air', 'multimodal']
        }
      });

      if (error) {
        throw error;
      }

      console.log('Quote results received:', data);
      setQuoteResults(data);
      
      // Set active tab to the first available mode
      const availableModes = Object.keys(data.modes || {});
      if (availableModes.length > 0) {
        setActiveTab(availableModes[0]);
      }

      toast.success("Quote options generated successfully!", { id: 'quote-generation' });
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error("Failed to generate quotes. Please try again.", { id: 'quote-generation' });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuoteOptions = (options: any[]) => {
    if (!options || options.length === 0) {
      return (
        <div className="flex items-center justify-center h-52">
          <p className="text-muted-foreground">No quotes available for this transport mode</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option, index) => (
          <PriceCard
            key={index}
            title={option.title}
            price={option.price}
            priceTrend={option.priceTrend}
            trendPercentage={option.trendPercentage}
            validUntil={option.validUntil}
            recommended={option.recommended}
          />
        ))}
      </div>
    );
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
                value={quotePrompt}
                onChange={(e) => setQuotePrompt(e.target.value)}
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
                  <label className="text-sm font-medium">Transport Mode (Optional)</label>
                  <div className="flex gap-2">
                    <Button 
                      variant={selectedModes.includes('ocean') ? "default" : "outline"} 
                      className="flex-1"
                      onClick={() => handleModeToggle('ocean')}
                    >
                      <Ship size={16} className="mr-2" />
                      Ocean
                    </Button>
                    <Button 
                      variant={selectedModes.includes('air') ? "default" : "outline"} 
                      className="flex-1"
                      onClick={() => handleModeToggle('air')}
                    >
                      <Plane size={16} className="mr-2" />
                      Air
                    </Button>
                    <Button 
                      variant={selectedModes.includes('multimodal') ? "default" : "outline"} 
                      className="flex-1"
                      onClick={() => handleModeToggle('multimodal')}
                    >
                      <Truck size={16} className="mr-2" />
                      Multi
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerateQuote}
                className="w-full bg-crane-blue hover:bg-opacity-90"
                disabled={isGenerating}
              >
                <Search size={16} className="mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Quote Options'}
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
            {quoteResults && (
              <Badge variant="outline">
                {quoteResults.origin} to {quoteResults.destination} • {quoteResults.quantity}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!quoteResults ? (
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <Search size={48} className="text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground">Generate a quote to see results here</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {quoteResults.modes.ocean && (
                  <TabsTrigger value="ocean" className="flex items-center">
                    <Ship size={16} className="mr-2" />
                    Ocean
                  </TabsTrigger>
                )}
                {quoteResults.modes.air && (
                  <TabsTrigger value="air" className="flex items-center">
                    <Plane size={16} className="mr-2" />
                    Air
                  </TabsTrigger>
                )}
                {quoteResults.modes.multimodal && (
                  <TabsTrigger value="multimodal" className="flex items-center">
                    <Truck size={16} className="mr-2" />
                    Multi-modal
                  </TabsTrigger>
                )}
              </TabsList>
              
              {quoteResults.modes.ocean && (
                <TabsContent value="ocean" className="mt-4">
                  {renderQuoteOptions(quoteResults.modes.ocean)}
                  
                  <div className="mt-6 bg-muted/50 rounded-lg p-4 border border-border">
                    <h3 className="text-sm font-medium mb-2">Market Intelligence:</h3>
                    <p className="text-sm text-muted-foreground">
                      {quoteResults.marketIntelligence}
                    </p>
                  </div>
                </TabsContent>
              )}
              
              {quoteResults.modes.air && (
                <TabsContent value="air" className="mt-4">
                  {renderQuoteOptions(quoteResults.modes.air)}
                </TabsContent>
              )}
              
              {quoteResults.modes.multimodal && (
                <TabsContent value="multimodal" className="mt-4">
                  {renderQuoteOptions(quoteResults.modes.multimodal)}
                </TabsContent>
              )}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartQuote;
