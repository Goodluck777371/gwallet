
import { useState, useEffect } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from '@/context/AuthContext';
import { setupAuthListener, getCurrentSession } from '@/services/authService';
import { fetchUserProfile } from '@/services/profileService';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle profile fetching
  const handleProfileFetch = async (userId: string) => {
    const profileData = await fetchUserProfile(userId);
    if (profileData) {
      setUser(profileData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = setupAuthListener(
      (currentSession) => {
        setSession(currentSession);
      },
      (currentUser) => {
        setSupabaseUser(currentUser);
        
        if (currentUser) {
          // Defer fetching profile data
          setTimeout(() => {
            handleProfileFetch(currentUser.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    getCurrentSession().then(({ data: { session: currentSession } }) => {
      console.log("Retrieved session:", currentSession?.user?.id);
      setSession(currentSession);
      setSupabaseUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        handleProfileFetch(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    setUser,
    supabaseUser,
    session,
    isLoading
  };
}
