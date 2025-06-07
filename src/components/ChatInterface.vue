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
          <q-btn flat color="primary" label="Retry" class="q-mt-md" @click="retryLoadMessages" />
        </div>

        <!-- Empty state / Welcome screen -->
        <div v-else-if="messages.length === 0" class="text-center">
          <div class="text-h4 welcome-message gradient-text">Hello, {{ userName }}</div>

          <!-- Chat Suggestions -->
          <div class="suggestion-container q-mt-xl">
            <div class="row q-col-gutter-md justify-center">
              <div v-for="suggestion in chatSuggestions" :key="suggestion.id" class="col-auto">
                <ChatSuggestion
                  :title="suggestion.title"
                  :description="suggestion.description"
                  @select="applySuggestion(suggestion)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Chat messages -->
        <div class="chat-messages" ref="chatContainer">
          <div class="messages-container">
            <template v-for="(message, index) in messages" :key="index">
              <!-- User messages use our custom UserMessage component -->
              <user-message
                v-if="message.sender === 'user'"
                :content="message.content"
                :role="'user'"
                :message-id="message.id"
                @copied="(success) => handleMessageCopied(success)"
                @edit="handleEditMessage"
                class="q-mb-md"
              />
              <!-- Assistant messages use our new AssistantMessage component -->
              <assistant-message
                v-else
                :content="message.content"
                :role="'assistant'"
                :is-streaming="false"
                :process-diagrams="true"
                :max-height="400"
                @rendered="scrollToBottom"
                @copied="(success) => handleMessageCopied(success)"
                @liked="handleMessageLiked"
                @disliked="handleMessageDisliked"
                class="q-mb-md"
              />
            </template>

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
import { ref, computed, nextTick, onMounted, watchEffect, useCssVars } from 'vue';
import { useChatStore } from 'src/stores/chat-store';
import { useUserStore } from 'src/stores/user-store';
import AssistantMessage from './chat/AssistantMessage.vue';
import UserMessage from './chat/UserMessage.vue';
import { useQuasar } from 'quasar';
import ChatSuggestion from './ChatSuggestion.vue';
import { sendChatMessage, processStreamResponse } from 'src/services/chatService';
import { getConversationById } from 'src/services/conversationService';
import type { ChatRequest, ChatStreamResponse } from 'src/types/servicesTypes';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const chatStore = useChatStore();
const userStore = useUserStore();

// Extract reactive state from stores using storeToRefs
const {
  selectedVersion,
  isLoadingMessages,
  messageLoadError,
  conversations,
  activeChatId, // Use activeChatId instead of selectedConversationId
} = storeToRefs(chatStore);

// Local component state
const activeChat = computed(() => chatStore.activeChat());
const messages = computed(() => activeChat.value?.messages || []);
const chatSuggestions = computed(() => chatStore.chatSuggestions || []);

// Get user information from userStore
const { userSession } = storeToRefs(userStore);
const userName = computed(() => userSession.value.fullName || 'User');

// Local reactive references
const messageInput = ref('');
const isProcessing = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const chatContainer = ref<HTMLElement | null>(null);
const inputField = ref<{ $el?: HTMLElement } | null>(null);
const responseTimer = ref<number | null>(null);

function applySuggestion(suggestion: { title: string; description: string }) {
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

  // Get the selected model from the store using the reactive ref
  const model = selectedVersion.value;

  // Create a unique ID for the user message
  const userMessageId = Date.now().toString();

  // The chat store will now create a new chat if needed when we add a message
  // No need to explicitly call createNewChat()

  // Add the user message to the UI immediately
  chatStore.addMessage({
    id: userMessageId,
    content: userMessage,
    sender: 'user',
    timestamp: new Date(),
  });

  // Set the subtitle to a three-dot spinner
  if (activeChat.value) {
    activeChat.value.subtitle = '...'; // Will be displayed as three dots
  }

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
    if (activeChat.value && !/^\d+$/.test(activeChat.value.id)) {
      // This is a server-generated ID, so include it in the request
      chatRequest.conversation_id = activeChat.value.id;
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
        let assistantMessage = activeChat.value?.messages.find((m) => m.id === assistantMessageId);
        if (!assistantMessage) {
          chatStore.addMessage({
            id: assistantMessageId,
            content: fullContent, // Use the current content instead of empty string
            sender: 'assistant',
            timestamp: new Date(),
          });
          assistantMessage = activeChat.value?.messages[activeChat.value?.messages.length - 1];
        } else {
          assistantMessage.content = fullContent;

          // Manually update the subtitle in the active chat
          if (activeChat.value) {
            activeChat.value.subtitle = fullContent;
          }
        }

        // If this is the first chunk with a conversation ID, store it and update the conversation
        if (chunk.conversation_id && !conversationId) {
          conversationId = chunk.conversation_id;

          // Check if we need to update the temporary conversation ID
          if (activeChat.value && /^\d+$/.test(activeChat.value.id)) {
            const oldId = activeChat.value.id;

            // Update the conversation ID in the store
            // We need to update both the conversation object and the activeChatId
            const tempChat = conversations.value.find((c) => c.id === oldId);
            if (tempChat) {
              // Update the ID
              tempChat.id = conversationId;

              // We don't need to update message conversation_id as it's not part of our ChatMessage interface

              // Update the conversation ID in the store by calling setActiveChat
              // This will properly update the activeChatId ref
              activeChatId.value = conversationId;
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
                icon: 'mdi-alert-circle',
                message: 'Failed to load the conversation. Please try again.',
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
          icon: 'mdi-alert-circle',
          message: 'An error occurred while processing the response.',
        });
      },
    );
  } catch (error) {
    // Handle API errors
    console.error('Chat API error:', error);
    isProcessing.value = false;
    $q.notify({
      icon: 'mdi-alert-circle',
      message: 'Failed to send message. Please try again.',
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
  // Use Vue's nextTick to ensure DOM is updated before scrolling
  void nextTick(() => {
    // Use the ref directly instead of querySelector
    const chatContainerEl = chatContainer.value;
    if (chatContainerEl) {
      chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
    }
    
    // Also scroll the outer messagesContainer
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
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

/**
 * Function to retry loading messages if there was an error
 */
function retryLoadMessages() {
  if (activeChat.value) {
    void chatStore.setActiveChat(activeChat.value.id);
  }
}

/**
 * Format timestamp for display
 */
// function formatTimestamp(timestamp: Date): string {
//   return new Date(timestamp).toLocaleTimeString([], {
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// }

/**
 * Handle message copied event
 */
function handleMessageCopied(success: boolean): void {
  $q.notify({
    message: success ? 'Message copied to clipboard' : 'Failed to copy message',
    position: 'top',
    timeout: 500,
  });
}

// Handle message liked event
function handleMessageLiked(): void {
  console.log('Message liked');
  // Add any additional logic for handling liked messages
  // For example, you might want to track this in analytics or send feedback to your API
}

// Handle message disliked event
function handleMessageDisliked(): void {
  console.log('Message disliked');
  // Add any additional logic for handling disliked messages
  // For example, you might want to prompt the user for more detailed feedback
}

// Handle edit message request
function handleEditMessage(messageId: string): void {
  console.log('Edit message requested for:', messageId);
  const message = messages.value.find(
    (msg: { id: string; content: string }) => msg.id === messageId,
  );
  if (message) {
    messageInput.value = message.content;
    // Focus the input field
    void nextTick(() => {
      inputField.value?.$el?.querySelector('input')?.focus();
    });

    // Optional: You could also implement a way to update/delete the existing message
    // when the user submits the edited version
  }
}

// Define CSS variables for dark mode styling
useCssVars(() => {
  const isDark = $q.dark.isActive;
  return {
    'scrollbar-thumb-color-light': 'rgba(0, 0, 0, 0.2)',
    'scrollbar-thumb-color-dark': 'rgba(255, 255, 255, 0.5)',
    'chat-message-name-color-light': 'rgb(0, 0, 0)',
    'chat-message-name-color-dark': 'rgba(255, 255, 255, 0.9)',
    'message-received-bg-light': 'white',
    'message-received-bg-dark': 'var(--q-dark-page)',
    // Dynamic values based on dark mode
    'scrollbar-thumb-color': isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)',
    'chat-message-name-color': isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgb(0, 0, 0)',
    'message-received-bg': isDark ? 'var(--q-dark-page)' : 'white',
  };
});

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
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  position: relative;
  max-width: 900px; /* Set a max-width for better readability */
  margin: 0 auto; /* Center the messages container */
  width: 100%; /* Take full width up to max-width */
  padding: 0 16px; /* Add some padding on the sides */

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
    background-color: var(--scrollbar-thumb-color);
  }

  & {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }
  &.scrolling {
    scrollbar-color: var(--scrollbar-thumb-color) transparent;
  }

  /* Add padding to ensure content doesn't shift */
  padding-right: 6px;
}

.chat-message-list {
  width: 100%;
  /* Ensure content doesn't get cut off by the scrollbar */
  padding-right: 2px;
  max-width: 900px; /* Match the chat messages container max-width */
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
  font-weight: 800;
  margin-bottom: 8rem;
  letter-spacing: -0.05em;
}

.gradient-text {
  background: linear-gradient(135deg, #e63946, #1976d2, #ffffff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 400% 400%;
  animation: gradientBackground 15s ease infinite;
}

@keyframes gradientBackground {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.suggestion-container {
  margin-bottom: 2rem;
}

.chat-input {
  background-color: white;
  padding-bottom: 48px; /* Position input 48px from bottom */
  flex-shrink: 0; /* Prevent this from shrinking */
  transition: background-color 0.3s ease;
  max-width: 900px; /* Match the chat messages container max-width */
  margin: 0 auto; /* Center the input container */
  width: 100%; /* Take full width up to max-width */
}

.chat-input-container {
  max-width: 100%;
  position: relative;
}

.chat-prompt-input {
  border-radius: 8px; /* Less rounded corners for a more box-like shape */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
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

.chat-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.logout-btn {
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}

/* Dark mode styling for header */
.q-dark .chat-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(30, 30, 30, 0.95);
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
  color: rgba(244, 67, 54, 0.85); /* Lighter red color with opacity for stop button */
  transition: all 0.2s ease;
  border-radius: 50%;
  padding: 3px; /* Reduced from 4px */
  font-size: 0.8em; /* Make icon 20% smaller */
}

.stop-button:hover {
  transform: scale(1.1);
  color: #f44336; /* Full red color on hover */
}

.stop-button-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.rotating-overlay {
  position: absolute;
  top: -3px; /* Reduced from -4px */
  left: -3px; /* Reduced from -4px */
  right: -3px; /* Reduced from -4px */
  bottom: -3px; /* Reduced from -4px */
  border: 1.6px solid rgba(255, 255, 255, 0.2); /* Reduced from 2px */
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.custom-chat-message :deep(.q-message__name) {
  color: var(--chat-message-name-color) !important;
  opacity: 0.5 !important;
}

.custom-chat-message :deep(.q-message-name) {
  color: var(--chat-message-name-color) !important;
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
  background-color: var(--message-received-bg) !important;
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

.markdown-content ul,
.markdown-content ol {
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
