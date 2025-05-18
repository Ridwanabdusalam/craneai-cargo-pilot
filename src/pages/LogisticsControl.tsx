
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertTriangle, Truck, Ship, Plane, Map, Filter, SortAsc, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShipmentAlertCard, { AlertSeverity, AlertType, TransportMode } from '@/components/logistics/ShipmentAlertCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

// Sample data for the chart
const shipmentData = [
  { name: '05/12', ontime: 85, delayed: 12, atrisk: 3 },
  { name: '05/13', ontime: 82, delayed: 15, atrisk: 3 },
  { name: '05/14', ontime: 80, delayed: 13, atrisk: 7 },
  { name: '05/15', ontime: 74, delayed: 18, atrisk: 8 },
  { name: '05/16', ontime: 78, delayed: 17, atrisk: 5 },
  { name: '05/17', ontime: 83, delayed: 14, atrisk: 3 },
  { name: '05/18', ontime: 85, delayed: 10, atrisk: 5 },
];

// Sample shipment alerts
const shipmentAlerts = [
  {
    id: "CWL-29553",
    severity: "high" as AlertSeverity,
    type: "weather" as AlertType,
    title: "Storm Alert - Shipment Delay",
    description: "Tropical storm approaching Port of Singapore may cause delay of 2-3 days. Alternative routing options are being evaluated.",
    origin: "Shanghai, CN",
    destination: "Los Angeles, US",
    mode: "ocean" as TransportMode,
    eta: "May 24, 2025",
    etaChange: 3
  },
  {
    id: "CWL-29481",
    severity: "medium" as AlertSeverity,
    type: "customs" as AlertType,
    title: "Customs Documentation Issue",
    description: "Missing Certificate of Origin may delay clearance. AI has generated draft document for your approval.",
    origin: "Hamburg, DE",
    destination: "New York, US",
    mode: "ocean" as TransportMode,
    eta: "May 21, 2025",
    etaChange: 1
  },
  {
    id: "CWL-29610",
    severity: "low" as AlertSeverity,
    type: "delay" as AlertType,
    title: "Port Congestion Alert",
    description: "Moderate congestion detected at Port of Rotterdam. Current wait time is 24 hours, which is within buffer period.",
    origin: "Rotterdam, NL",
    destination: "Dubai, UAE",
    mode: "ocean" as TransportMode,
    eta: "May 28, 2025",
    etaChange: 0
  },
  {
    id: "CWL-29422",
    severity: "high" as AlertSeverity,
    type: "documentation" as AlertType,
    title: "Hazardous Material Documentation",
    description: "Hazardous material declaration incomplete. Shipment will be held at customs until documentation is completed.",
    origin: "Frankfurt, DE",
    destination: "Chicago, US",
    mode: "air" as TransportMode,
    eta: "May 19, 2025",
    etaChange: 2
  }
];

const LogisticsControl = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-crane-blue">Logistics Control Tower</h1>
        <p className="text-muted-foreground">Proactive shipment monitoring and risk prediction</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <Truck size={18} className="text-crane-teal mr-2" />
                Shipment Status Overview
              </CardTitle>
              <Badge variant="outline">Last updated: Just now</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shipmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="ontime" stackId="1" stroke="#2E8B57" fill="#2E8B57" name="On Time" />
                <Area type="monotone" dataKey="delayed" stackId="1" stroke="#FFA500" fill="#FFA500" name="Delayed" />
                <Area type="monotone" dataKey="atrisk" stackId="1" stroke="#FF6B6B" fill="#FF6B6B" name="At Risk" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle size={18} className="text-crane-coral mr-2" />
              Risk Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-md">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm font-medium">High Risk</span>
              </div>
              <span className="text-lg font-bold">2</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-100 rounded-md">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm font-medium">Medium Risk</span>
              </div>
              <span className="text-lg font-bold">5</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-md">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm font-medium">Low Risk</span>
              </div>
              <span className="text-lg font-bold">8</span>
            </div>
            
            <Button className="w-full bg-crane-blue hover:bg-opacity-90 mt-2">
              <Map size={16} className="mr-2" />
              View Risk Map
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle size={18} className="text-crane-coral mr-2" />
              Shipment Alerts
            </CardTitle>
            <Button className="bg-crane-blue hover:bg-opacity-90">
              View All Shipments
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search alerts..." className="pl-10" />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All Alerts</DropdownMenuItem>
                  <DropdownMenuItem>Weather Related</DropdownMenuItem>
                  <DropdownMenuItem>Customs Issues</DropdownMenuItem>
                  <DropdownMenuItem>Documentation</DropdownMenuItem>
                  <DropdownMenuItem>Delays</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SortAsc size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Severity (High to Low)</DropdownMenuItem>
                  <DropdownMenuItem>Severity (Low to High)</DropdownMenuItem>
                  <DropdownMenuItem>ETA (Soonest First)</DropdownMenuItem>
                  <DropdownMenuItem>Recently Updated</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="ocean" className="flex items-center">
                <Ship size={16} className="mr-2" />
                Ocean
              </TabsTrigger>
              <TabsTrigger value="air" className="flex items-center">
                <Plane size={16} className="mr-2" />
                Air
              </TabsTrigger>
              <TabsTrigger value="road" className="flex items-center">
                <Truck size={16} className="mr-2" />
                Road
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {shipmentAlerts.map(alert => (
                  <ShipmentAlertCard
                    key={alert.id}
                    shipmentId={alert.id}
                    severity={alert.severity}
                    alertType={alert.type}
                    title={alert.title}
                    description={alert.description}
                    origin={alert.origin}
                    destination={alert.destination}
                    transportMode={alert.mode}
                    eta={alert.eta}
                    etaChange={alert.etaChange}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="ocean">
              <div className="flex items-center justify-center h-52">
                <p className="text-muted-foreground">Ocean shipment alerts will appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="air">
              <div className="flex items-center justify-center h-52">
                <p className="text-muted-foreground">Air shipment alerts will appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="road">
              <div className="flex items-center justify-center h-52">
                <p className="text-muted-foreground">Road shipment alerts will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing 4 of 15 alerts
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LogisticsControl;
