
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
  // Enhanced logging to debug the content structure
  console.log("DocumentContent received:", content);
  
  // First check if we have an error in the content
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
  
  // Simplified content validation - check if we have a non-empty object with keys
  const hasContent = content && 
    typeof content === 'object' && 
    Object.keys(content).length > 0;
  
  if (hasContent) {
    return renderStructuredContent(content);
  }
  
  // If no content is available, show an empty state
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
          // Handle arrays with special case for items array
          else if (Array.isArray(value)) {
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
