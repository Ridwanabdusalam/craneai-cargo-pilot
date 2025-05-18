
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Upload, FilterX, Filter, Search, SortAsc } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DocumentCard from '@/components/customs/DocumentCard';
import DocumentUpload from '@/components/customs/DocumentUpload';
import DocumentDetails from '@/components/customs/DocumentDetails';
import DocumentFilters from '@/components/customs/DocumentFilters';
import { toast } from 'sonner';
import { 
  getAllDocuments, 
  getDocumentsByStatus, 
  getDocumentById,
  searchDocuments
} from '@/services/documentService';
import { Document, DocumentStatus, DocumentFilters as IDocumentFilters } from '@/types/documents';

const SmartClearance = () => {
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Constants
  const DOCUMENTS_PER_PAGE = 6;
  
  // Fetch documents
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  // Apply filtering when tab or search changes
  useEffect(() => {
    applyFilters();
  }, [activeTab, documents, searchQuery]);
  
  // Function to fetch all documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const allDocs = await getAllDocuments();
      setDocuments(allDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply filters based on active tab and search query
  const applyFilters = () => {
    let filtered: Document[] = [];
    
    try {
      if (activeTab === 'all') {
        filtered = documents;
      } else {
        filtered = documents.filter(doc => doc.status === activeTab);
      }
      
      // Apply search if query exists
      if (searchQuery) {
        filtered = filtered.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFilteredDocuments(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error('Failed to filter documents');
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle filter change
  const handleFilterChange = (filters: IDocumentFilters) => {
    // Apply additional filters here
    applyFilters();
  };
  
  // Handle document upload
  const handleUploadComplete = () => {
    setIsUploadOpen(false);
    
    // Fetch latest documents after a short delay to ensure the backend has processed the upload
    setTimeout(() => {
      fetchDocuments()
        .then(() => {
          // Only show success toast after documents are successfully fetched
          toast.success('Document uploaded successfully!');
        })
        .catch(error => {
          console.error('Error refreshing documents after upload:', error);
          // Still show upload success, but note refresh issue
          toast.success('Document uploaded successfully! Please refresh to see updates.');
        });
    }, 1000); // Increased delay to 1 second to allow for backend processing
  };
  
  // Handle view document details
  const handleViewDocument = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      setSelectedDocument(document);
    }
  };
  
  // Close document details
  const handleCloseDetails = () => {
    setSelectedDocument(null);
  };
  
  // Handle document update (refresh)
  const handleDocumentUpdate = () => {
    fetchDocuments();
    if (selectedDocument) {
      // Refresh the selected document details
      const updatedDoc = documents.find(doc => doc.id === selectedDocument.id);
      if (updatedDoc) {
        setSelectedDocument(updatedDoc);
      }
    }
  };
  
  // Calculate counts by status
  const getStatusCounts = () => {
    const counts = {
      all: documents.length,
      pending: documents.filter(doc => doc.status === 'pending').length,
      processing: documents.filter(doc => doc.status === 'processing').length,
      verified: documents.filter(doc => doc.status === 'verified').length,
      rejected: documents.filter(doc => doc.status === 'rejected').length
    };
    return counts;
  };
  
  const statusCounts = getStatusCounts();
  
  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / DOCUMENTS_PER_PAGE);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * DOCUMENTS_PER_PAGE,
    currentPage * DOCUMENTS_PER_PAGE
  );
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // If a document is selected, show its details
  if (selectedDocument) {
    return (
      <DocumentDetails 
        document={selectedDocument} 
        onBack={handleCloseDetails} 
        onUpdate={handleDocumentUpdate} 
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-crane-blue">SmartClearance Engine</h1>
        <p className="text-muted-foreground">Automated customs document processing and validation</p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <FileText size={18} className="text-crane-blue mr-2" />
              Document Processing Pipeline
            </CardTitle>
            <Button 
              onClick={() => setIsUploadOpen(true)} 
              className="bg-crane-blue hover:bg-opacity-90"
            >
              <Upload size={18} className="mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row bg-muted/50 rounded-md p-4 gap-4 mb-6">
            <Card className="flex-1 border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="font-medium mb-1">Document Extraction</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  AI extracts data from scanned & digital documents
                </p>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  87% Accuracy Rate
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="flex-1 border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="font-medium mb-1">Data Validation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Cross-references data with regulations & requirements
                </p>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  94% Validation Rate
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="flex-1 border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="font-medium mb-1">Human Review</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Flagged items reviewed by customs brokers
                </p>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  15% Flagged for Review
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="flex-1 border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <span className="text-xl font-bold">4</span>
                </div>
                <h3 className="font-medium mb-1">Customs Submission</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Validated documents submitted to authorities
                </p>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  98% Acceptance Rate
                </Badge>
              </CardContent>
            </Card>
          </div>
          
          <DocumentFilters 
            totalCount={documents.length}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({statusCounts.processing})</TabsTrigger>
              <TabsTrigger value="verified">Verified ({statusCounts.verified})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-52">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading documents...</p>
                  </div>
                </div>
              ) : paginatedDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-center">
                  <FileText size={48} className="text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground">No documents found</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsUploadOpen(true)} 
                    className="mt-2"
                  >
                    Upload your first document
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedDocuments.map((document) => (
                    <DocumentCard
                      key={document.id}
                      title={document.title}
                      type={document.type}
                      lastUpdated={document.lastUpdated}
                      status={document.status}
                      flagged={document.flagged}
                      progress={document.progress}
                      onViewDetails={() => handleViewDocument(document.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedDocuments.length} of {filteredDocuments.length} documents
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1 || filteredDocuments.length === 0}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === totalPages || filteredDocuments.length === 0}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Document Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to process through the SmartClearance engine.
            </DialogDescription>
          </DialogHeader>
          <DocumentUpload 
            onUploadComplete={handleUploadComplete}
            onCancel={() => setIsUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartClearance;
