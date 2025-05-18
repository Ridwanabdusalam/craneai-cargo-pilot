
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from 'lucide-react';
import { DocumentContent as DocContent } from '@/types/documents';

interface DocumentContentProps {
  content: DocContent;
  status: string;
}

export const DocumentContent: React.FC<DocumentContentProps> = ({ content, status }) => {
  // Helper function to try parsing raw_text if needed
  const tryParseRawText = () => {
    if (content?.raw_text) {
      try {
        return JSON.parse(content.raw_text);
      } catch (e) {
        console.error('Failed to parse raw_text as JSON:', e);
        return null;
      }
    }
    return null;
  };
  
  // Check if the document is still in the processing state
  // Note: pending_verification status means processing is complete but awaiting review
  if (status === 'processing') {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Document content is being processed...</p>
      </div>
    );
  }
  
  // Check for error state
  if (content && content.error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {content.error}
        </AlertDescription>
      </Alert>
    );
  }

  // If we have raw_text with parseable JSON but content wasn't properly parsed server-side
  const parsedRawText = tryParseRawText();
  
  // Use the parsed raw_text if available or if main content is empty
  const displayContent = (!content || Object.keys(content).length === 0 || 
                         (Object.keys(content).length === 1 && content.raw_text)) ? 
                         parsedRawText : content;
  
  // Check for empty content after trying all options
  if (!displayContent || Object.keys(displayContent).length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Content extraction not completed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(displayContent).map(([key, value]) => {
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
                    <span className="text-sm font-medium">{String(subValue)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (Array.isArray(value)) {
          return (
            <div key={key} className="border rounded-md p-4">
              <h4 className="font-medium text-md mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</h4>
              {value.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(value[0]).map((header) => (
                        <TableHead key={header} className="capitalize">
                          {header.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {value.map((item, index) => (
                      <TableRow key={index}>
                        {Object.values(item).map((val, idx) => (
                          <TableCell key={idx}>{String(val)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No items available</p>
              )}
            </div>
          );
        } else {
          return (
            <div key={key} className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
              <span className="font-medium">{String(value)}</span>
            </div>
          );
        }
      })}
    </div>
  );
};
