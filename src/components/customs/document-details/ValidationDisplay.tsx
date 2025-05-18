
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
            No validation checks were performed on this document.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg mb-4">Validation Checks</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Check</TableHead>
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
                  <Badge className={
                    check.status === 'passed' ? 'bg-green-100 text-green-800 border-green-200' : 
                    check.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }>
                    {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{check.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const allPassed = validationChecks && 
                     validationChecks.length > 0 && 
                     validationChecks.every(check => check.status === 'passed');
  
  if (validationIssues.length === 0 && allPassed) {
    return (
      <div className="text-center p-8">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">No Validation Issues</h3>
        <p className="text-muted-foreground">This document has passed all validation checks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderValidationChecks()}

      {validationIssues.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="font-medium text-lg">Validation Issues</h3>
          {validationIssues.map((issue: ValidationIssue, index: number) => (
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
            <Button onClick={onFixIssues} disabled={loading} className="bg-crane-blue hover:bg-opacity-90">
              {loading ? 'Processing...' : 'Fix Issues and Re-validate'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
