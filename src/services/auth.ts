import { createClient, type Session } from '@supabase/supabase-js';
import { useUserStore } from 'src/stores/user-store';

// Create a Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true, // Enable session persistence
      storage: localStorage, // Use localStorage for session storage
    },
  },
);

// We'll use the user store instead of local reactive state

/**
 * Initialize auth state by checking for existing session
 */
export const initAuth = async () => {
  try {
    const userStore = useUserStore();
    // Get the current session
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      // Update user store with session data
      updateUserStoreFromSession(data.session);
    }

    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        updateUserStoreFromSession(session);
      } else {
        // Reset user authentication state on sign out
        userStore.logout();
      }

      // Handle specific auth events if needed
      if (event === 'SIGNED_IN') {
        console.log('User signed in');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    });

    return { user: userStore.userSession, session: data.session };
  } catch (error) {
    console.error('Error initializing auth:', error);
    return { user: null, session: null };
  }
};

/**
 * Sign in with Google OAuth
 */
export const login = () => {
  // Use a dedicated auth callback route instead of directly redirecting to /chat
  console.log('callback:', window.location.origin + '/auth/callback');
  void supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback',
    },
  });
};

/**
 * Handle OAuth callback and clean up URL
 * This should be called when the user is redirected back from the OAuth provider
 */
export const handleAuthCallback = async () => {
  try {
    // Get the current URL hash
    const hash = window.location.hash;

    // Check if we have auth parameters in the URL
    if (hash && hash.includes('access_token')) {
      // Process the hash to get the session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        return { success: false, error };
      }

      if (data.session) {
        // Update user store with session data
        updateUserStoreFromSession(data.session);

        // Clean up the URL by replacing the current history entry
        window.history.replaceState(null, '', '/chat');

        return { success: true, session: data.session };
      }
    }

    return { success: false, error: 'No session found' };
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return { success: false, error };
  }
};

/**
 * Sign out the current user
 * @param router Optional Vue Router instance for navigation after logout
 */
export const logout = async (router?: { push: (path: string) => Promise<void> | void }) => {
  try {
    const userStore = useUserStore();
    await supabase.auth.signOut();
    // Reset auth state in user store
    userStore.logout();
    // Redirect to landing page if router is provided
    if (router) {
      void router.push('/');
    }
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      // Update user store with current user data
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        updateUserStoreFromSession(session.data.session);
      }
    }
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const checkAuth = async (): Promise<boolean> => {
  const userStore = useUserStore();
  if (userStore.userSession.isAuthenticated) {
    return true;
  }

  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      updateUserStoreFromSession(data.session);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
};

/**
 * Helper function to update user store from Supabase session
 */
const updateUserStoreFromSession = (session: Session) => {
  const userStore = useUserStore();
  const user = session.user;

  if (user) {
    // Extract user metadata from Supabase user object
    const userData = {
      id: user.id,
      email: user.email || '',
      isAuthenticated: true,
      // Use user identity data if available (from OAuth providers)
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      username:
        user.user_metadata?.preferred_username || user.user_metadata?.email || user.email || 'user',
      // Get avatar URL from OAuth provider if available
      avatarUrl:
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        'https://cdn.quasar.dev/img/boy-avatar.png',
      // Preserve existing roles if they exist
      roles: userStore.userSession.roles || ['user'],
      // Preserve existing preferences if they exist
      preferences: userStore.userSession.preferences || {
        theme: 'light',
        notifications: true,
        language: 'en-US',
      },
      // Update metadata with session info
      metadata: {
        ...userStore.userSession.metadata,
        lastLogin: new Date().toISOString(),
        provider: user.app_metadata?.provider || 'email',
        // Add additional OAuth provider details if available
        providerId: user.app_metadata?.provider_id || null,
        lastSignInTime: session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : null,
      },
    };

    console.log('Updating user session with data from Supabase:', {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      avatarUrl: userData.avatarUrl,
    });

    // Update the user store
    userStore.login(userData);
  }
};

// Export supabase client for direct access if needed
export { supabase };
