import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user-store';
import { getConversationById } from 'src/services/conversationService';
import { getAvailableModels } from 'src/services/modelService';
import type { Message, AvailableModels } from 'src/types/servicesTypes';
import { Loading } from 'quasar';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export const useChatStore = defineStore('chat', () => {
  // Use the user store instead of hardcoded username
  const userStore = useUserStore();
  const currentUser = computed(() => userStore.userSession.fullName);
  const conversations = ref<Conversation[]>([]);

  // Make activeChatId writable from outside the store
  const activeChatId = ref<string | null>(null);

  const activeChat = () => {
    if (!activeChatId.value) return null;
    return conversations.value.find((chat) => chat.id === activeChatId.value) || null;
  };

  // Make isLoadingMessages writable from outside the store
  const isLoadingMessages = ref(false);
  const messageLoadError = ref<string | null>(null);

  // Model version state with localStorage caching
  const STORAGE_KEY_SELECTED_MODEL = 'chatapp_selected_model';

  // Initialize selectedVersion from localStorage or use default
  const getInitialSelectedVersion = (): string => {
    const savedModel = localStorage.getItem(STORAGE_KEY_SELECTED_MODEL);
    return savedModel || '';
  };

  const selectedVersion = ref(getInitialSelectedVersion());

  // Method to update the selected model and save to localStorage
  const updateSelectedModel = (modelValue: string) => {
    selectedVersion.value = modelValue;
    localStorage.setItem(STORAGE_KEY_SELECTED_MODEL, modelValue);
  };

  const versionOptions = ref<string[]>([]);
  const availableModels = ref<AvailableModels | null>(null);
  const isLoadingModels = ref(false);
  const modelLoadError = ref<string | null>(null);

  const setActiveChat = async (chatId: string) => {
    // Set active chat ID if not already set by handleChatSelect
    if (activeChatId.value !== chatId) {
      activeChatId.value = chatId;
    }

    // Find the chat in our local state
    const chat = conversations.value.find((c) => c.id === chatId);
    if (!chat) return;

    // If the chat already has messages, don't fetch them again
    if (chat.messages && chat.messages.length > 0) {
      isLoadingMessages.value = false; // Ensure loading is turned off
      return;
    }

    // Show loading indicator if not already set by handleChatSelect
    if (!isLoadingMessages.value) {
      isLoadingMessages.value = true;
    }
    messageLoadError.value = null;

    // Show Quasar loading overlay with centered content
    // Loading.show({
    //   spinner: QSpinnerDots,
    //   message: 'Loading conversation...',
    //   backgroundColor: 'rgba(0, 0, 0, 0.4)',
    //   messageColor: 'white',
    //   spinnerSize: 80,
    //   spinnerColor: 'primary',
    //   customClass: 'centered-loading',
    // });

    try {
      // Fetch the full conversation with messages
      const fullConversation = await getConversationById(chatId);

      // Map the API messages to our ChatMessage format
      const mappedMessages: ChatMessage[] = fullConversation.messages.map((msg: Message) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === 'user' ? 'user' : 'assistant',
        timestamp: new Date(msg.created_at),
      }));

      // Update the chat with the fetched messages
      chat.messages = mappedMessages;

      // Update the last message if available
      if (mappedMessages.length > 0) {
        const lastMessage = mappedMessages[mappedMessages.length - 1];
        if (lastMessage) {
          chat.subtitle = lastMessage.content;
          chat.timestamp = lastMessage.timestamp;
        }
      }
    } catch (error) {
      console.error(`Error fetching messages for conversation ${chatId}:`, error);
      messageLoadError.value = 'Failed to load messages. Please try again.';
    } finally {
      isLoadingMessages.value = false;
      Loading.hide();
    }
  };

  const createNewChat = () => {
    // Instead of creating a new conversation, just unset the active conversation
    // This will clear the chat interface
    activeChatId.value = null;

    return null;
  };

  const addMessage = (message: ChatMessage) => {
    let chat = activeChat();

    // If there's no active chat, create a new one
    if (!chat) {
      // Create a new conversation
      const newChat: Conversation = {
        id: Date.now().toString(),
        title: 'New Chat',
        subtitle: 'New conversation',
        timestamp: new Date(),
        messages: [],
      };

      // Add the new chat to the beginning of the list
      conversations.value.unshift(newChat);

      // Set it as the active chat
      activeChatId.value = newChat.id;

      // Update our local reference
      chat = newChat;
    }

    // Add message to the current chat
    chat.messages.push(message);

    // Update the last message and timestamp
    chat.subtitle = message.content;
    chat.timestamp = message.timestamp;

    // If this is the first message in a new chat, update the title
    if (chat.messages.length === 1 && chat.title === 'New Chat' && message.sender === 'user') {
      // Use the first few words of the message as the title (up to 5 words)
      const words = message.content.split(' ');
      const titleWords = words.slice(0, Math.min(5, words.length));
      chat.title = titleWords.join(' ') + (words.length > 5 ? '...' : '');
    }

    // Message successfully added to chat
  };

  const chatSuggestions = ref([
    {
      id: '1',
      title: 'Write a screenplay',
      description: 'for a Chemistry 101 video',
    },
    {
      id: '2',
      title: 'Write requirements for',
      description: 'a Fitness tracking app',
    },
    {
      id: '3',
      title: 'Design an interactive',
      description: 'kaleidoscope',
    },
  ]);

  /**
   * Removes a conversation from the store by ID
   * @param conversationId The ID of the conversation to remove
   */
  const removeConversation = (conversationId: string) => {
    // Find the index of the conversation to remove
    const index = conversations.value.findIndex((c) => c.id === conversationId);
    if (index !== -1) {
      // Remove the conversation from the array
      conversations.value.splice(index, 1);
    }
  };

  /**
   * Fetches available models from the API and updates the store
   * This populates the versionOptions array with actual model data
   */
  const fetchAvailableModels = async () => {
    isLoadingModels.value = true;
    modelLoadError.value = null;

    try {
      // Fetch available models from the API
      const models = await getAvailableModels();
      availableModels.value = models;

      // Update version options based on available models
      if (models) {
        const modelOptions: string[] = [];

        // Extract model names from the API response without provider prefix
        // The API returns a structure like { openai: ["gpt-4", "gpt-3.5-turbo"], anthropic: ["claude-3"] }
        Object.entries(models).forEach(([, providerModels]) => {
          if (providerModels) {
            providerModels.forEach((model) => {
              // Just add the model name without the provider prefix
              modelOptions.push(model);
            });
          }
        });

        // Only update if we got some models
        if (modelOptions.length > 0) {
          versionOptions.value = modelOptions;

          // Check if we need to set a default model
          // Only set if there's no cached model selection
          const savedModel = localStorage.getItem(STORAGE_KEY_SELECTED_MODEL);
          if (!savedModel || !selectedVersion.value) {
            // Try to set gpt-4o-mini as default if available
            const gpt4oMiniIndex = modelOptions.findIndex((model) =>
              model.toLowerCase().includes('gpt-4o-mini'),
            );

            if (gpt4oMiniIndex >= 0 && modelOptions[gpt4oMiniIndex]) {
              // gpt-4o-mini is available, set it as default
              const defaultModel = modelOptions[gpt4oMiniIndex];
              if (defaultModel) {
                // Extra check to ensure it's not undefined
                updateSelectedModel(defaultModel);
              }
            } else if (modelOptions.length > 0 && modelOptions[0]) {
              // Otherwise use the first model in the list
              const firstModel = modelOptions[0];
              if (firstModel) {
                // Extra check to ensure it's not undefined
                updateSelectedModel(firstModel);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching available models:', error);
      modelLoadError.value = 'Failed to load available models';
    } finally {
      isLoadingModels.value = false;
    }
  };

  return {
    currentUser,
    conversations,
    chatSessions: conversations, // For backward compatibility
    activeChatId,
    activeChat,
    setActiveChat,
    createNewChat,
    addMessage,
    removeConversation,
    chatSuggestions,
    isLoadingMessages,
    messageLoadError,
    // Model version state
    selectedVersion,
    versionOptions,
    availableModels,
    isLoadingModels,
    modelLoadError,
    fetchAvailableModels,
    updateSelectedModel,
  };
});
