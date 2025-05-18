
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Document, DocumentStatus, ValidationResult } from '@/types/documents';

// Local mock data store until we integrate with Supabase
let documentsStore: Document[] = [
  {
    id: 'doc-001',
    title: 'Commercial Invoice #INV-89302',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    progress: 65,
    flagged: false,
    content: {
      invoiceNumber: 'INV-89302',
      issueDate: '2023-05-15',
      dueDate: '2023-06-15',
      totalAmount: '$5,320.45',
      currency: 'USD',
      supplierInfo: {
        name: 'Global Manufacturing Co.',
        address: '123 Export Lane, Shanghai, China',
        taxId: 'CN8876543210'
      },
      buyerInfo: {
        name: 'US Imports Inc.',
        address: '789 Harbor Ave, Los Angeles, CA 90001, USA',
        taxId: 'US987654321'
      },
      items: [
        { description: 'Electronic Components A456', quantity: 200, unitPrice: '$12.50', total: '$2,500.00' },
        { description: 'Plastic Casings B789', quantity: 150, unitPrice: '$8.25', total: '$1,237.50' },
        { description: 'Metal Brackets C123', quantity: 300, unitPrice: '$5.00', total: '$1,500.00' }
      ]
    },
    validationIssues: []
  },
  {
    id: 'doc-002',
    title: 'Bill of Lading #BL-44985',
    type: 'PDF Document',
    status: 'rejected',
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    progress: 100,
    flagged: true,
    content: {
      blNumber: 'BL-44985',
      shipmentDate: '2023-05-12',
      portOfLoading: 'Shanghai, China',
      portOfDischarge: 'Los Angeles, USA',
      vesselName: 'Pacific Voyager',
      containerNumbers: ['CNTR98765432', 'CNTR87654321'],
      goodsDescription: 'Mixed Electronics and Parts'
    },
    validationIssues: [
      { field: 'Container Numbers', issue: 'CNTR98765432 not found in customs database', severity: 'high' },
      { field: 'Goods Description', issue: 'Description too vague for customs classification', severity: 'medium' }
    ]
  },
  {
    id: 'doc-003',
    title: 'Packing List #PL-67122',
    type: 'PDF Document',
    status: 'verified',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    progress: 100,
    flagged: false,
    content: {
      packingListNumber: 'PL-67122',
      packageCount: 24,
      totalWeight: '450 kg',
      dimensions: '120cm x 80cm x 100cm',
      items: [
        { description: 'Electronic Components A456', quantity: 200, weight: '150kg', packaging: 'Box' },
        { description: 'Plastic Casings B789', quantity: 150, weight: '100kg', packaging: 'Pallet' },
        { description: 'Metal Brackets C123', quantity: 300, weight: '200kg', packaging: 'Crate' }
      ]
    },
    validationIssues: []
  },
  {
    id: 'doc-004',
    title: 'Certificate of Origin #CO-11234',
    type: 'PDF Document',
    status: 'pending',
    lastUpdated: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // Just now
    progress: 10,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-005',
    title: 'Commercial Invoice #INV-89123',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    progress: 42,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-006',
    title: 'Dangerous Goods Dec #DG-5501',
    type: 'PDF Document',
    status: 'verified',
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    progress: 100,
    flagged: false,
    content: {
      dgNumber: 'DG-5501',
      hazardClass: '3 - Flammable Liquids',
      unNumber: 'UN1993',
      packingGroup: 'II',
      properShippingName: 'Flammable liquid, n.o.s (contains Isopropanol)',
      flashpoint: '18°C',
      quantity: '200L'
    },
    validationIssues: []
  },
  {
    id: 'doc-007',
    title: "Shipper's Letter #SL-8834",
    type: 'PDF Document',
    status: 'pending',
    lastUpdated: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    progress: 0,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-008',
    title: 'Import Declaration #ID-6627',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    progress: 75,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-009',
    title: 'Health Certificate #HC-3380',
    type: 'PDF Document',
    status: 'pending',
    lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    progress: 5,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-010',
    title: 'Insurance Certificate #IC-9945',
    type: 'PDF Document',
    status: 'rejected',
    lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    progress: 100,
    flagged: true,
    content: {},
    validationIssues: [
      { field: 'Coverage Amount', issue: 'Insufficient coverage for declared value', severity: 'high' },
      { field: 'Policy Period', issue: 'Policy expires before expected delivery date', severity: 'high' }
    ]
  },
  {
    id: 'doc-011',
    title: 'Fumigation Certificate #FC-7723',
    type: 'PDF Document',
    status: 'verified',
    lastUpdated: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
    progress: 100,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-012',
    title: 'Customs Value Declaration #CVD-4201',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    progress: 60,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-013',
    title: 'Declaration of Conformity #DC-8869',
    type: 'PDF Document',
    status: 'rejected',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    progress: 100,
    flagged: true,
    content: {},
    validationIssues: [
      { field: 'Standards Compliance', issue: 'Missing required compliance for electrical safety', severity: 'high' }
    ]
  },
  {
    id: 'doc-014',
    title: 'Inspection Certificate #IC-2205',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), // 9 hours ago
    progress: 30,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-015',
    title: 'Arrival Notice #AN-6632',
    type: 'PDF Document',
    status: 'verified',
    lastUpdated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
    progress: 100,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-016',
    title: 'Shipping Instructions #SI-9918',
    type: 'PDF Document',
    status: 'pending',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    progress: 15,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-017',
    title: 'Weight Certificate #WC-3344',
    type: 'PDF Document',
    status: 'pending',
    lastUpdated: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 mins ago
    progress: 8,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-018',
    title: 'Air Waybill #AWB-8801',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    progress: 45,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-019',
    title: 'Product Datasheet #PD-6677',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
    progress: 55,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-020',
    title: 'Quality Control Report #QC-7788',
    type: 'PDF Document',
    status: 'verified',
    lastUpdated: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 72 hours ago
    progress: 100,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-021',
    title: 'Phytosanitary Certificate #PC-5522',
    type: 'PDF Document',
    status: 'pending',
    lastUpdated: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    progress: 12,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-022',
    title: 'Freight Invoice #FI-9933',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(), // 11 hours ago
    progress: 68,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-023',
    title: 'Booking Confirmation #BC-4455',
    type: 'PDF Document',
    status: 'pending',
    lastUpdated: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 120 mins ago
    progress: 3,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-024',
    title: 'Dock Receipt #DR-3322',
    type: 'PDF Document',
    status: 'pending',
    lastUpdated: new Date(Date.now() - 150 * 60 * 1000).toISOString(), // 150 mins ago
    progress: 7,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-025',
    title: 'Letter of Credit #LC-6611',
    type: 'PDF Document',
    status: 'verified',
    lastUpdated: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), // 96 hours ago
    progress: 100,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-026',
    title: 'Export License #EL-8822',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    progress: 82,
    flagged: false,
    content: {},
    validationIssues: []
  },
  {
    id: 'doc-027',
    title: 'Shipping Manifest #SM-9944',
    type: 'PDF Document',
    status: 'rejected',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    progress: 100,
    flagged: true,
    content: {},
    validationIssues: [
      { field: 'Cargo Quantities', issue: 'Discrepancy between declared and actual quantities', severity: 'high' }
    ]
  },
  {
    id: 'doc-028',
    title: 'Import License #IL-7755',
    type: 'PDF Document',
    status: 'processing',
    lastUpdated: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    progress: 25,
    flagged: false,
    content: {},
    validationIssues: []
  }
];

// Get all documents
export const getAllDocuments = async (): Promise<Document[]> => {
  return documentsStore;
};

// Get documents by status
export const getDocumentsByStatus = async (status: DocumentStatus): Promise<Document[]> => {
  return documentsStore.filter(doc => doc.status === status);
};

// Get document by ID
export const getDocumentById = async (id: string): Promise<Document | null> => {
  const document = documentsStore.find(doc => doc.id === id);
  return document || null;
};

// Upload a new document
export const uploadDocument = async (file: File, title: string): Promise<Document> => {
  // In a real implementation, this would upload to Supabase Storage
  // For now, we'll create a mock document entry
  const newDocument: Document = {
    id: `doc-${Math.random().toString(36).substr(2, 9)}`,
    title: title || file.name,
    type: `${file.type.split('/')[1].toUpperCase()} Document`,
    status: 'pending',
    lastUpdated: new Date().toISOString(),
    progress: 0,
    flagged: false,
    content: {},
    validationIssues: []
  };

  // Add to our mock store
  documentsStore = [newDocument, ...documentsStore];

  // Start mock document processing
  startDocumentProcessing(newDocument.id);

  return newDocument;
};

// Mock function to simulate document processing
const startDocumentProcessing = (documentId: string) => {
  const document = documentsStore.find(doc => doc.id === documentId);
  if (!document) return;

  // Update to processing status
  document.status = 'processing';

  // Simulate progress updates
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress > 100) progress = 100;

    // Find and update the document in our store
    const docIndex = documentsStore.findIndex(doc => doc.id === documentId);
    if (docIndex >= 0) {
      documentsStore[docIndex].progress = progress;
      documentsStore[docIndex].lastUpdated = new Date().toISOString();

      // Complete processing when progress reaches 100%
      if (progress === 100) {
        clearInterval(interval);
        completeDocumentProcessing(documentId);
      }
    } else {
      clearInterval(interval);
    }
  }, 5000);
};

// Mock function to complete document processing
const completeDocumentProcessing = (documentId: string) => {
  const docIndex = documentsStore.findIndex(doc => doc.id === documentId);
  if (docIndex < 0) return;

  // Simulate AI validation results
  const validationSuccess = Math.random() > 0.2; // 80% chance of success
  
  if (validationSuccess) {
    documentsStore[docIndex].status = 'verified';
    toast.success(`Document ${documentsStore[docIndex].title} has been verified`);
  } else {
    documentsStore[docIndex].status = 'rejected';
    documentsStore[docIndex].flagged = true;
    
    // Add mock validation issues
    const issues = [
      { field: 'Company Information', issue: 'Mismatch with registered business details', severity: 'high' },
      { field: 'Tax ID', issue: 'Invalid tax identification number', severity: 'medium' },
      { field: 'Document Date', issue: 'Document appears to be expired', severity: 'high' }
    ];
    
    documentsStore[docIndex].validationIssues = issues.slice(0, Math.floor(Math.random() * 3) + 1);
    
    toast.error(`Document ${documentsStore[docIndex].title} has validation issues`);
  }
};

// Search documents
export const searchDocuments = async (query: string): Promise<Document[]> => {
  if (!query) return documentsStore;
  
  const lowerQuery = query.toLowerCase();
  return documentsStore.filter(doc => 
    doc.title.toLowerCase().includes(lowerQuery) || 
    doc.type.toLowerCase().includes(lowerQuery)
  );
};

// Validate document manually
export const validateDocumentManually = async (id: string): Promise<ValidationResult> => {
  const docIndex = documentsStore.findIndex(doc => doc.id === id);
  if (docIndex < 0) {
    return { success: false, message: 'Document not found' };
  }

  // Simulate manual validation
  documentsStore[docIndex].status = 'verified';
  documentsStore[docIndex].flagged = false;
  documentsStore[docIndex].validationIssues = [];
  documentsStore[docIndex].lastUpdated = new Date().toISOString();

  return { 
    success: true, 
    message: 'Document has been manually validated and approved'
  };
};

// Fix document issues
export const fixDocumentIssues = async (id: string, corrections: Record<string, string>): Promise<ValidationResult> => {
  const docIndex = documentsStore.findIndex(doc => doc.id === id);
  if (docIndex < 0) {
    return { success: false, message: 'Document not found' };
  }

  // Apply corrections to content
  documentsStore[docIndex].status = 'verified';
  documentsStore[docIndex].flagged = false;
  documentsStore[docIndex].validationIssues = [];
  documentsStore[docIndex].lastUpdated = new Date().toISOString();

  return { 
    success: true, 
    message: 'Document issues have been fixed and document is now verified'
  };
};
