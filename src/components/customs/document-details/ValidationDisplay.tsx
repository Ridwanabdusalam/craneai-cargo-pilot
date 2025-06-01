
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ValidationIssue, ValidationCheck } from '@/types/documents';

interface ValidationDisplayProps {
  validationIssues: ValidationIssue[];
  validationChecks: ValidationCheck[];
  onFixIssues: () => void;
  loading: boolean;
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({ 
  validationIssues, 
  validationChecks, 
  onFixIssues, 
  loading 
}) => {
  const renderValidationChecks = () => {
    if (!validationChecks || validationChecks.length === 0) {
      return (
        <Alert className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No validation checks were performed on this document. The validation system may still be processing.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg mb-4">Validation Results</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validationChecks.map((check, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{check.name}</TableCell>
                <TableCell>{check.description}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {check.status === 'passed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {check.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {check.status === 'pending' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    <Badge className={
                      check.status === 'passed' ? 'bg-green-100 text-green-800 border-green-200' : 
                      check.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }>
                      {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{check.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const getValidationSummary = () => {
    if (!validationChecks || validationChecks.length === 0) {
      return null;
    }

    const passedCount = validationChecks.filter(check => check.status === 'passed').length;
    const failedCount = validationChecks.filter(check => check.status === 'failed').length;
    const pendingCount = validationChecks.filter(check => check.status === 'pending').length;
    const totalCount = validationChecks.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
          <div className="text-sm text-muted-foreground">Total Checks</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{passedCount}</div>
          <div className="text-sm text-muted-foreground">Passed</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{failedCount}</div>
          <div className="text-sm text-muted-foreground">Failed</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
      </div>
    );
  };

  const allPassed = validationChecks && 
                     validationChecks.length > 0 && 
                     validationChecks.every(check => check.status === 'passed');
  
  const hasFailures = validationChecks && 
                      validationChecks.some(check => check.status === 'failed');

  if (validationIssues.length === 0 && allPassed) {
    return (
      <div className="space-y-6">
        {getValidationSummary()}
        <div className="text-center p-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">All Validations Passed</h3>
          <p className="text-muted-foreground">This document has successfully passed all validation checks.</p>
        </div>
        {renderValidationChecks()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {getValidationSummary()}
      
      {renderValidationChecks()}

      {validationIssues.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="font-medium text-lg flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Validation Issues Found
          </h3>
          {validationIssues.map((issue: ValidationIssue, index: number) => (
            <div key={index} className="border rounded-md p-4 bg-red-50/50">
              <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle 
                  className={
                    issue.severity === 'high' ? 'text-red-500 h-5 w-5' : 
                    issue.severity === 'medium' ? 'text-yellow-500 h-5 w-5' : 
                    'text-orange-400 h-5 w-5'
                  } 
                />
                <h4 className="font-medium text-md">Field: {issue.field}</h4>
                <Badge 
                  className={
                    issue.severity === 'high' ? 'bg-red-100 text-red-800 border-red-200' : 
                    issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                    'bg-orange-100 text-orange-800 border-orange-200'
                  }
                >
                  {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} Priority
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{issue.issue}</p>
            </div>
          ))}

          {hasFailures && (
            <div className="flex justify-center pt-4">
              <Button onClick={onFixIssues} disabled={loading} className="bg-crane-blue hover:bg-opacity-90">
                {loading ? 'Processing...' : 'Fix Issues and Re-validate'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
