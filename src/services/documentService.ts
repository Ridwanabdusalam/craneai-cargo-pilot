
// This file is now just a barrel file exporting all document-related services
import { getAllDocuments, getDocumentById, getDocumentsByStatus, searchDocuments, createSampleDocuments } from './documents/documentQueries';
import { uploadDocument, verifyDocument, rejectDocument, fixDocumentIssues } from './documents/documentMutations';
import { downloadDocument } from './documents/documentStorage';
import { formatDocumentFromSupabase } from './documents/documentFormatters';
import { validateDocumentContent, createSampleValidationRules, getValidationRules } from './documents/documentValidation';
import { 
  validateFile, 
  validateDocumentTitle, 
  validateDocumentType, 
  sanitizeString,
  validateUserId,
  DEFAULT_SECURITY_CONFIG,
  type FileValidationResult,
  type DocumentSecurityConfig
} from './documents/documentSecurity';

export {
  // Queries
  getAllDocuments,
  getDocumentById,
  getDocumentsByStatus,
  searchDocuments,
  createSampleDocuments,
  
  // Mutations
  uploadDocument,
  verifyDocument,
  rejectDocument,
  fixDocumentIssues,
  
  // Storage
  downloadDocument,
  
  // Formatters
  formatDocumentFromSupabase,
  
  // Validation
  validateDocumentContent,
  createSampleValidationRules,
  getValidationRules,
  
  // Security
  validateFile,
  validateDocumentTitle,
  validateDocumentType,
  sanitizeString,
  validateUserId,
  DEFAULT_SECURITY_CONFIG,
  type FileValidationResult,
  type DocumentSecurityConfig
};
