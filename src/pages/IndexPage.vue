<template>
  <q-page class="no-padding page-container">
    <ChatInterface />
  </q-page>
</template>

<script setup lang="ts">
import ChatInterface from 'components/ChatInterface.vue';
import { onMounted } from 'vue';

onMounted(() => {
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
}
</style>
