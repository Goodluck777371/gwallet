
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhpgtcrhsdbzzkgecrau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocGd0Y3Joc2RienprZ2VjcmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTc4NjgsImV4cCI6MjA1ODU3Mzg2OH0.DAN4xK9liCwy0h8kYcB-YL7Yk7MBcY1qv_OOCOkdMNI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'gcoin-auth-token',
  }
});
