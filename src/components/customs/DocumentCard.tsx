
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileText, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { DocumentStatus } from '@/types/documents';

interface DocumentCardProps {
  title: string;
  type: string;
  lastUpdated: string;
  status: DocumentStatus;
  flagged?: boolean;
  progress?: number;
  onViewDetails?: () => void;
  className?: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  type,
  lastUpdated,
  status,
  flagged = false,
  progress = 100,
  onViewDetails,
  className
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'processing': return 'AI Processing';
      case 'verified': return 'Verified';
      case 'rejected': return 'Needs Correction';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return <Clock size={16} className="mr-1" />;
      case 'processing': return <Search size={16} className="mr-1" />;
      case 'verified': return <CheckCircle size={16} className="mr-1" />;
      case 'rejected': return <AlertTriangle size={16} className="mr-1" />;
      default: return <FileText size={16} className="mr-1" />;
    }
  };

  // Format the timestamp as a relative time (e.g., "5 min ago")
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    
    // Convert to seconds
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffSecs < 3600) {
      const mins = Math.floor(diffSecs / 60);
      return `${mins} min${mins > 1 ? 's' : ''} ago`;
    } else if (diffSecs < 86400) {
      const hours = Math.floor(diffSecs / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffSecs / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card className={cn("overflow-hidden border hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-0">
        <div className="flex items-center p-4 border-b border-border">
          <div className="rounded-full bg-muted p-2 mr-3">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{title}</h3>
            <p className="text-xs text-muted-foreground">{type}</p>
          </div>
          <Badge className={getStatusColor()}>
            <div className="flex items-center">
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </Badge>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Processing</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          
          {flagged && (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-md flex items-center">
              <AlertTriangle size={14} className="text-red-600 mr-2" />
              <span className="text-xs text-red-800">Discrepancies detected</span>
            </div>
          )}
          
          {status === 'verified' && !flagged && (
            <div className="mt-3 px-3 py-2 bg-green-50 border border-green-100 rounded-md flex items-center">
              <CheckCircle size={14} className="text-green-600 mr-2" />
              <span className="text-xs text-green-800">All fields validated</span>
            </div>
          )}
          
          {status === 'pending' && (
            <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-md flex items-center">
              <Clock size={14} className="text-yellow-600 mr-2" />
              <span className="text-xs text-yellow-800">Waiting to be processed</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-muted/30 border-t border-border flex justify-between">
        <span className="text-xs text-muted-foreground">Updated {formatRelativeTime(lastUpdated)}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
