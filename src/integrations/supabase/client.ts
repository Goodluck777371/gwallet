
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhpgtcrhsdbzzkgecrau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocGd0Y3Joc2RienprZ2VjcmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTc4NjgsImV4cCI6MjA1ODU3Mzg2OH0.DAN4xK9liCwy0h8kYcB-YL7Yk7MBcY1qv_OOCOkdMNI';

// Create a Supabase client with persistent sessions for better auth handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'gcoin-auth-token',
  }
});

// Add hooks to track user login/logout for the admin dashboard
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Record login activity in our user_activity table
    try {
      const userId = session?.user?.id;
      if (userId) {
        supabase.from('user_activity').insert({
          user_id: userId,
          action: 'login',
          ip_address: '127.0.0.1' // In a real app, we'd get this from the client
        }).then(({ error }) => {
          if (error) console.error('Error recording login activity:', error);
        });
      }
    } catch (error) {
      console.error('Error in auth state change handler:', error);
    }
  } else if (event === 'SIGNED_OUT') {
    // Record logout activity
    // We can't access the userId directly after sign out, so we'd need to store it beforehand
    const userId = session?.user?.id || localStorage.getItem('last_user_id');
    if (userId) {
      localStorage.removeItem('last_user_id');
      
      supabase.from('user_activity').insert({
        user_id: userId,
        action: 'logout',
        ip_address: '127.0.0.1'
      }).then(({ error }) => {
        if (error) console.error('Error recording logout activity:', error);
      });
    }
  }
  
  // Store current user ID for potential logout tracking
  if (session?.user?.id) {
    localStorage.setItem('last_user_id', session.user.id);
  }
});
