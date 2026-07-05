import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Client-side mock state fallbacks if Supabase is not configured
const mockSubscribers: ((user: any) => void)[] = [];
let mockCurrentUser: any = (() => {
  try {
    const saved = localStorage.getItem('omnigen_mock_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
})();

const triggerMockAuthChange = () => {
  mockSubscribers.forEach(cb => {
    try {
      cb(mockCurrentUser);
    } catch (e) {
      console.error(e);
    }
  });
};

/**
 * Sign up a new user with email and password.
 * Also passes extraProfileData to the user metadata, which is used by the SQL trigger to populate the profiles table.
 */
export const signUpUser = async (email: string, password: string, extraProfileData: { full_name?: string } = {}) => {
  if (!isSupabaseConfigured) {
    const mockUser = {
      id: 'mock-user-id-' + Math.random().toString(36).substring(2, 9),
      email,
      user_metadata: extraProfileData,
    };
    mockCurrentUser = mockUser;
    localStorage.setItem('omnigen_mock_user', JSON.stringify(mockUser));
    // Save mock profile as well
    const mockProfile = {
      id: mockUser.id,
      email: mockUser.email,
      full_name: extraProfileData.full_name || email.split('@')[0],
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(`omnigen_mock_profile_${mockUser.id}`, JSON.stringify(mockProfile));
    triggerMockAuthChange();
    return { user: mockUser, session: { user: mockUser } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: extraProfileData,
    },
  });
  if (error) throw error;
  return data;
};

/**
 * Log in an existing user with email and password.
 */
export const loginUser = async (email: string, password: string) => {
  if (!isSupabaseConfigured) {
    const mockUser = {
      id: 'mock-user-id-default',
      email,
      user_metadata: { full_name: email.split('@')[0] },
    };
    mockCurrentUser = mockUser;
    localStorage.setItem('omnigen_mock_user', JSON.stringify(mockUser));
    triggerMockAuthChange();
    return { user: mockUser, session: { user: mockUser } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * Log out the current user.
 */
export const logoutUser = async () => {
  if (!isSupabaseConfigured) {
    mockCurrentUser = null;
    localStorage.removeItem('omnigen_mock_user');
    triggerMockAuthChange();
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get the currently logged in user session.
 */
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured) {
    return mockCurrentUser;
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.user || null;
};

/**
 * Subscribe to authentication state changes.
 */
export const onAuthStateChange = (callback: (user: any) => void) => {
  if (!isSupabaseConfigured) {
    mockSubscribers.push(callback);
    // Fire callback immediately with current mock value
    setTimeout(() => callback(mockCurrentUser), 0);
    return {
      unsubscribe: () => {
        const index = mockSubscribers.indexOf(callback);
        if (index !== -1) {
          mockSubscribers.splice(index, 1);
        }
      }
    };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return subscription;
};
