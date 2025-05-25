import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserSession } from 'src/types/userStore';

export const useUserStore = defineStore('user', () => {
  // Mock user session data that would typically come from an auth provider
  const userSession = ref<UserSession>({
    id: 'usr_123456789',
    username: 'jayson_millan',
    email: 'jayson.millan@example.com',
    fullName: 'Jayson Millan',
    avatarUrl: 'https://cdn.quasar.dev/img/boy-avatar.png', // Using the existing avatar
    isAuthenticated: true,
    roles: ['user'],
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en-US'
    },
    metadata: {
      lastLogin: new Date().toISOString(),
      accountCreated: '2023-01-15T08:30:00Z',
      subscription: 'premium'
    }
  });

  // Function to update user preferences
  const updatePreferences = (preferences: Partial<UserSession['preferences']>) => {
    userSession.value.preferences = {
      ...userSession.value.preferences,
      ...preferences
    };
  };

  // Function to simulate logout
  const logout = () => {
    userSession.value.isAuthenticated = false;
  };

  // Function to simulate login
  const login = (userData: Partial<UserSession>) => {
    userSession.value = {
      ...userSession.value,
      ...userData,
      isAuthenticated: true
    };
  };

  return {
    userSession,
    updatePreferences,
    logout,
    login
  };
});
