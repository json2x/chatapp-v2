<template>
  <div class="chat-interface column">
    <!-- Chat Messages Area -->
    <div class="col q-pa-md chat-messages">
      <div class="content-container">
        <div class="text-center">
          <div class="text-h4 text-primary welcome-message">Hello, {{ userName }}</div>
          
          <!-- This will be where messages appear when they exist -->
          <div v-if="messages && messages.length > 0" class="chat-message-list">
            <!-- We'd show messages here in a real implementation -->
          </div>
        </div>
        
        <!-- Chat Suggestions -->
        <div class="suggestion-container q-mt-xl">
          <div class="row q-col-gutter-md justify-center">
            <div 
              v-for="suggestion in chatSuggestions" 
              :key="suggestion.id"
              class="col-auto"
            >
              <ChatSuggestion 
                :title="suggestion.title"
                :description="suggestion.description"
                @select="applySuggestion(suggestion)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Input Area -->
    <div class="q-pa-md chat-input">
      <div class="row items-center chat-input-container">
        <q-input
          v-model="messageInput"
          outlined
          rounded
          placeholder="Ask Gemini"
          dense
          bg-color="white"
          class="chat-prompt-input col"
          @keyup.enter="sendMessage"
        >
          <template v-slot:append>
            <q-icon name="mic" class="cursor-pointer q-mr-sm" />
            <q-icon name="send" @click="sendMessage" class="cursor-pointer" />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChatStore } from 'src/stores/chat-store';
import ChatSuggestion from './ChatSuggestion.vue';

const chatStore = useChatStore();
const messageInput = ref('');

const userName = computed(() => chatStore.currentUser);

const activeChat = computed(() => chatStore.activeChat());
const messages = computed(() => activeChat.value?.messages || []);

const chatSuggestions = computed(() => chatStore.chatSuggestions);

function applySuggestion(suggestion: { title: string, description: string }) {
  messageInput.value = `${suggestion.title} ${suggestion.description}`;
}

function sendMessage() {
  if (!messageInput.value.trim()) return;
  
  // In a real app, this would send the message to a backend
  // For this demo we'll just log it
  console.log('Sending message:', messageInput.value);
  
  // Clear the input
  messageInput.value = '';
}
</script>

<style scoped>
.chat-interface {
  height: 100%;
  max-height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0; /* This is crucial for flex child to not overflow */
}

.content-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.welcome-message {
  margin-top: 20vh;
  color: #5f6368;
  font-weight: 400;
  margin-bottom: 8rem;
}

.suggestion-container {
  margin-bottom: 2rem;
}

.chat-input {
  background-color: white;
  padding-bottom: 8px;
  flex-shrink: 0; /* Prevent this from shrinking */
}

.chat-input-container {
  max-width: 750px;
  margin: 0 auto;
  position: relative;
}

.chat-prompt-input {
  border-radius: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

/* Customize the input field */
:deep(.q-field__control) {
  border-radius: 24px;
  height: 48px;
}

:deep(.q-field__marginal) {
  height: 48px;
  color: #5f6368;
}
</style>
