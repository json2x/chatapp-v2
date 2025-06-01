<template>
  <q-page class="no-padding page-container">
    <ChatInterface />
  </q-page>
</template>

<script setup lang="ts">
import ChatInterface from 'components/ChatInterface.vue';
import { onMounted } from 'vue';
import { initAuth, checkAuth } from '../services/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
  // Initialize authentication
  await initAuth();
  
  // Check if user is authenticated, if not redirect to landing page
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    void router.push('/');
  }
  
  // We no longer automatically set the first conversation as active
  // This allows the welcome screen with user's name and suggestions to be shown
  // The user must explicitly select a conversation to view it
});
</script>

<style>
.page-container {
  height: calc(100vh - 64px) !important; /* 64px is the height of the navbar */
  min-height: calc(100vh - 64px) !important;
  max-height: calc(100vh - 64px) !important;
  overflow: hidden;
  background-color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
