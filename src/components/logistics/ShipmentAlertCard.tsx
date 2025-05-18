
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  Clock, 
  FileWarning, 
  LucideIcon, 
  Ship, 
  Truck, 
  Plane,
  AlertTriangle,
  CloudLightning
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type AlertSeverity = 'high' | 'medium' | 'low';
export type TransportMode = 'ocean' | 'air' | 'road' | 'rail' | 'multimodal';
export type AlertType = 'delay' | 'weather' | 'customs' | 'documentation';

interface ShipmentAlertCardProps {
  shipmentId: string;
  severity: AlertSeverity;
  alertType: AlertType;
  title: string;
  description: string;
  origin: string;
  destination: string;
  transportMode: TransportMode;
  eta?: string;
  etaChange?: number;
  className?: string;
}

const ShipmentAlertCard: React.FC<ShipmentAlertCardProps> = ({
  shipmentId,
  severity,
  alertType,
  title,
  description,
  origin,
  destination,
  transportMode,
  eta,
  etaChange,
  className
}) => {
  
  const getSeverityColor = () => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getAlertIcon = (): LucideIcon => {
    switch (alertType) {
      case 'delay': return Clock;
      case 'weather': return CloudLightning;
      case 'customs': return AlertTriangle;
      case 'documentation': return FileWarning;
      default: return AlertCircle;
    }
  };
  
  const getTransportIcon = () => {
    switch (transportMode) {
      case 'ocean': return <Ship size={16} />;
      case 'air': return <Plane size={16} />;
      case 'road': return <Truck size={16} />;
      default: return <Truck size={16} />;
    }
  };
  
  const AlertIcon = getAlertIcon();

  return (
    <Card className={cn("overflow-hidden border hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={cn(
              "rounded-full p-2 mr-3", 
              severity === 'high' ? "bg-red-100 text-red-600" :
              severity === 'medium' ? "bg-yellow-100 text-yellow-600" :
              "bg-blue-100 text-blue-600"
            )}>
              <AlertIcon size={18} />
            </div>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </div>
          <Badge className={getSeverityColor()}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
          </Badge>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>Shipment ID: {shipmentId}</span>
          {eta && (
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>ETA: {eta}</span>
              {etaChange && etaChange > 0 && (
                <span className="text-red-600 ml-1">(+{etaChange}d)</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{description}</p>
        
        <div className="bg-muted/50 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center mb-2 sm:mb-0">
            <span className="text-xs font-medium mr-1">Route:</span>
            <span className="text-xs">{origin}</span>
            <span className="mx-2">→</span>
            <span className="text-xs">{destination}</span>
          </div>
          <Badge variant="outline" className="flex items-center w-fit">
            {getTransportIcon()}
            <span className="ml-1 capitalize">{transportMode}</span>
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="flex-1 bg-crane-blue hover:bg-opacity-90">View Details</Button>
          <Button variant="outline" className="flex-1">Take Action</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentAlertCard;
