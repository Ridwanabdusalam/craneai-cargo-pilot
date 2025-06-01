import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  Truck, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Check, 
  Ship,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from '@/components/dashboard/StatCard';
import ChatWindow from '@/components/ai-support/ChatWindow';
import DocumentCard from '@/components/customs/DocumentCard';
import ShipmentAlertCard from '@/components/logistics/ShipmentAlertCard';
import PriceCard from '@/components/quoting/PriceCard';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <div className="sticky-page-header">
        <h1 className="text-2xl font-bold text-crane-blue">CraneAI Logistics Suite</h1>
        <p className="text-muted-foreground">Welcome to your intelligent logistics command center</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Shipments" 
          value={128} 
          change="+12% from last month" 
          icon={<Truck size={20} />} 
          trend="up" 
        />
        <StatCard 
          title="Support Tickets" 
          value={24} 
          change="-8% from last month" 
          icon={<MessageSquare size={20} />} 
          trend="down" 
        />
        <StatCard 
          title="Pending Documents" 
          value={37} 
          change="+5 since yesterday" 
          icon={<FileText size={20} />} 
          trend="up" 
        />
        <StatCard 
          title="Revenue (MTD)" 
          value="$1.8M" 
          change="+15% from last month" 
          icon={<BarChart3 size={20} />} 
          trend="up" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare size={18} className="text-crane-teal mr-2" />
                AI Support Hub
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateTo('/support')}
              >
                View All
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChatWindow />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle size={18} className="text-crane-coral mr-2" />
                Shipment Alerts
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateTo('/logistics')}
              >
                View All
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] space-y-4 overflow-y-auto pr-2">
            <ShipmentAlertCard
              shipmentId="CWL-29553"
              severity="high"
              alertType="weather"
              title="Storm Alert - Shipment Delay"
              description="Tropical storm approaching Port of Singapore may cause delay of 2-3 days. Alternative routing options are being evaluated."
              origin="Shanghai, CN"
              destination="Los Angeles, US"
              transportMode="ocean"
              eta="May 24, 2025"
              etaChange={3}
            />
            
            <ShipmentAlertCard
              shipmentId="CWL-29481"
              severity="medium"
              alertType="customs"
              title="Customs Documentation Issue"
              description="Missing Certificate of Origin may delay clearance. AI has generated draft document for your approval."
              origin="Hamburg, DE"
              destination="New York, US"
              transportMode="ocean"
              eta="May 21, 2025"
              etaChange={1}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <FileText size={18} className="text-crane-blue mr-2" />
                Document Processing
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateTo('/clearance')}
              >
                View All
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentCard
                title="Commercial Invoice #INV-89302"
                type="PDF Document"
                lastUpdated="10 mins ago"
                status="processing"
                progress={65}
              />
              <DocumentCard
                title="Packing List #PL-67122"
                type="PDF Document"
                lastUpdated="2 hours ago"
                status="verified"
              />
              <DocumentCard
                title="Bill of Lading #BL-44985"
                type="PDF Document"
                lastUpdated="1 day ago"
                status="rejected"
                flagged={true}
                progress={100}
              />
              <DocumentCard
                title="Certificate of Origin #CO-11234"
                type="PDF Document"
                lastUpdated="Just now"
                status="pending"
                progress={10}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 size={18} className="text-crane-teal mr-2" />
                SmartQuote Optimizer
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateTo('/quotes')}
              >
                View All
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ocean" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ocean" className="flex items-center">
                  <Ship size={16} className="mr-2" />
                  Ocean
                </TabsTrigger>
                <TabsTrigger value="air">Air</TabsTrigger>
                <TabsTrigger value="road">Road</TabsTrigger>
              </TabsList>
              <TabsContent value="ocean" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PriceCard
                    title="Standard Route"
                    price={3250}
                    priceTrend="up"
                    trendPercentage={5}
                    validUntil="May 30, 2025"
                  />
                  <PriceCard
                    title="Express Route"
                    price={4500}
                    priceTrend="down"
                    trendPercentage={3}
                    validUntil="May 25, 2025"
                    recommended={true}
                  />
                </div>
              </TabsContent>
              <TabsContent value="air" className="mt-4">
                <div className="flex items-center justify-center h-52 bg-muted/30 rounded-md">
                  <p className="text-muted-foreground">Select a quote to view air freight options</p>
                </div>
              </TabsContent>
              <TabsContent value="road" className="mt-4">
                <div className="flex items-center justify-center h-52 bg-muted/30 rounded-md">
                  <p className="text-muted-foreground">Select a quote to view road freight options</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
