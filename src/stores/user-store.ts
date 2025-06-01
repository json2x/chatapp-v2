import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserSession } from 'src/types/userStore';

export const useUserStore = defineStore('user', () => {
  // Initialize with default values that will be updated from Supabase session
  const userSession = ref<UserSession>({
    id: '',
    username: '',
    email: '',
    fullName: '',
    avatarUrl: 'https://cdn.quasar.dev/img/boy-avatar.png', // Default avatar
    isAuthenticated: false,
    roles: ['user'],
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en-US'
    },
    metadata: {
      lastLogin: new Date().toISOString(),
    }
  });

  // Function to update user preferences
  const updatePreferences = (preferences: Partial<UserSession['preferences']>) => {
    if (userSession.value && userSession.value.preferences) {
      userSession.value.preferences = {
        ...userSession.value.preferences,
        ...preferences
      };
    }
  };

  // Function to handle logout
  const logout = () => {
    // Keep the reference but reset properties
    if (userSession.value) {
      userSession.value.isAuthenticated = false;
      // Optionally clear sensitive data
      userSession.value.email = '';
      userSession.value.id = '';
    }
  };

  // Function to handle login with Supabase user data
  const login = (userData: Partial<UserSession>) => {
    // Merge the existing session with new data
    userSession.value = {
      ...userSession.value,
      ...userData,
      isAuthenticated: true,
      // Update last login timestamp
      metadata: {
        ...userSession.value?.metadata,
        ...userData.metadata,
        lastLogin: new Date().toISOString()
      }
    };
  };

  return {
    userSession,
    updatePreferences,
    logout,
    login,
  };
});
