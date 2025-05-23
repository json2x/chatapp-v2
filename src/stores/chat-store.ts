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
  const currentUser = ref('Jayson');
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
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      messages: []
    };
    
    chatSessions.value.unshift(newChat);
    activeChatId.value = newChat.id;
    return newChat;
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
    chatSuggestions
  };
});
