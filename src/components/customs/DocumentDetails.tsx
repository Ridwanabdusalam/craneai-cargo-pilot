
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  FileX, 
  ArrowLeft, 
  Download,
  Search,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateDocumentManually, fixDocumentIssues, downloadDocument } from '@/services/documentService';
import { toast } from 'sonner';
import { Document, ValidationIssue } from '@/types/documents';

interface DocumentDetailsProps {
  document: Document;
  onBack: () => void;
  onUpdate?: () => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ document, onBack, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = () => {
    switch (document.status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (document.status) {
      case 'pending': return 'Pending Review';
      case 'processing': return 'AI Processing';
      case 'verified': return 'Verified';
      case 'rejected': return 'Needs Correction';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = () => {
    switch (document.status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'processing': return <Search className="h-5 w-5" />;
      case 'verified': return <FileCheck className="h-5 w-5" />;
      case 'rejected': return <FileX className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const handleManualValidation = async () => {
    setLoading(true);
    try {
      const result = await validateDocumentManually(document.id);
      if (result.success) {
        toast.success(result.message);
        if (onUpdate) onUpdate();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error during manual validation:', error);
      toast.error('Failed to validate the document. Please try again.');
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

  const renderContent = () => {
    // Check for processing state
    if (document.status === 'processing') {
      return (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Document content is being processed...</p>
        </div>
      );
    }
    
    // Check for error state
    if (document.content && document.content.error) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {document.content.error}
          </AlertDescription>
        </Alert>
      );
    }

    // Check for empty content
    if (Object.keys(document.content).length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground">Content extraction not completed yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(document.content).map(([key, value]) => {
          if (key === 'error' || key === 'raw_text') {
            return null; // Skip error and raw_text fields
          }
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
              <div key={key} className="border rounded-md p-4">
                <h4 className="font-medium text-md mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</h4>
                <div className="space-y-2">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={`${key}-${subKey}`} className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground capitalize text-sm">{subKey.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium">{subValue as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          } else if (Array.isArray(value)) {
            return (
              <div key={key} className="border rounded-md p-4">
                <h4 className="font-medium text-md mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</h4>
                <Table>
                  <TableHeader>
                    {value.length > 0 && (
                      <TableRow>
                        {Object.keys(value[0]).map((header) => (
                          <TableHead key={header} className="capitalize">
                            {header.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                          </TableHead>
                        ))}
                      </TableRow>
                    )}
                  </TableHeader>
                  <TableBody>
                    {value.map((item, index) => (
                      <TableRow key={index}>
                        {Object.values(item).map((val, idx) => (
                          <TableCell key={idx}>{val as string}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          } else {
            return (
              <div key={key} className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                <span className="font-medium">{value as string}</span>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderValidationIssues = () => {
    if (document.validationIssues.length === 0) {
      return (
        <div className="text-center p-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Validation Issues</h3>
          <p className="text-muted-foreground">This document has passed all validation checks.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {document.validationIssues.map((issue: ValidationIssue, index: number) => (
          <div key={index} className="border rounded-md p-4">
            <div className="flex items-center space-x-3 mb-2">
              <AlertTriangle 
                className={
                  issue.severity === 'high' ? 'text-red-500' : 
                  issue.severity === 'medium' ? 'text-yellow-500' : 
                  'text-orange-400'
                } 
              />
              <h4 className="font-medium text-md">{issue.field}</h4>
              <Badge 
                className={
                  issue.severity === 'high' ? 'bg-red-100 text-red-800 border-red-200' : 
                  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                  'bg-orange-100 text-orange-800 border-orange-200'
                }
              >
                {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{issue.issue}</p>
          </div>
        ))}

        <div className="flex justify-center pt-4">
          <Button onClick={handleFixIssues} disabled={loading} className="bg-crane-blue hover:bg-opacity-90">
            {loading ? 'Processing...' : 'Fix Issues and Validate'}
          </Button>
        </div>
      </div>
    );
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
                <Badge className={getStatusColor()}>
                  <span className="flex items-center">
                    {getStatusIcon()}
                    <span className="ml-1">{getStatusText()}</span>
                  </span>
                </Badge>
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
              {document.status === 'rejected' && (
                <Button 
                  size="sm" 
                  className="bg-crane-blue hover:bg-opacity-90"
                  onClick={handleManualValidation}
                  disabled={loading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {loading ? 'Validating...' : 'Validate Manually'}
                </Button>
              )}
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
                  <Badge variant="destructive" className="ml-2">{document.validationIssues.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        {getStatusIcon()}
                        <span className="ml-2 font-medium">{getStatusText()}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Processing Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-medium">
                        {document.status === 'processing' 
                          ? `${document.progress}% Complete` 
                          : document.status === 'pending'
                            ? 'Not started'
                            : 'Completed'}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Validation Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        {document.validationIssues.length > 0 ? (
                          <>
                            <AlertTriangle className="text-red-500 mr-2" />
                            <span className="font-medium">{document.validationIssues.length} issues found</span>
                          </>
                        ) : document.status === 'verified' ? (
                          <>
                            <CheckCircle className="text-green-500 mr-2" />
                            <span className="font-medium">Validated successfully</span>
                          </>
                        ) : (
                          <>
                            <Clock className="text-yellow-500 mr-2" />
                            <span className="font-medium">Awaiting validation</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Processing Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pl-6 border-l">
                      <div className="mb-6">
                        <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                          <FileText className="h-3 w-3 text-green-600" />
                        </div>
                        <h4 className="font-medium">Document Uploaded</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(document.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                      
                      {document.status !== 'pending' && (
                        <div className="mb-6">
                          <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Search className="h-3 w-3 text-blue-600" />
                          </div>
                          <h4 className="font-medium">AI Processing Started</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(new Date(document.lastUpdated).getTime() - 10 * 60 * 1000).toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {(document.status === 'verified' || document.status === 'rejected') && (
                        <div>
                          <div className={`absolute -left-3 mt-1.5 h-6 w-6 rounded-full ${
                            document.status === 'verified' ? 'bg-green-100' : 'bg-red-100'
                          } flex items-center justify-center`}>
                            {document.status === 'verified' ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                            )}
                          </div>
                          <h4 className="font-medium">
                            {document.status === 'verified' ? 'Validation Successful' : 'Validation Failed'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(document.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-4">
              {renderContent()}
            </TabsContent>
            
            <TabsContent value="validation" className="mt-4">
              {renderValidationIssues()}
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
