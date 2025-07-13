import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { userProfileService } from '../firebaseService';

export const useUserProfile = (userId?: string) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      console.log('🔍 UserProfile Hook: No userId provided, clearing state');
      setLoading(false);
      setUserProfile(null);
      return;
    }

    console.log(`🔍 UserProfile Hook: Initializing for user ${userId}`);
    let unsubscribe: (() => void) | undefined;

    const initializeUserProfile = async () => {
      try {
        console.log(`🔧 UserProfile Hook: Setting up real-time listener for user ${userId}`);
        setLoading(true);
        setError(null);

        // Set up real-time listener for user profile
        unsubscribe = userProfileService.subscribeToUserProfile(userId, async (profile) => {
          console.log(`📡 UserProfile Hook: Received profile update for user ${userId}:`, profile);
          
          if (profile) {
            console.log(`✅ UserProfile Hook: Profile loaded successfully`);
            setUserProfile(profile);
            setLoading(false);
          } else {
            console.log(`❌ UserProfile Hook: No profile found - this might be a new user or there's a permission issue`);
            // User profile doesn't exist - this is a new user or migrating user
            // We'll let the app handle creating the profile during onboarding
            setUserProfile(null);
            setLoading(false);
          }
        });

      } catch (err) {
        console.error(`🚨 UserProfile Hook: Error initializing for user ${userId}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
        setLoading(false);
      }
    };

    initializeUserProfile();

    return () => {
      console.log(`🧹 UserProfile Hook: Cleaning up subscription for user ${userId}`);
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const createUserProfile = async (email: string, displayName: string) => {
    if (!userId) {
      console.log('🚨 UserProfile Hook: Cannot create profile - no userId');
      return;
    }
    try {
      console.log(`🔧 UserProfile Hook: Creating profile for user ${userId}`);
      setError(null);
      await userProfileService.createUserProfile(userId, email, displayName);
      console.log(`✅ UserProfile Hook: Profile creation completed for user ${userId}`);
    } catch (err) {
      console.error(`🚨 UserProfile Hook: Error creating profile for user ${userId}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to create user profile');
      throw err;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) return;
    try {
      setError(null);
      await userProfileService.updateUserProfile(userId, updates);
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user profile');
      throw err;
    }
  };

  const completeOnboarding = async () => {
    if (!userId) return;
    try {
      setError(null);
      await userProfileService.completeOnboarding(userId);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      throw err;
    }
  };

  return {
    userProfile,
    loading,
    error,
    createUserProfile,
    updateUserProfile,
    completeOnboarding,
    clearError: () => setError(null)
  };
};
