
import React from 'react';
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
import DocumentCard from '@/components/customs/DocumentCard';
import { toast } from 'sonner';

const SmartClearance = () => {
  const handleUploadClick = () => {
    toast.info("Document upload functionality will be available in the next release.");
  };
  
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
            <Button onClick={handleUploadClick} className="bg-crane-blue hover:bg-opacity-90">
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
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-10" />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter Documents</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All Documents</DropdownMenuItem>
                  <DropdownMenuItem>Commercial Invoices</DropdownMenuItem>
                  <DropdownMenuItem>Bills of Lading</DropdownMenuItem>
                  <DropdownMenuItem>Packing Lists</DropdownMenuItem>
                  <DropdownMenuItem>Certificates of Origin</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SortAsc size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Newest First</DropdownMenuItem>
                  <DropdownMenuItem>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem>Status (Critical First)</DropdownMenuItem>
                  <DropdownMenuItem>Document Type</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="icon">
                <FilterX size={16} />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All (28)</TabsTrigger>
              <TabsTrigger value="pending">Pending (8)</TabsTrigger>
              <TabsTrigger value="processing">Processing (12)</TabsTrigger>
              <TabsTrigger value="verified">Verified (5)</TabsTrigger>
              <TabsTrigger value="rejected">Rejected (3)</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DocumentCard
                  title="Commercial Invoice #INV-89302"
                  type="PDF Document"
                  lastUpdated="10 mins ago"
                  status="processing"
                  progress={65}
                />
                <DocumentCard
                  title="Bill of Lading #BL-44985"
                  type="PDF Document"
                  lastUpdated="1 day ago"
                  status="rejected"
                  flagged={true}
                  progress={100}
                />
                <DocumentCard
                  title="Packing List #PL-67122"
                  type="PDF Document"
                  lastUpdated="2 hours ago"
                  status="verified"
                />
                <DocumentCard
                  title="Certificate of Origin #CO-11234"
                  type="PDF Document"
                  lastUpdated="Just now"
                  status="pending"
                  progress={10}
                />
                <DocumentCard
                  title="Commercial Invoice #INV-89123"
                  type="PDF Document"
                  lastUpdated="3 hours ago"
                  status="processing"
                  progress={42}
                />
                <DocumentCard
                  title="Dangerous Goods Dec #DG-5501"
                  type="PDF Document"
                  lastUpdated="5 hours ago"
                  status="verified"
                />
              </div>
            </TabsContent>
            <TabsContent value="pending">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DocumentCard
                  title="Certificate of Origin #CO-11234"
                  type="PDF Document"
                  lastUpdated="Just now"
                  status="pending"
                  progress={10}
                />
                <DocumentCard
                  title="Shipper's Letter #SL-8834"
                  type="PDF Document"
                  lastUpdated="1 hour ago"
                  status="pending"
                  progress={0}
                />
              </div>
            </TabsContent>
            <TabsContent value="processing">
              <div className="flex items-center justify-center h-52">
                <p className="text-muted-foreground">Processing documents will appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="verified">
              <div className="flex items-center justify-center h-52">
                <p className="text-muted-foreground">Verified documents will appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="rejected">
              <div className="flex items-center justify-center h-52">
                <p className="text-muted-foreground">Rejected documents will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing 6 of 28 documents
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SmartClearance;
