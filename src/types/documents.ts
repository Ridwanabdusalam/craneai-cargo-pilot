
export type DocumentStatus = 'pending' | 'processing' | 'verified' | 'rejected';

export interface ValidationIssue {
  field: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DocumentContent {
  [key: string]: any;
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
