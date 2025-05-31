
import { supabase } from '@/integrations/supabase/client';
import { ValidationCheck, ValidationIssue } from '@/types/documents';

export interface ValidationRule {
  id: string;
  rule_name: string;
  rule_code: string;
  document_type: string;
  condition_field: string;
  condition_type: string;
  condition_value?: string;
  error_message: string;
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
}

/**
 * Fetch validation rules for a specific document type
 */
export async function getValidationRules(documentType: string): Promise<ValidationRule[]> {
  const { data, error } = await supabase
    .from('validation_rules')
    .select('*')
    .eq('document_type', documentType)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching validation rules:', error);
    return [];
  }

  return data || [];
}

/**
 * Apply validation rules to document content
 */
export async function validateDocumentContent(
  documentId: string,
  documentType: string,
  content: any
): Promise<{ validationChecks: ValidationCheck[], validationIssues: ValidationIssue[] }> {
  const rules = await getValidationRules(documentType);
  const validationChecks: ValidationCheck[] = [];
  const validationIssues: ValidationIssue[] = [];

  for (const rule of rules) {
    const checkResult = applyValidationRule(rule, content);
    
    validationChecks.push({
      name: rule.rule_name,
      description: rule.error_message,
      status: checkResult.passed ? 'passed' : 'failed',
      details: checkResult.details || ''
    });

    if (!checkResult.passed) {
      validationIssues.push({
        field: rule.condition_field,
        issue: rule.error_message,
        severity: rule.severity
      });
    }

    // Store validation result in database
    await supabase
      .from('document_validations')
      .insert({
        document_id: documentId,
        rule_id: rule.id,
        status: checkResult.passed ? 'passed' : 'failed',
        details: { result: checkResult.details }
      });
  }

  return { validationChecks, validationIssues };
}

/**
 * Apply a single validation rule to content
 */
function applyValidationRule(rule: ValidationRule, content: any): { passed: boolean; details?: string } {
  const fieldValue = getFieldValue(content, rule.condition_field);
  
  switch (rule.condition_type) {
    case 'required':
      return {
        passed: fieldValue !== null && fieldValue !== undefined && fieldValue !== '',
        details: fieldValue ? `Field has value: ${fieldValue}` : 'Field is missing or empty'
      };
      
    case 'equals':
      return {
        passed: fieldValue === rule.condition_value,
        details: `Expected: ${rule.condition_value}, Found: ${fieldValue}`
      };
      
    case 'contains':
      return {
        passed: fieldValue && fieldValue.toString().includes(rule.condition_value || ''),
        details: `Checking if "${fieldValue}" contains "${rule.condition_value}"`
      };
      
    case 'min_length':
      const minLength = parseInt(rule.condition_value || '0');
      const actualLength = fieldValue ? fieldValue.toString().length : 0;
      return {
        passed: actualLength >= minLength,
        details: `Required length: ${minLength}, Actual length: ${actualLength}`
      };
      
    case 'max_length':
      const maxLength = parseInt(rule.condition_value || '0');
      const currentLength = fieldValue ? fieldValue.toString().length : 0;
      return {
        passed: currentLength <= maxLength,
        details: `Max length: ${maxLength}, Actual length: ${currentLength}`
      };
      
    case 'numeric':
      const isNumeric = !isNaN(Number(fieldValue));
      return {
        passed: isNumeric,
        details: `Value "${fieldValue}" is ${isNumeric ? 'numeric' : 'not numeric'}`
      };
      
    case 'date_format':
      const isValidDate = !isNaN(Date.parse(fieldValue));
      return {
        passed: isValidDate,
        details: `Value "${fieldValue}" is ${isValidDate ? 'a valid date' : 'not a valid date'}`
      };
      
    default:
      return {
        passed: true,
        details: `Unknown validation type: ${rule.condition_type}`
      };
  }
}

/**
 * Get field value from nested object using dot notation
 */
function getFieldValue(obj: any, fieldPath: string): any {
  if (!obj || !fieldPath) return null;
  
  const keys = fieldPath.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return null;
    }
  }
  
  return value;
}

/**
 * Create sample validation rules for testing
 */
export async function createSampleValidationRules() {
  const sampleRules = [
    {
      rule_name: 'Invoice Number Required',
      rule_code: 'INV_NUM_REQ',
      document_type: 'PDF Document',
      condition_field: 'invoice_number',
      condition_type: 'required',
      error_message: 'Invoice number is required for all invoices',
      severity: 'high' as const,
      is_active: true
    },
    {
      rule_name: 'Company Name Required',
      rule_code: 'COMPANY_REQ',
      document_type: 'PDF Document',
      condition_field: 'company_name',
      condition_type: 'required',
      error_message: 'Company name must be present',
      severity: 'medium' as const,
      is_active: true
    },
    {
      rule_name: 'Total Amount Required',
      rule_code: 'TOTAL_AMT_REQ',
      document_type: 'PDF Document',
      condition_field: 'total_amount',
      condition_type: 'required',
      error_message: 'Total amount must be specified',
      severity: 'high' as const,
      is_active: true
    },
    {
      rule_name: 'Date Format Check',
      rule_code: 'DATE_FORMAT',
      document_type: 'PDF Document',
      condition_field: 'date',
      condition_type: 'date_format',
      error_message: 'Date must be in valid format',
      severity: 'medium' as const,
      is_active: true
    }
  ];

  const { error } = await supabase
    .from('validation_rules')
    .insert(sampleRules);

  if (error) {
    console.error('Error creating sample validation rules:', error);
  } else {
    console.log('Sample validation rules created successfully');
  }
}
