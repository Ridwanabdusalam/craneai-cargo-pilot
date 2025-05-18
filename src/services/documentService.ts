
// This file is now just a barrel file exporting all document-related services
import { getAllDocuments, getDocumentById, getDocumentsByStatus, searchDocuments } from './documents/documentQueries';
import { uploadDocument, verifyDocument, rejectDocument, fixDocumentIssues } from './documents/documentMutations';
import { downloadDocument } from './documents/documentStorage';
import { formatDocumentFromSupabase } from './documents/documentFormatters';

export {
  getAllDocuments,
  getDocumentById,
  getDocumentsByStatus,
  searchDocuments,
  uploadDocument,
  verifyDocument,
  rejectDocument,
  fixDocumentIssues,
  downloadDocument,
  formatDocumentFromSupabase
};
