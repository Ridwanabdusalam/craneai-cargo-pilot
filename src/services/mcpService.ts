
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Query the Model Context Protocol with logistics context
export const queryWithContext = async (query: string, contextTypes: string[] = []): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('model-context-protocol', {
      body: { query, contextTypes }
    });
    
    if (error) {
      throw error;
    }
    
    return data?.response || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error calling Model Context Protocol:', error);
    toast.error('Failed to get AI response');
    return 'I encountered an error while processing your request. Please try again.';
  }
};

// Seed the knowledge base with logistics domain knowledge
export const seedKnowledgeBase = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('seed-knowledge-base', {});
    
    if (error) {
      throw error;
    }
    
    console.log('Knowledge base seeding result:', data);
    return true;
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    return false;
  }
};

// Get all context source types (for filtering)
export const getContextSourceTypes = async (): Promise<string[]> => {
  try {
    // Fix: Use a different approach to get distinct values
    const { data, error } = await supabase
      .from('context_sources')
      .select('source_type');
      
    if (error) {
      throw error;
    }
    
    // Manually get unique source types from the results
    const uniqueTypes = new Set<string>();
    data.forEach(row => uniqueTypes.add(row.source_type));
    
    return Array.from(uniqueTypes);
  } catch (error) {
    console.error('Error fetching context source types:', error);
    return ['company_info', 'services', 'industry', 'technology', 'compliance'];
  }
};
