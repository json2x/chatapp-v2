<template>
  <div class="chat-interface column">
    <!-- Chat Messages Area -->
    <div class="col q-pa-md chat-messages" ref="messagesContainer">
      <div class="content-container">
        <!-- Loading state for messages -->
        <div v-if="isLoadingMessages && messages.length === 0" class="loading-container">
          <div class="loading-content">
            <q-spinner-dots color="primary" size="3em" />
            <div class="q-mt-md text-subtitle1 text-grey-5">Loading conversation...</div>
          </div>
        </div>
        
        <!-- Error state for messages -->
        <div v-else-if="messageLoadError" class="text-center q-pa-xl">
          <q-icon name="mdi-alert-circle" color="negative" size="3em" />
          <div class="q-mt-md text-subtitle1 text-negative">{{ messageLoadError }}</div>
          <q-btn 
            flat 
            color="primary" 
            label="Retry" 
            class="q-mt-md" 
            @click="retryLoadMessages"
          />
        </div>
        
        <!-- Empty state / Welcome screen -->
        <div v-else-if="messages.length === 0" class="text-center">
          <div class="text-h4 welcome-message gradient-text">Hello, {{ userName }}</div>
          
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

        <!-- <div v-else-if="messages.length > 0 && !isLoadingMessages && !messageLoadError" class="text-center">
          {{ messages}}
        </div> -->
        
        <!-- Chat Messages -->
        <div v-else class="chat-message-list q-pa-md">
          <q-chat-message
            v-for="(message, index) in messages"
            :key="index"
            :name="message.sender === 'user' ? userName : 'Assistant'"
            :sent="message.sender === 'user'"
            :bg-color="message.sender === 'user' ? ($q.dark.isActive ? 'grey-8' : 'grey-3') : ($q.dark.isActive ? 'transparent' : 'white')"
            :text-color="message.sender === 'user' ? ($q.dark.isActive ? 'white' : 'black') : ($q.dark.isActive ? 'white' : 'black')"
            class="q-mb-md custom-chat-message"
          >
            <div v-if="message.sender === 'user'">
              {{ message.content }}
            </div>
            <div v-else v-html="renderMarkdown(message.content)" class="markdown-content"></div>
          </q-chat-message>
          
          <!-- Assistant typing indicator -->
          <div v-if="isProcessing" class="typing-indicator q-mb-md">
            <q-chat-message
              name="Assistant"
              bg-color="white"
              text-color="black"
              class="custom-chat-message"
            >
              <q-spinner-dots size="2rem" color="primary" />
            </q-chat-message>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Input Area -->
    <div class="q-px-md q-pt-md q-pb-xl chat-input">
      <div class="row items-center chat-input-container">
        <q-input
          v-model="messageInput"
          outlined
          placeholder="Ask Mr Roboto"
          dense
          :bg-color="$q.dark.isActive ? 'transparent' : 'white'"
          class="chat-prompt-input col"
          :class="{ 'dark-input': $q.dark.isActive }"
          :color="$q.dark.isActive ? 'white' : 'primary'"
          @keyup.enter="sendMessage"
          ref="inputField"
        >
          <template v-slot:append>
            <!-- Show mic and send icons when not processing -->
            <template v-if="!isProcessing">
              <q-icon name="mdi-microphone" class="cursor-pointer q-mr-sm primary-icon" />
              <q-icon name="mdi-send" @click="sendMessage" class="cursor-pointer primary-icon" />
            </template>
            <!-- Show stop button when processing -->
            <template v-else>
              <div class="stop-button-container">
                <q-icon name="mdi-stop" @click="stopResponse" class="cursor-pointer stop-button" />
                <div class="rotating-overlay"></div>
              </div>
            </template>
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watchEffect } from 'vue';
import { useChatStore } from 'src/stores/chat-store';
import { useQuasar } from 'quasar';
import ChatSuggestion from './ChatSuggestion.vue';
import { sendChatMessage, processStreamResponse } from 'src/services/chatService';
import { getConversationById } from 'src/services/conversationService';
import type { ChatRequest, ChatStreamResponse } from 'src/types/servicesTypes';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { renderMarkdown } from 'src/misc/markdownRenderer';

const $q = useQuasar();
const chatStore = useChatStore();

// Reactive references
const messageInput = ref('');
const isProcessing = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const inputField = ref<{ $el?: HTMLElement } | null>(null);
const responseTimer = ref<number | null>(null);

// Computed properties
const activeChat = computed(() => chatStore.activeChat());
const messages = computed(() => activeChat.value?.messages || []);
const userName = computed(() => chatStore.currentUser || 'User');
const selectedModel = computed(() => chatStore.selectedVersion);
const isLoadingMessages = computed(() => chatStore.isLoadingMessages);
const messageLoadError = computed(() => chatStore.messageLoadError);
const conversations = computed(() => chatStore.conversations);

const chatSuggestions = computed(() => chatStore.chatSuggestions);

function applySuggestion(suggestion: { title: string, description: string }) {
  messageInput.value = `${suggestion.title} ${suggestion.description}`;
  // Focus on the input after applying suggestion
  void nextTick(() => {
    const inputEl = document.querySelector('.chat-prompt-input input');
    if (inputEl) {
      (inputEl as HTMLInputElement).focus();
    }
  });
}

async function sendMessage() {
  if (!messageInput.value.trim() || isProcessing.value) return;
  
  const userMessage = messageInput.value.trim();
  messageInput.value = ''; // Clear input immediately
  
  // Get the selected model from the store
  const model = selectedModel.value;
  
  // Create a unique ID for the user message
  const userMessageId = Date.now().toString();
  
  // The chat store will now create a new chat if needed when we add a message
  // No need to explicitly call createNewChat()
  
  // Add the user message to the UI immediately
  chatStore.addMessage({
    id: userMessageId,
    content: userMessage,
    sender: 'user',
    timestamp: new Date()
  });
  
  // Scroll to bottom after user message is added
  void nextTick(() => {
    scrollToBottom();
  });
  
  // Show the typing indicator
  isProcessing.value = true;
  
  try {
    // Prepare the chat request
    const chatRequest: ChatRequest = {
      model,
      message: userMessage,
    };
    
    // If there's an active conversation with a server-generated ID, include it
    // We can identify server-generated IDs vs. temporary IDs by checking if they're numeric
    if (activeChat.value && !(/^\d+$/.test(activeChat.value.id))) {
      // This is a server-generated ID, so include it in the request
      chatRequest.conversation_session_id = activeChat.value.id;
    }
    
    // Send the chat message and get the stream
    const stream = await sendChatMessage(chatRequest);
    
    // Create a temporary ID for the assistant's response
    const assistantMessageId = (Date.now() + 1).toString();
    
    // Add an initial empty message for the assistant that we'll update as chunks come in
    // chatStore.addMessage({
    //   id: assistantMessageId,
    //   content: '',
    //   sender: 'assistant',
    //   timestamp: new Date()
    // });
    
    // Track the conversation ID from the response
    let conversationId: string | null = null;
    let fullContent = '';
    
    // Process the streaming response
    await processStreamResponse(
      stream,
      (chunk: ChatStreamResponse) => {
        // If this is the first chunk, remove the typing indicator
        // This will show the actual content immediately instead of the loading spinner
        if (isProcessing.value) {
          isProcessing.value = false;
        }
        
        // Update the content with each chunk
        fullContent += chunk.content;
        
        // Update the assistant's message in real-time
        let assistantMessage = activeChat.value?.messages.find(m => m.id === assistantMessageId);
        if(!assistantMessage) {
          chatStore.addMessage({
            id: assistantMessageId,
            content: '',
            sender: 'assistant',
            timestamp: new Date()
          });
          assistantMessage = activeChat.value?.messages[activeChat.value?.messages.length - 1];
        }else{
          assistantMessage.content = fullContent;
        }
        
        // If this is the first chunk with a conversation ID, store it and update the conversation
        if (chunk.conversation_id && !conversationId) {
          conversationId = chunk.conversation_id;
          
          // Check if we need to update the temporary conversation ID
          if (activeChat.value && /^\d+$/.test(activeChat.value.id)) {
            const oldId = activeChat.value.id;
            
            // Update the conversation ID in the store
            // We need to update both the conversation object and the activeChatId
            const tempChat = conversations.value.find(c => c.id === oldId);
            if (tempChat) {
              // Update the ID
              tempChat.id = conversationId;
              
              // We don't need to update message conversation_id as it's not part of our ChatMessage interface
              
              // Update the conversation ID in the store by calling setActiveChat
              // This will properly update the activeChatId ref
              void chatStore.setActiveChat(conversationId);
            }
          }
        }
        
        // Scroll to bottom as new content arrives
        void nextTick(() => {
          scrollToBottom();
        });
      },
      () => {
        // Stream is complete
        // Note: isProcessing is already set to false after the first chunk
        
        // If this was a new conversation (no active chat before), fetch the full conversation
        if (conversationId && (!activeChat.value || activeChat.value.id !== conversationId)) {
          // Use void to explicitly mark the promise as ignored
          void (async () => {
            try {
              // Fetch the full conversation from the conversation service
              const fullConversation = await getConversationById(conversationId);
              
              // Update the store with the new conversation
              if (fullConversation) {
                // Set this as the active chat
                void chatStore.setActiveChat(conversationId);
              }
            } catch (error) {
              console.error('Error fetching conversation:', error);
              $q.notify({
                type: 'negative',
                message: 'Failed to load the conversation. Please try again.'
              });
            }
          })();
        }
        
        // Focus the input field after response
        void nextTick(() => {
          if (inputField.value && inputField.value.$el) {
            const input = inputField.value.$el.querySelector('input');
            if (input) input.focus();
          }
        });
      },
      (error: Error) => {
        // Handle stream errors
        console.error('Stream error:', error);
        isProcessing.value = false;
        $q.notify({
          type: 'negative',
          message: 'An error occurred while processing the response.'
        });
      }
    );
  } catch (error) {
    // Handle API errors
    console.error('Chat API error:', error);
    isProcessing.value = false;
    $q.notify({
      type: 'negative',
      message: 'Failed to send message. Please try again.'
    });
    
    // Focus the input field after error
    void nextTick(() => {
      if (inputField.value && inputField.value.$el) {
        const input = inputField.value.$el.querySelector('input');
        if (input) input.focus();
      }
    });
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

// Function to stop the assistant response
function stopResponse() {
  // Clear the response timer if it exists
  if (responseTimer.value !== null) {
    window.clearTimeout(responseTimer.value);
    responseTimer.value = null;
  }
  
  // Reset processing state immediately
  isProcessing.value = false;
  
  // Focus the input field after stopping
  void nextTick(() => {
    if (inputField.value && inputField.value.$el) {
      const input = inputField.value.$el.querySelector('input');
      if (input) input.focus();
    }
  });
}

// MathJax will be loaded by the external markdownRenderer module
// We don't need to initialize it here anymore

// We're now using the external renderMarkdown function from src/misc/markdownRenderer.ts
// After rendering markdown, we need to initialize MathJax to process the math formulas

// Watch for changes to the messages and initialize MathJax when needed
watchEffect(() => {
  // When messages change, wait for the DOM to update and then initialize MathJax
  if (messages.value.length > 0) {
    void nextTick(() => {
      // Apply MathJax typesetting to all markdown content elements
      if (window.MathJax && window.MathJax.typeset) {
        try {
          window.MathJax.typeset(['.markdown-content']);
        } catch (error) {
          console.error('Error processing MathJax:', error);
        }
      }
    });
  }
});

// Additional utility functions

// Function to retry loading messages if there was an error
const retryLoadMessages = async () => {
  if (activeChat.value) {
    await chatStore.setActiveChat(activeChat.value.id);
  }
};

onMounted(() => {
  if (activeChat.value) {
    scrollToBottom();
  }
  
  // Set up scroll event listener for showing/hiding scrollbar
  const messagesEl = messagesContainer.value;
  if (messagesEl) {
    let scrollTimer: number | null = null;
    
    messagesEl.addEventListener('scroll', () => {
      // Add class while scrolling
      messagesEl.classList.add('scrolling');
      
      // Clear previous timeout
      if (scrollTimer) {
        window.clearTimeout(scrollTimer);
      }
      
      // Set timeout to remove class after scrolling stops
      scrollTimer = window.setTimeout(() => {
        messagesEl.classList.remove('scrolling');
      }, 1000); // Hide scrollbar 1 second after scrolling stops
    });
  }
  
  // Apply syntax highlighting to code blocks after DOM updates
  watchEffect(() => {
    if (messages.value.length > 0) {
      void nextTick(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      });
    }
  });
});
</script>



<style scoped>
.chat-interface {
  height: 100%;
  max-height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  position: relative;
  
  /* Always allocate space for scrollbar to prevent layout shifts */
  &::-webkit-scrollbar {
    width: 6px;
    background: transparent;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    border: none;
    margin-right: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 4px;
  }
  
  /* Only show scrollbar when actively scrolling */
  &.scrolling::-webkit-scrollbar-thumb {
    background-color: v-bind($q.dark.isActive ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)');
  }
  
  /* Firefox - allocate space but make it transparent when not scrolling */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  &.scrolling {
    scrollbar-color: v-bind($q.dark.isActive ? 'rgba(255, 255, 255, 0.5) transparent' : 'rgba(0, 0, 0, 0.2) transparent');
  }
  
  /* Add padding to ensure content doesn't shift */
  padding-right: 6px;
}

.chat-message-list {
  width: 100%;
  /* Ensure content doesn't get cut off by the scrollbar */
  padding-right: 2px;
  max-width: 750px; /* Match the chat input container max-width */
  margin: 0 auto;
}

.content-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.welcome-message {
  margin-top: 20vh;
  font-weight: 400;
  margin-bottom: 8rem;
}

.gradient-text {
  background: linear-gradient(to right, #2196f3 30%, #3f51b5 45%, #e91e63 55%, #9c27b0 65%, #2196f3 80%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.suggestion-container {
  margin-bottom: 2rem;
}

.chat-input {
  background-color: white;
  padding-bottom: 48px; /* Position input 48px from bottom */
  flex-shrink: 0; /* Prevent this from shrinking */
  transition: background-color 0.3s ease;
}

.chat-input-container {
  max-width: 750px;
  margin: 0 auto;
  position: relative;
}

.chat-prompt-input {
  border-radius: 8px; /* Less rounded corners for a more box-like shape */
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

/* Style for the input field with primary color border */
:deep(.q-field--outlined .q-field__control) {
  border-color: var(--q-primary);
}

/* Loading container styles for perfect centering */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.loading-content {
  text-align: center;
}

/* Style for the icons to match primary color */
.primary-icon {
  color: var(--q-primary);
  border-radius: 50%;
  padding: 4px;
  transition: all 0.2s ease;
}

.primary-icon:hover {
  background-color: rgba(25, 118, 210, 0.1); /* Transparent blue background on hover */
  transform: scale(1.1);
}

/* Customize the input field */
:deep(.q-field__control) {
  border-radius: 8px; /* Match the border-radius of the input */
  height: 54px; /* Increase height for more padding */
}

/* Dark mode input styling */
.dark-input {
  :deep(.q-field--outlined .q-field__control) {
    background-color: #2c2c2c !important;
    border-color: rgba(255, 255, 255, 0.7) !important;
  }
  
  :deep(.q-field--outlined.q-field--focused .q-field__control),
  :deep(.q-field--outlined.q-field--highlighted .q-field__control) {
    border-color: white !important;
    border: 2px solid white !important;
  }
  
  :deep(.q-field__native) {
    color: rgba(255, 255, 255, 0.9) !important;
  }
  
  .primary-icon {
    color: white !important;
  }
  
  .primary-icon:hover {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
}

:deep(.q-field__native) {
  padding: 12px; /* Add more padding inside the input */
}

:deep(.q-field__marginal) {
  height: 54px; /* Match the increased height */
  color: #5f6368;
  padding-right: 8px; /* Add more padding on the right side */
}

.disabled-icon {
  opacity: 0.5;
  cursor: not-allowed;
}

.stop-button {
  color: #f44336; /* Red color for stop button */
  transition: all 0.2s ease;
  background-color: rgba(244, 67, 54, 0.1); /* Very transparent red background */
  border-radius: 50%;
  padding: 4px;
}

.stop-button:hover {
  transform: scale(1.1);
  background-color: rgba(244, 67, 54, 0.2); /* Slightly more visible on hover */
}

.stop-button-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.rotating-overlay {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-top-color: rgba(244, 67, 54, 0.6); /* Semi-transparent red matching the stop button */
  animation: rotate-animation 1.5s linear infinite;
  pointer-events: none; /* Allow clicks to pass through to the button */
}

@keyframes rotate-animation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.typing-indicator {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.custom-chat-message :deep(.q-message__name) {
  color: v-bind($q.dark.isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgb(0, 0, 0)') !important;
  opacity: 0.5 !important;
}

.custom-chat-message :deep(.q-message-name) {
  color: v-bind($q.dark.isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgb(0, 0, 0)') !important;
  opacity: 0.5 !important;
}

/* Control the width of chat messages */
:deep(.q-message) {
  max-width: 85% !important; /* Prevent messages from being too wide */
}

:deep(.q-message-sent) {
  margin-left: auto; /* Align user messages to the right */
}

:deep(.q-message-received) {
  margin-right: auto; /* Align assistant messages to the left */
}

:deep(.q-message-text--received) {
  background-color: v-bind($q.dark.isActive ? 'var(--q-dark-page)' : 'white') !important;
}

/* Markdown content styling */
.markdown-content {
  line-height: 1.5;
}

.markdown-content p {
  margin-bottom: 1em;
}

.markdown-content pre {
  margin: 1em 0;
  border-radius: 6px;
  overflow: hidden;
}

.markdown-content code {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.05);
}

.markdown-content pre code {
  display: block;
  padding: 1em;
  overflow-x: auto;
  background-color: #282c34;
  color: #abb2bf;
  border-radius: 0;
}

.markdown-content ul, .markdown-content ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-content blockquote {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid #e0e0e0;
  color: #666;
}
</style>
