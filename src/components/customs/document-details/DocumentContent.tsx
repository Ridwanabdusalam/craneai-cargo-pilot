
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
        // If raw_text exists, attempt to parse it
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

  // Check if we have raw_text and directly display it
  if (content?.raw_text) {
    // Just display the raw text directly
    return (
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-medium mb-4">Raw Document Content</h3>
        <pre className="bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap">
          {content.raw_text}
        </pre>
      </div>
    );
  }

  // If no raw text, show an empty state
  return (
    <div className="text-center p-8">
      <p className="text-muted-foreground">No raw content available for this document.</p>
    </div>
  );
};
