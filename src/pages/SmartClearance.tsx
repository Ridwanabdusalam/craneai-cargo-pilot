import React, { useState, useEffect, useCallback } from 'react';
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
  searchDocuments,
  createSampleDocuments
} from '@/services/documentService';
import { Document, DocumentStatus, DocumentFilters as IDocumentFilters } from '@/types/documents';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SmartClearance = () => {
  // Navigation and auth
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [creatingDocs, setCreatingDocs] = useState(false);
  
  // Constants
  const DOCUMENTS_PER_PAGE = 6;
  
  // Fetch documents with enhanced error handling
  const fetchDocuments = useCallback(async () => {
    console.log('Fetching documents...', { activeTab, fetchTrigger });
    setIsLoading(true);
    setFetchError(null);
    
    try {
      let docsResult: Document[] = [];
      if (activeTab === 'all') {
        docsResult = await getAllDocuments();
      } else {
        docsResult = await getDocumentsByStatus(activeTab as DocumentStatus);
      }
      
      console.log('Documents fetched successfully:', docsResult);
      setDocuments(docsResult);
      
      // Apply search filter if needed
      if (searchQuery) {
        const filtered = docsResult.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredDocuments(filtered);
      } else {
        setFilteredDocuments(docsResult);
      }
      
      // Only show toast on success if there was a previous error
      if (fetchError) {
        toast.success('Documents loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setFetchError('Failed to load documents. Please try again.');
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, fetchError, fetchTrigger]); 
  
  // Initial data fetch on component mount and when tab/fetch trigger changes
  useEffect(() => {
    console.log('Initial document fetch triggered', { fetchTrigger });
    fetchDocuments();
  }, [fetchTrigger, activeTab, fetchDocuments]);
  
  // Apply search filtering when search changes
  useEffect(() => {
    if (documents.length > 0) {
      if (searchQuery) {
        const filtered = documents.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredDocuments(filtered);
      } else {
        setFilteredDocuments(documents);
      }
    }
  }, [searchQuery, documents]);
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Handle filter change
  const handleFilterChange = (filters: IDocumentFilters) => {
    // Apply additional filters here if needed
    // For now, we're just using the activeTab for filtering
  };
  
  // Handle document upload
  const handleUploadComplete = () => {
    setIsUploadOpen(false);
    
    console.log('Document upload completed. Refreshing document list...');
    toast.success('Document uploaded successfully');
    
    // Trigger a refetch by updating fetchTrigger with a delay to ensure database updates are complete
    setTimeout(() => {
      console.log('Triggering fetch after document upload');
      setFetchTrigger(prev => prev + 1);
    }, 2000);
  };
  
  // Handle creating sample documents
  const handleCreateSampleDocs = async () => {
    try {
      setCreatingDocs(true);
      toast.info('Creating sample documents...');
      
      await createSampleDocuments();
      toast.success('Sample documents created successfully');
      
      // Trigger a refetch with delay to ensure DB operations complete
      setTimeout(() => {
        console.log('Triggering document refresh after sample creation');
        setFetchTrigger(prev => prev + 1);
      }, 2000);
    } catch (error) {
      toast.error('Failed to create sample documents');
      console.error('Error creating sample documents:', error);
    } finally {
      setCreatingDocs(false);
    }
  };
  
  // Handle view document details - FIXED: Fetch complete document with content
  const handleViewDocument = async (documentId: string) => {
    console.log('Fetching complete document details for:', documentId);
    setIsLoadingDocument(true);
    
    try {
      const fullDocument = await getDocumentById(documentId);
      if (fullDocument) {
        console.log('Complete document fetched with content:', fullDocument);
        setSelectedDocument(fullDocument);
      } else {
        toast.error('Document not found');
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
      toast.error('Failed to load document details');
    } finally {
      setIsLoadingDocument(false);
    }
  };
  
  // Close document details
  const handleCloseDetails = () => {
    setSelectedDocument(null);
  };
  
  // Handle document update (refresh)
  const handleDocumentUpdate = () => {
    console.log('Document updated. Refreshing document list...');
    // Trigger a refetch by updating fetchTrigger
    setFetchTrigger(prev => prev + 1);
    
    // Close the document details view
    setSelectedDocument(null);
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

  // Handle retry if fetch failed
  const handleRetry = () => {
    console.log('Retrying document fetch...');
    setFetchTrigger(prev => prev + 1);
  };

  // Force an initial fetch on component mount only
  useEffect(() => {
    // Force first fetch
    console.log('SmartClearance component mounted - forcing initial document fetch');
    fetchDocuments();
    
    // No periodic refresh as per user's request
  }, []);

  // Redirect to the clearance page if we're on the root route
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/') {
      console.log('Redirecting from root to /clearance');
      navigate('/clearance');
    }
  }, [navigate]);

  // If a document is being loaded, show loading state
  if (isLoadingDocument) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading document details...</p>
        </div>
      </div>
    );
  }

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
  
  console.log('Rendering SmartClearance with:', { 
    documentsCount: documents.length, 
    filteredCount: filteredDocuments.length,
    paginatedCount: paginatedDocuments.length,
    isLoading, 
    fetchError 
  });
  
  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <FileText size={18} className="text-crane-blue mr-2" />
              Document Processing Pipeline
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateSampleDocs}
                variant="outline"
                className="border-crane-blue text-crane-blue hover:bg-crane-blue/10"
                disabled={creatingDocs}
              >
                {creatingDocs ? 'Creating...' : 'Create Sample Documents'}
              </Button>
              <Button 
                onClick={() => setIsUploadOpen(true)} 
                className="bg-crane-blue hover:bg-opacity-90"
              >
                <Upload size={18} className="mr-2" />
                Upload Document
              </Button>
            </div>
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
              ) : fetchError ? (
                <div className="flex flex-col items-center justify-center h-52 text-center">
                  <FileText size={48} className="text-muted-foreground opacity-20 mb-4" />
                  <p className="text-destructive mb-2">{fetchError}</p>
                  <Button 
                    variant="outline" 
                    onClick={handleRetry}
                  >
                    Retry
                  </Button>
                </div>
              ) : paginatedDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-center">
                  <FileText size={48} className="text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground">No documents found</p>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button 
                      variant="default"
                      onClick={handleCreateSampleDocs}
                      disabled={creatingDocs}
                    >
                      {creatingDocs ? 'Creating...' : 'Create Sample Documents'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsUploadOpen(true)}
                    >
                      Upload your first document
                    </Button>
                  </div>
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
