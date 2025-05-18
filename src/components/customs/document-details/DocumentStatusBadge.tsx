
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Search, 
  FileCheck, 
  FileX, 
  AlertCircle 
} from 'lucide-react';
import { DocumentStatus } from '@/types/documents';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_verification': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'processing': return 'AI Processing';
      case 'verified': return 'Verified';
      case 'rejected': return 'Rejected';
      case 'pending_verification': return 'Pending Verification';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'processing': return <Search className="h-5 w-5" />;
      case 'verified': return <FileCheck className="h-5 w-5" />;
      case 'rejected': return <FileX className="h-5 w-5" />;
      case 'pending_verification': return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <Badge className={getStatusColor()}>
      <span className="flex items-center">
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </span>
    </Badge>
  );
};
