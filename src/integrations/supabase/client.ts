// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ztyelzkyalfbypfyypzk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWVsemt5YWxmYnlwZnl5cHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1Mjg0NzksImV4cCI6MjA2MzEwNDQ3OX0.Bpnjr0psyIk-3VV8S0R1PK2G8OKlwCey2Iakg-U8t5U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);