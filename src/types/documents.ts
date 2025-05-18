
export type DocumentStatus = 'pending' | 'processing' | 'verified' | 'rejected' | 'pending_verification';

export interface ValidationIssue {
  field: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationCheck {
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'pending';
  details: string;
}

export interface DocumentContent {
  [key: string]: any;
}

export interface VerifiedBy {
  username: string;
  fullName: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  status: DocumentStatus;
  lastUpdated: string;
  progress: number;
  flagged: boolean;
  content: DocumentContent;
  validationIssues: ValidationIssue[];
  validationChecks: ValidationCheck[];
  processingTime: string | null;
  verifiedBy: VerifiedBy | null;
  processingStarted?: string;
  processingCompleted?: string;
}

export interface ValidationResult {
  success: boolean;
  message: string;
}

export interface DocumentUploadOptions {
  title?: string;
  description?: string;
  tags?: string[];
}

export interface DocumentFilters {
  status?: DocumentStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}
