
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
import { sanitizeString } from '@/services/documents/documentSecurity';

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
    // Sanitize the rejection reason before passing it up
    const sanitizedReason = sanitizeString(rejectionReason, 1000);
    if (sanitizedReason.trim().length === 0) {
      return; // Don't submit empty reason
    }
    onReject(sanitizedReason);
    setIsRejectionDialogOpen(false);
    setRejectionReason(''); // Clear the form
  };

  const handleRejectionReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Limit input length in real-time
    if (value.length <= 1000) {
      setRejectionReason(value);
    }
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
            disabled={loading}
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
            <Button 
              variant="outline" 
              onClick={() => setIsVerificationDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
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
            disabled={loading}
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
              placeholder="Reason for rejection (required, max 1000 characters)"
              value={rejectionReason}
              onChange={handleRejectionReasonChange}
              className="min-h-[100px]"
              maxLength={1000}
              disabled={loading}
            />
            <div className="text-sm text-gray-500 mt-1">
              {rejectionReason.length}/1000 characters
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectionDialogOpen(false);
                setRejectionReason('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRejectClick} 
              variant="destructive"
              disabled={loading || rejectionReason.trim().length === 0}
            >
              {loading ? 'Processing...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
