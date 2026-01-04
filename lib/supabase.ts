
import { createClient } from '@supabase/supabase-js';

// Project ID: hvxmyzkauhzmeougyreg
const supabaseUrl: string = 'https://hvxmyzkauhzmeougyreg.supabase.co';

// Valid Project Anon Key provided by the user
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2eG15emthdWh6bWVvdWd5cmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MDUyMTIsImV4cCI6MjA4MzA4MTIxMn0.3ayg0Wbm6sLQ4BIqe4jaOwOPHaPpZGQwTk26diXbQVs';

/**
 * Validates if the key is a standard Supabase Project 'anon' key.
 */
const isManagementKey = supabaseAnonKey.startsWith('sb_publishable');
const isPlaceholder = 
  supabaseUrl.includes('your-project-url') || 
  supabaseAnonKey === 'your-anon-key' || 
  supabaseAnonKey === '' ||
  isManagementKey;

/**
 * Initialize the real Supabase client.
 */
const realClient = !isPlaceholder ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Mock client for UI preview/demo when keys are missing or invalid
const mockClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: null }, error: { message: "Invalid API Key." } }),
    signUp: async () => ({ data: { user: null }, error: { message: "Invalid API Key." } }),
    signOut: async () => ({ error: null }),
  }
};

export const supabase = (realClient || mockClient) as any;
export { isPlaceholder, isManagementKey, supabaseUrl };
