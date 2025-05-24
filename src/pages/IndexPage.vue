<template>
  <q-page class="no-padding page-container">
    <ChatInterface />
  </q-page>
</template>

<script setup lang="ts">
import ChatInterface from 'components/ChatInterface.vue';
import { useChatStore } from 'src/stores/chat-store';
import { onMounted } from 'vue';

const chatStore = useChatStore();

onMounted(() => {
  // Initialize with the first chat selected if available
  if (chatStore.chatSessions.length > 0 && !chatStore.activeChatId) {
    const firstChat = chatStore.chatSessions[0];
    if (firstChat) {
      chatStore.setActiveChat(firstChat.id);
    }
  }
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
