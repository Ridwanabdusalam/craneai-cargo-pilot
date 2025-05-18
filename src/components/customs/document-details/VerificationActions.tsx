
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Document } from '@/types/documents';

interface VerificationActionsProps {
  document: Document;
  onVerify: () => void;
  onReject: (reason: string) => void;
  loading: boolean;
}

export const VerificationActions: React.FC<VerificationActionsProps> = ({ 
  document, 
  onVerify, 
  onReject, 
  loading 
}) => {
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const handleVerifyClick = () => {
    onVerify();
    setIsVerificationDialogOpen(false);
  };
  
  const handleRejectClick = () => {
    onReject(rejectionReason);
    setIsRejectionDialogOpen(false);
  };

  // Only show verification/rejection buttons for pending_verification status
  if (document.status !== 'pending_verification') {
    return null;
  }

  return (
    <div className="flex space-x-2">
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Verify Document
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to verify this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsVerificationDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleVerifyClick} 
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            variant="destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject Document
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <Textarea 
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleRejectClick} 
              variant="destructive"
              disabled={loading || !rejectionReason.trim()}
            >
              {loading ? 'Processing...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
