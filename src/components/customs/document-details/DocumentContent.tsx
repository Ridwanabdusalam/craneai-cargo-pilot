
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
  // Comprehensive logging to debug the content structure
  console.log("DocumentContent component received:", content);
  console.log("Content type:", typeof content);
  console.log("Content keys:", Object.keys(content));
  
  // Handle error content
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
  
  // If status is still processing, show a processing message
  if (status === 'processing') {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing document content...</p>
      </div>
    );
  }
  
  // Handle raw text display if that's all we have
  if (content && content.raw_text && Object.keys(content).length === 1) {
    return (
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-medium mb-4">Document Text</h3>
        <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
          {content.raw_text}
        </pre>
      </div>
    );
  }
  
  // Check if we have actual content to display
  const hasDisplayableContent = content && 
    typeof content === 'object' && 
    Object.keys(content).filter(key => key !== 'raw_text' && key !== 'error').length > 0;
  
  if (hasDisplayableContent) {
    return renderStructuredContent(content);
  }
  
  // No content available
  return (
    <div className="text-center p-8">
      <p className="text-muted-foreground">No content available for this document.</p>
    </div>
  );
};

// Helper function to render structured content
const renderStructuredContent = (content: Record<string, any>) => {
  console.log("Rendering structured content:", content);
  
  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-4">Document Content</h3>
      <div className="space-y-6">
        {Object.entries(content).map(([key, value]) => {
          // Skip raw_text and error fields
          if (key === 'error' || key === 'raw_text') {
            return null;
          }
          
          // Handle nested objects
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
              <div key={key} className="border rounded-md p-4">
                <h4 className="font-medium text-md mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</h4>
                <div className="space-y-2">
                  {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                    <div key={`${key}-${subKey}`} className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground capitalize text-sm">{subKey.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                      <span className="text-sm font-medium">{String(subValue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          } 
          // Handle arrays - show as tables if they contain objects
          else if (Array.isArray(value)) {
            return (
              <div key={key} className="border rounded-md p-4">
                <h4 className="font-medium text-md mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</h4>
                {value.length > 0 && typeof value[0] === 'object' ? (
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
                            <TableCell key={idx}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="pl-4 border-l-2 border-muted space-y-1">
                    {value.map((item, index) => (
                      <div key={index} className="text-sm">
                        {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          } 
          // Handle simple key-value pairs
          else {
            return (
              <div key={key} className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
