
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verifyDocument, rejectDocument, fixDocumentIssues, downloadDocument } from '@/services/documentService';
import { toast } from 'sonner';
import { Document } from '@/types/documents';

// Import our new components
import { DocumentStatusBadge } from './document-details/DocumentStatusBadge';
import { DocumentContent } from './document-details/DocumentContent';
import { ValidationDisplay } from './document-details/ValidationDisplay';
import { OverviewTab } from './document-details/OverviewTab';
import { VerificationActions } from './document-details/VerificationActions';

interface DocumentDetailsProps {
  document: Document;
  onBack: () => void;
  onUpdate?: () => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ document, onBack, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock user ID for now - in a real app, this would come from auth context
  const currentUserId = "00000000-0000-0000-0000-000000000000";

  const handleVerifyDocument = async () => {
    setLoading(true);
    try {
      const result = await verifyDocument(document.id, currentUserId);
      if (result.success) {
        toast.success(result.message);
        if (onUpdate) onUpdate();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify the document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDocument = async (rejectionReason: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setLoading(true);
    try {
      const result = await rejectDocument(document.id, currentUserId, rejectionReason);
      if (result.success) {
        toast.success(result.message);
        if (onUpdate) onUpdate();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject the document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFixIssues = async () => {
    setLoading(true);
    try {
      const result = await fixDocumentIssues(document.id, {});
      if (result.success) {
        toast.success(result.message);
        if (onUpdate) onUpdate();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fixing document issues:', error);
      toast.error('Failed to fix document issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const downloadUrl = await downloadDocument(document.id);
      if (downloadUrl) {
        // Open the download URL in a new tab
        window.open(downloadUrl, '_blank');
      } else {
        toast.error('Failed to generate download link');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download the document');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-2 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Documents
      </Button>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-xl flex items-center">
                  {document.title}
                </CardTitle>
                <DocumentStatusBadge status={document.status} />
              </div>
              <CardDescription>
                {document.type} • Last updated {new Date(document.lastUpdated).toLocaleString()}
              </CardDescription>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={handleDownload}
                disabled={downloadLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloadLoading ? 'Processing...' : 'Download'}
              </Button>
              
              <VerificationActions 
                document={document}
                onVerify={handleVerifyDocument}
                onReject={handleRejectDocument}
                loading={loading}
              />
            </div>
          </div>
        </CardHeader>

        {document.status === 'processing' && (
          <CardContent className="pt-4 pb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Processing</span>
              <span>{document.progress}%</span>
            </div>
            <Progress value={document.progress} className="h-1.5" />
          </CardContent>
        )}
        
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Document Content</TabsTrigger>
              <TabsTrigger value="validation">
                Validation 
                {document.validationIssues.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                    {document.validationIssues.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <OverviewTab document={document} />
            </TabsContent>
            
            <TabsContent value="content" className="mt-4">
              <DocumentContent content={document.content} status={document.status} />
            </TabsContent>
            
            <TabsContent value="validation" className="mt-4">
              <ValidationDisplay 
                validationIssues={document.validationIssues}
                validationChecks={document.validationChecks}
                onFixIssues={handleFixIssues}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="flex w-full justify-between text-sm text-muted-foreground">
            <div>Document ID: {document.id}</div>
            <div>Last updated {new Date(document.lastUpdated).toLocaleString()}</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentDetails;
