
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Package,
  Ship,
  Plane,
  Truck,
  Calendar,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { AlertSeverity, TransportMode, AlertType } from './ShipmentAlertCard';

interface ShipmentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: {
    id: string;
    severity: AlertSeverity;
    alertType: AlertType;
    title: string;
    description: string;
    origin: string;
    destination: string;
    transportMode: TransportMode;
    eta?: string;
    etaChange?: number;
  } | null;
}

const ShipmentDetails: React.FC<ShipmentDetailsProps> = ({ isOpen, onClose, shipment }) => {
  if (!shipment) return null;

  const getTransportIcon = () => {
    switch (shipment.transportMode) {
      case 'ocean': return <Ship size={20} />;
      case 'air': return <Plane size={20} />;
      case 'road': return <Truck size={20} />;
      default: return <Truck size={20} />;
    }
  };

  const getSeverityColor = () => {
    switch (shipment.severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 text-crane-coral" size={20} />
            Shipment Details: {shipment.id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Alert Info */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{shipment.title}</h3>
              <Badge className={getSeverityColor()}>
                {shipment.severity.charAt(0).toUpperCase() + shipment.severity.slice(1)} Priority
              </Badge>
            </div>
            <p className="text-muted-foreground">{shipment.description}</p>
          </div>

          {/* Route Information */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <MapPin size={18} className="mr-2" />
              Route Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium text-sm">Origin:</span>
                  <span className="ml-2">{shipment.origin}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-sm">Destination:</span>
                  <span className="ml-2">{shipment.destination}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium text-sm">Transport Mode:</span>
                  <div className="ml-2 flex items-center">
                    {getTransportIcon()}
                    <span className="ml-1 capitalize">{shipment.transportMode}</span>
                  </div>
                </div>
                {shipment.eta && (
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span className="font-medium text-sm">ETA:</span>
                    <span className="ml-2">{shipment.eta}</span>
                    {shipment.etaChange && shipment.etaChange > 0 && (
                      <span className="text-red-600 ml-1">(+{shipment.etaChange}d delay)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipment Details */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <Package size={18} className="mr-2" />
              Shipment Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Container:</span>
                <span className="ml-2">MSKU7439056</span>
              </div>
              <div>
                <span className="font-medium">Weight:</span>
                <span className="ml-2">24.5 tons</span>
              </div>
              <div>
                <span className="font-medium">Cargo Type:</span>
                <span className="ml-2">Electronics</span>
              </div>
              <div>
                <span className="font-medium">Value:</span>
                <span className="ml-2">$450,000</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <User size={18} className="mr-2" />
              Contact Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <User size={14} className="mr-2" />
                <span className="font-medium">Customer:</span>
                <span className="ml-2">TechGlobal Corp</span>
              </div>
              <div className="flex items-center">
                <Mail size={14} className="mr-2" />
                <span className="font-medium">Email:</span>
                <span className="ml-2">logistics@techglobal.com</span>
              </div>
              <div className="flex items-center">
                <Phone size={14} className="mr-2" />
                <span className="font-medium">Phone:</span>
                <span className="ml-2">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-crane-blue hover:bg-opacity-90">
              Update Customer
            </Button>
            <Button variant="outline" className="flex-1">
              Generate Report
            </Button>
            <Button variant="outline" className="flex-1">
              Track Shipment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDetails;
