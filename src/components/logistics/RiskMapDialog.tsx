
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Map, 
  AlertTriangle, 
  CloudLightning, 
  Anchor,
  Plane,
  Navigation
} from 'lucide-react';

interface RiskMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RiskMapDialog: React.FC<RiskMapDialogProps> = ({ isOpen, onClose }) => {
  const riskRegions = [
    {
      region: 'Southeast Asia',
      riskLevel: 'high',
      type: 'Weather',
      description: 'Tropical storm activity affecting shipping lanes',
      affectedRoutes: 3,
      icon: <CloudLightning size={16} />
    },
    {
      region: 'Mediterranean',
      riskLevel: 'medium',
      type: 'Port Congestion',
      description: 'High volume causing delays at major ports',
      affectedRoutes: 2,
      icon: <Anchor size={16} />
    },
    {
      region: 'North Atlantic',
      riskLevel: 'low',
      type: 'Air Traffic',
      description: 'Minor delays due to increased air traffic',
      affectedRoutes: 1,
      icon: <Plane size={16} />
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Map className="mr-2 text-crane-teal" size={20} />
            Global Risk Map
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Map Placeholder */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-8 border-2 border-dashed border-blue-200">
            <div className="text-center space-y-4">
              <div className="mx-auto w-24 h-24 bg-crane-teal rounded-full flex items-center justify-center">
                <Map size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-crane-blue">Interactive Risk Map</h3>
                <p className="text-muted-foreground">
                  Real-time visualization of global shipping risks and disruptions
                </p>
              </div>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>High Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Medium Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Low Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Regions List */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center">
              <AlertTriangle size={18} className="mr-2 text-crane-coral" />
              Current Risk Regions
            </h4>
            <div className="space-y-3">
              {riskRegions.map((region, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 bg-muted rounded-md">
                        {region.icon}
                      </div>
                      <div>
                        <h5 className="font-medium">{region.region}</h5>
                        <p className="text-sm text-muted-foreground">{region.type}</p>
                      </div>
                    </div>
                    <Badge className={getRiskColor(region.riskLevel)}>
                      {region.riskLevel.charAt(0).toUpperCase() + region.riskLevel.slice(1)} Risk
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{region.description}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Affected Routes: {region.affectedRoutes}</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Navigation size={12} className="mr-1" />
                      View Routes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Controls */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Last updated: 2 minutes ago
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Navigation size={16} className="mr-2" />
                Show All Routes
              </Button>
              <Button size="sm" className="bg-crane-blue hover:bg-opacity-90">
                <AlertTriangle size={16} className="mr-2" />
                Risk Alerts
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskMapDialog;
