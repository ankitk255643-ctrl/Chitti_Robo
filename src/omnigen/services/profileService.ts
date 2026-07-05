import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  updated_at?: string;
}

/**
 * Fetch a user profile by ID from the `profiles` table.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured) {
    try {
      const saved = localStorage.getItem(`omnigen_mock_profile_${userId}`);
      if (saved) return JSON.parse(saved);
      // Generate default
      const mockProfile: UserProfile = {
        id: userId,
        email: 'mock@example.com',
        full_name: 'Mock User',
        updated_at: new Date().toISOString()
      };
      return mockProfile;
    } catch (e) {
      return null;
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // Ignore PGRST116 (No rows returned) as it just means the profile doesn't exist yet
    console.error('Error fetching profile:', error);
    throw error;
  }

  return data;
};

/**
 * Update an existing user profile in the `profiles` table.
 */
export const updateUserProfile = async (userId: string, updatedData: Partial<UserProfile>) => {
  if (!isSupabaseConfigured) {
    const current = await getUserProfile(userId) || { id: userId, email: 'mock@example.com' };
    const merged = { ...current, ...updatedData, updated_at: new Date().toISOString() };
    localStorage.setItem(`omnigen_mock_profile_${userId}`, JSON.stringify(merged));
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updatedData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
};

/**
 * Create a new user profile manually. 
 * Note: This is usually handled automatically via a Supabase Postgres Trigger on user signup,
 * but this function is provided as a fallback/manual override.
 */
export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  if (!isSupabaseConfigured) {
    const profile = { id: userId, ...profileData, updated_at: new Date().toISOString() };
    localStorage.setItem(`omnigen_mock_profile_${userId}`, JSON.stringify(profile));
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .insert([
      { id: userId, ...profileData, updated_at: new Date().toISOString() }
    ]);

  if (error) throw error;
};
