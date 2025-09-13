import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase.types';

const supabaseUrl = 'https://rrujkijdslnpjopvarad.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydWpraWpkc2xucGpvcHZhcmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDYzMjYsImV4cCI6MjA3MzIyMjMyNn0.UVj3JvjXWOo0d3Y-wb7ZnctjxGbi3v-z-iYW-zMl5Gk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
  }
});