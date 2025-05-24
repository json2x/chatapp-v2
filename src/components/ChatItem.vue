<template>
  <q-item
    clickable
    v-ripple
    :active="active"
    :active-class="$q.dark.isActive ? 'bg-dark-active' : 'bg-grey-3'"
    class="chat-item q-py-sm"
    @click="$emit('select')"
  >
    <q-item-section>
      <q-item-label lines="1" class="chat-title">{{ chat.title }}</q-item-label>
      <q-item-label caption lines="1" v-if="chat.lastMessage" class="chat-preview">
        {{ chat.lastMessage }}
      </q-item-label>
    </q-item-section>

    <q-item-section side top>
      <q-item-label caption v-if="chat.timestamp" class="chat-time">
        {{ formatTime(chat.timestamp) }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { ChatSession } from 'src/stores/chat-store';
import { useQuasar } from 'quasar';

const $q = useQuasar();

defineProps<{
  chat: ChatSession;
  active: boolean;
}>();

defineEmits<{
  (e: 'select'): void;
}>();

function formatTime(date: Date): string {
  // Get today's date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Format the date based on how recent it is
  if (date.toDateString() === today.toDateString()) {
    // Today - show time only
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (date.toDateString() === yesterday.toDateString()) {
    // Yesterday
    return 'Yesterday';
  } else {
    // Other days - show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
</script>

<style scoped>
.chat-item {
  border-radius: 12px;
  margin: 3px 6px;
  padding: 10px 16px;
  transition: background-color 0.2s ease;
}

.chat-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.chat-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-preview {
  font-size: 0.8rem;
  color: #5f6368;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 0.7rem;
  color: #80868b;
  white-space: nowrap;
  text-align: right;
  min-width: 60px;
}
</style>
