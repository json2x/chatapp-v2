import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export const useChatStore = defineStore('chat', () => {
  const currentUser = ref('World!');
  const chatSessions = ref<ChatSession[]>([
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

  const activeChatId = ref<string | null>(null);
  
  const activeChat = () => {
    if (!activeChatId.value) return null;
    return chatSessions.value.find(chat => chat.id === activeChatId.value) || null;
  };

  const setActiveChat = (chatId: string) => {
    activeChatId.value = chatId;
  };

  const createNewChat = () => {
    // Create a new empty chat session
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      messages: []
    };
    
    // Add the new chat to the beginning of the list
    chatSessions.value.unshift(newChat);
    
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

  return {
    currentUser,
    chatSessions,
    activeChatId,
    activeChat,
    setActiveChat,
    createNewChat,
    addMessage,
    chatSuggestions
  };
});
