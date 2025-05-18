
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, FileCheck, FileText, AlertTriangle, Search, Timer } from 'lucide-react';
import { Document } from '@/types/documents';

interface OverviewTabProps {
  document: Document;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ document }) => {
  const getValidationStatusDisplay = () => {
    if (!document.validationChecks || document.validationChecks.length === 0) {
      return (
        <div className="flex items-center">
          <Clock className="text-yellow-500 mr-2" />
          <span className="font-medium">No validation performed yet</span>
        </div>
      );
    }

    const hasIssues = document.validationIssues.length > 0;
    const failedChecks = document.validationChecks.filter(check => check.status === 'failed').length;
    const pendingChecks = document.validationChecks.filter(check => check.status === 'pending').length;
    const passedChecks = document.validationChecks.filter(check => check.status === 'passed').length;
    const totalChecks = document.validationChecks.length;

    if (failedChecks > 0 || hasIssues) {
      return (
        <div className="flex items-center">
          <AlertTriangle className="text-red-500 mr-2" />
          <span className="font-medium">{failedChecks} failed checks, {document.validationIssues.length} issues found</span>
        </div>
      );
    } else if (pendingChecks > 0) {
      return (
        <div className="flex items-center">
          <Clock className="text-yellow-500 mr-2" />
          <span className="font-medium">{pendingChecks} checks pending, {passedChecks} passed</span>
        </div>
      );
    } else if (document.status === 'verified') {
      return (
        <div className="flex items-center">
          <CheckCircle className="text-green-500 mr-2" />
          <span className="font-medium">All {totalChecks} checks passed and verified</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <CheckCircle className="text-green-500 mr-2" />
          <span className="font-medium">All {totalChecks} checks passed, awaiting verification</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {document.status === 'pending' ? <Clock className="mr-2 h-4 w-4" /> : 
               document.status === 'processing' ? <Search className="mr-2 h-4 w-4" /> :
               document.status === 'verified' ? <FileCheck className="mr-2 h-4 w-4" /> :
               document.status === 'rejected' ? <FileText className="mr-2 h-4 w-4" /> :
               <Clock className="mr-2 h-4 w-4" />}
              <span className="ml-2 font-medium">
                {document.status === 'pending' ? 'Pending Review' :
                 document.status === 'processing' ? 'AI Processing' :
                 document.status === 'verified' ? 'Verified' :
                 document.status === 'rejected' ? 'Rejected' :
                 document.status === 'pending_verification' ? 'Pending Verification' :
                 'Unknown Status'}
              </span>
            </div>
            {document.verifiedBy && (
              <div className="mt-2 text-sm text-muted-foreground">
                {document.status === 'verified' ? 'Verified by' : 'Rejected by'}: {document.verifiedBy.fullName || document.verifiedBy.username}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium flex items-center">
              {document.status === 'processing' ? (
                <>
                  <Timer className="mr-2 h-4 w-4" />
                  <span>{document.progress}% Complete</span>
                </>
              ) : document.status === 'pending' ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Not started</span>
                </>
              ) : document.processingTime ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>{document.processingTime}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <span>Processing completed</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Validation Status</CardTitle>
          </CardHeader>
          <CardContent>
            {getValidationStatusDisplay()}
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
            
            {document.processingStarted && (
              <div className="mb-6">
                <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Search className="h-3 w-3 text-blue-600" />
                </div>
                <h4 className="font-medium">AI Processing Started</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.processingStarted).toLocaleString()}
                </p>
              </div>
            )}
            
            {document.processingCompleted && (
              <div className="mb-6">
                <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-purple-600" />
                </div>
                <h4 className="font-medium">Processing Completed</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.processingCompleted).toLocaleString()}
                  {document.processingTime && ` (took ${document.processingTime})`}
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
                  {document.status === 'verified' ? 'Document Verified' : 'Document Rejected'}
                  {document.verifiedBy && ` by ${document.verifiedBy.fullName || document.verifiedBy.username}`}
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
  );
};
