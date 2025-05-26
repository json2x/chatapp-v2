import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user-store';
import { getConversationById } from 'src/services/conversationService';
import { getAvailableModels } from 'src/services/modelService';
import type { Message, AvailableModels } from 'src/types/servicesTypes';
import { Loading, QSpinnerDots } from 'quasar';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export const useChatStore = defineStore('chat', () => {
  // Use the user store instead of hardcoded username
  const userStore = useUserStore();
  const currentUser = computed(() => userStore.userSession.fullName);
  const conversations = ref<Conversation[]>([
    {
      id: '1',
      title: 'Advanced Prompt: Web Site Design',
      lastMessage: 'Let me help you design a website...',
      timestamp: new Date(Date.now() - 3600000),
      messages: []
    },
    {
      id: '2',
      title: 'AI Study Assistant Logo',
      lastMessage: 'Here\'s the logo I designed for you...',
      timestamp: new Date(Date.now() - 7200000),
      messages: []
    },
    {
      id: '3',
      title: 'Three Google Cloud Vision APIs',
      lastMessage: 'Here are the three Google Cloud Vision APIs...',
      timestamp: new Date(Date.now() - 86400000),
      messages: []
    }
  ]);

  // Make activeChatId writable from outside the store
  const activeChatId = ref<string | null>(null);
  
  const activeChat = () => {
    if (!activeChatId.value) return null;
    return conversations.value.find(chat => chat.id === activeChatId.value) || null;
  };

  // Make isLoadingMessages writable from outside the store
  const isLoadingMessages = ref(false);
  const messageLoadError = ref<string | null>(null);
  
  // Model version state with localStorage caching
  const STORAGE_KEY_SELECTED_MODEL = 'chatapp_selected_model';
  
  // Initialize selectedVersion from localStorage or use default
  const getInitialSelectedVersion = (): string => {
    const savedModel = localStorage.getItem(STORAGE_KEY_SELECTED_MODEL);
    return savedModel || 'gpt-4o-mini';
  };
  
  const selectedVersion = ref(getInitialSelectedVersion());
  
  // Method to update the selected model and save to localStorage
  const updateSelectedModel = (modelValue: string) => {
    selectedVersion.value = modelValue;
    localStorage.setItem(STORAGE_KEY_SELECTED_MODEL, modelValue);
  };
  
  const versionOptions = ref([
    'gpt-4o-mini',
    'gpt-4.1-mini'
  ]);
  const availableModels = ref<AvailableModels | null>(null);
  const isLoadingModels = ref(false);
  const modelLoadError = ref<string | null>(null);

  const setActiveChat = async (chatId: string) => {
    // Set active chat ID if not already set by handleChatSelect
    if (activeChatId.value !== chatId) {
      activeChatId.value = chatId;
    }
    
    // Find the chat in our local state
    const chat = conversations.value.find(c => c.id === chatId);
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
    Loading.show({
      spinner: QSpinnerDots,
      message: 'Loading conversation...',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      messageColor: 'white',
      spinnerSize: 80,
      spinnerColor: 'primary',
      customClass: 'centered-loading'
    });
    
    try {
      // Fetch the full conversation with messages
      const fullConversation = await getConversationById(chatId);
      
      // Map the API messages to our ChatMessage format
      const mappedMessages: ChatMessage[] = fullConversation.messages.map((msg: Message) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === 'user' ? 'user' : 'assistant',
        timestamp: new Date(msg.created_at)
      }));
      
      // Update the chat with the fetched messages
      chat.messages = mappedMessages;
      
      // Update the last message if available
      if (mappedMessages.length > 0) {
        const lastMessage = mappedMessages[mappedMessages.length - 1];
        if (lastMessage) {
          chat.lastMessage = lastMessage.content;
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
    // Create a new empty conversation
    const newChat: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      messages: []
    };
    
    // Add the new chat to the beginning of the list
    conversations.value.unshift(newChat);
    
    // Set it as the active chat
    activeChatId.value = newChat.id;
    
    return newChat;
  };
  
  const addMessage = (message: ChatMessage) => {
    const chat = activeChat();
    if (!chat) return;
    
    // Add message to the current chat
    chat.messages.push(message);
    
    // Update the last message and timestamp
    chat.lastMessage = message.content;
    chat.timestamp = message.timestamp;
    
    // If this is the first message in a new chat, update the title
    if (chat.messages.length === 1 && chat.title === 'New Chat' && message.sender === 'user') {
      // Use the first few words of the message as the title (up to 5 words)
      const words = message.content.split(' ');
      const titleWords = words.slice(0, Math.min(5, words.length));
      chat.title = titleWords.join(' ') + (words.length > 5 ? '...' : '');
    }
  };

  const chatSuggestions = ref([
    { 
      id: '1', 
      title: 'Write a screenplay',
      description: 'for a Chemistry 101 video'
    },
    { 
      id: '2', 
      title: 'Write requirements for',
      description: 'a Fitness tracking app'
    },
    { 
      id: '3', 
      title: 'Design an interactive',
      description: 'kaleidoscope'
    }
  ]);

  /**
   * Removes a conversation from the store by ID
   * @param conversationId The ID of the conversation to remove
   */
  const removeConversation = (conversationId: string) => {
    // Find the index of the conversation to remove
    const index = conversations.value.findIndex(c => c.id === conversationId);
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
      // This is a placeholder - you might want to format these differently
      // based on your actual API response structure
      if (models) {
        const modelOptions: string[] = [];
        
        // Extract model names from the API response without provider prefix
        // The API returns a structure like { openai: ["gpt-4", "gpt-3.5-turbo"], anthropic: ["claude-3"] }
        Object.entries(models).forEach(([, providerModels]) => {
          if (providerModels) {
            providerModels.forEach(model => {
              // Just add the model name without the provider prefix
              modelOptions.push(model);
            });
          }
        });
        
        // Only update if we got some models
        if (modelOptions.length > 0) {
          versionOptions.value = modelOptions;
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
    updateSelectedModel
  };
});
