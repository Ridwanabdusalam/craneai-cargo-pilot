
// Document security utilities for input validation and sanitization
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface DocumentSecurityConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxFileNameLength: number;
}

export const DEFAULT_SECURITY_CONFIG: DocumentSecurityConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.doc', '.docx', '.xls', '.xlsx'],
  maxFileNameLength: 255
};

export function validateFile(file: File, config: DocumentSecurityConfig = DEFAULT_SECURITY_CONFIG): FileValidationResult {
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(config.maxFileSize / (1024 * 1024))}MB`
    };
  }

  // Check MIME type
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!config.allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File extension ${fileExtension} is not allowed`
    };
  }

  // Check filename length
  if (file.name.length > config.maxFileNameLength) {
    return {
      isValid: false,
      error: `Filename is too long (max ${config.maxFileNameLength} characters)`
    };
  }

  // Check for suspicious filename patterns
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|scr|vbs|js|jar|com|pif)$/i,
    /^\./, // Hidden files
    /[<>:"|?*]/, // Invalid characters
    /\.\./  // Directory traversal
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        isValid: false,
        error: 'Filename contains invalid or suspicious characters'
      };
    }
  }

  return { isValid: true };
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  
  // Remove potential XSS patterns
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '');
  
  // Trim to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
}

export function validateDocumentTitle(title: string): FileValidationResult {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Document title is required' };
  }
  
  if (title.length > 255) {
    return { isValid: false, error: 'Document title must be less than 255 characters' };
  }
  
  // Check for suspicious patterns
  if (/<script|javascript:|on\w+=/i.test(title)) {
    return { isValid: false, error: 'Document title contains invalid characters' };
  }
  
  return { isValid: true };
}

export function validateDocumentType(type: string): FileValidationResult {
  const allowedTypes = [
    'Invoice', 
    'Bill of Lading', 
    'Customs Declaration', 
    'Commercial Invoice',
    'Packing List',
    'Certificate of Origin',
    'Insurance Certificate',
    'Shipping Manifest'
  ];
  
  if (!allowedTypes.includes(type)) {
    return { isValid: false, error: 'Invalid document type' };
  }
  
  return { isValid: true };
}

export function rateLimitKey(userId: string, action: string): string {
  return `rate_limit:${userId}:${action}`;
}

export function validateUserId(userId: string): boolean {
  // UUID v4 pattern validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(userId);
}
