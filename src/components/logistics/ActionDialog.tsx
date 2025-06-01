
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Send,
  Phone,
  Mail,
  Clock,
  RefreshCw
} from 'lucide-react';
import { AlertSeverity } from './ShipmentAlertCard';

interface ActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: {
    id: string;
    severity: AlertSeverity;
    title: string;
    description: string;
  } | null;
}

const ActionDialog: React.FC<ActionDialogProps> = ({ isOpen, onClose, shipment }) => {
  const [selectedAction, setSelectedAction] = useState('notify');
  const [message, setMessage] = useState('');

  if (!shipment) return null;

  const handleSubmitAction = () => {
    console.log('Action submitted:', { 
      shipmentId: shipment.id, 
      action: selectedAction, 
      message 
    });
    
    // Reset form
    setSelectedAction('notify');
    setMessage('');
    onClose();
  };

  const getSeverityColor = () => {
    switch (shipment.severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const actionOptions = [
    {
      id: 'notify',
      label: 'Notify Customer',
      description: 'Send notification to customer about the alert',
      icon: <Send size={16} />
    },
    {
      id: 'call',
      label: 'Schedule Call',
      description: 'Schedule a call with the customer or carrier',
      icon: <Phone size={16} />
    },
    {
      id: 'email',
      label: 'Send Email',
      description: 'Send detailed email with instructions',
      icon: <Mail size={16} />
    },
    {
      id: 'reschedule',
      label: 'Reschedule Delivery',
      description: 'Automatically reschedule delivery timeline',
      icon: <Clock size={16} />
    },
    {
      id: 'reroute',
      label: 'Reroute Shipment',
      description: 'Find alternative route for the shipment',
      icon: <RefreshCw size={16} />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 text-crane-coral" size={20} />
            Take Action: {shipment.id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Alert Summary */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium">{shipment.title}</h3>
              <Badge className={getSeverityColor()}>
                {shipment.severity.charAt(0).toUpperCase() + shipment.severity.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{shipment.description}</p>
          </div>

          {/* Action Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Action</Label>
            <RadioGroup value={selectedAction} onValueChange={setSelectedAction}>
              <div className="space-y-3">
                {actionOptions.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <Label 
                        htmlFor={option.id} 
                        className="flex items-center cursor-pointer font-medium"
                      >
                        {option.icon}
                        <span className="ml-2">{option.label}</span>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Message/Notes */}
          <div>
            <Label htmlFor="message" className="text-base font-semibold">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add any additional instructions or notes..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAction} 
              className="flex-1 bg-crane-blue hover:bg-opacity-90"
            >
              Execute Action
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActionDialog;
