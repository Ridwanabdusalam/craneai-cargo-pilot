
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, FileText } from 'lucide-react';
import { DocumentContent as DocContent } from '@/types/documents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

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
  
  // Only show processing indicator if status is processing AND we have no content
  // This allows showing content even during processing if it's available
  if (status === 'processing' && (!content || Object.keys(content).filter(key => key !== 'error').length === 0)) {
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
    (Object.keys(content).length > 0 || content.raw_text);
  
  console.log('DocumentContent - Content check:', {
    content,
    keys: content ? Object.keys(content) : [],
    hasDisplayableContent,
    hasRawText: !!content?.raw_text,
    hasItems: Array.isArray(content?.items),
    contentType: typeof content,
    contentValue: content
  });

  // If we have content but it's an empty object, try to handle it
  if (content && typeof content === 'object' && Object.keys(content).length === 0) {
    console.log('Content is an empty object, checking for raw text or other content');
  }

  if (hasDisplayableContent) {
    return renderEnhancedContent(content);
  }
  
  // No content available
  return (
    <div className="text-center p-8">
      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
      <p className="text-muted-foreground">No content available for this document.</p>
      {content && (
        <div className="mt-4 p-4 bg-muted rounded-md text-left text-sm">
          <p className="font-medium mb-2">Debug Info - Raw Content:</p>
          <pre className="whitespace-pre-wrap max-h-96 overflow-y-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Enhanced content rendering with tabs if document has multiple sections
const renderEnhancedContent = (content: Record<string, any>) => {
  console.log("Rendering enhanced content:", content);
  
  // Get top-level keys except raw_text and error for potential tabs
  const contentSections = Object.keys(content).filter(key => 
    key !== 'error' && key !== 'raw_text'
  );
  
  // If we have multiple distinct sections, show them in tabs
  if (contentSections.length > 3) {
    return (
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-medium mb-4">Document Content</h3>
        <Tabs defaultValue={contentSections[0]} className="w-full">
          <TabsList className="mb-4">
            {contentSections.map(section => (
              <TabsTrigger key={section} value={section} className="capitalize">
                {section.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {contentSections.map(section => (
            <TabsContent key={section} value={section}>
              {renderContentSection(section, content[section])}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }
  
  // Otherwise show all sections in a scrollable layout
  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-4">Document Content</h3>
      <div className="space-y-6">
        {contentSections.map(section => (
          <Card key={section} className="overflow-hidden">
            <CardContent className="p-4">
              <h4 className="font-medium text-md mb-2 capitalize border-b pb-2 break-words">
                {section.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
              </h4>
              {renderContentSection(section, content[section])}
            </CardContent>
          </Card>
        ))}
        
        {/* Show raw text at the bottom if available alongside other content */}
        {content.raw_text && contentSections.length > 0 && (
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <h4 className="font-medium text-md mb-2 capitalize border-b pb-2">Raw Text</h4>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm max-h-60 overflow-y-auto">
                {content.raw_text}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Helper function to render individual content sections
const renderContentSection = (key: string, value: any) => {
  // Handle different value types
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {Object.entries(value as Record<string, any>).map(([subKey, subValue], index) => (
          <div key={`${key}-${subKey}-${index}`} className="flex justify-between border-b pb-1 gap-4">
            <span className="text-muted-foreground capitalize text-sm flex-shrink-0 min-w-0 break-words">
              {subKey.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
            </span>
            <span className="text-sm font-medium text-right min-w-0 break-words">
              {formatValue(subValue)}
            </span>
          </div>
        ))}
      </div>
    );
  } 
  // Handle arrays - show as tables if they contain objects
  else if (Array.isArray(value)) {
    return (
      <div className="overflow-x-auto">
        {value.length > 0 && typeof value[0] === 'object' ? (
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(value[0]).map((header, idx) => (
                  <TableHead key={`${header}-${idx}`} className="capitalize min-w-0 break-words">
                    {header.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {value.map((item, index) => (
                <TableRow key={index}>
                  {Object.values(item).map((val, idx) => (
                    <TableCell key={`${idx}-${val}`} className="min-w-0 break-words">
                      {formatValue(val)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="pl-4 border-l-2 border-muted space-y-1">
            {value.map((item, index) => (
              <div key={`${index}-${item}`} className="text-sm break-words">
                {formatValue(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } 
  // Handle simple values
  else {
    return <span className="text-sm break-words">{formatValue(value)}</span>;
  }
};

// Helper function to format values appropriately
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' && !isNaN(value)) {
    // Format currency-like numbers
    if (value && typeof value === 'number' && 
        value.toString().includes('.') && 
        value.toString().split('.')[1].length <= 2) {
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
    // Format other numbers
    return value.toLocaleString();
  }
  return String(value);
};
