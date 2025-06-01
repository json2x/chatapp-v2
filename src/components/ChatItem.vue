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
      <q-item-label caption lines="1" class="chat-preview">
        <template v-if="chat.subtitle === '...'">
          <q-spinner-dots size="xs" color="grey-7" class="q-mr-xs" />
        </template>
        <template v-else>
          {{ chat.subtitle || 'New conversation' }}
        </template>
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <div class="column items-center">
        <q-item-label caption v-if="chat.timestamp" class="chat-time q-mb-sm">
          {{ formatTime(chat.timestamp) }}
        </q-item-label>
        <q-icon
          name="mdi-trash-can-outline"
          color="grey-7"
          size="sm"
          class="trash-icon"
          @click.stop="$emit('delete', chat.id)"
        />
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { Conversation } from 'src/stores/chat-store';
import { useQuasar } from 'quasar';

const $q = useQuasar();

defineProps<{
  chat: Conversation;
  active: boolean;
}>();

defineEmits<{
  (e: 'select'): void;
  (e: 'delete', id: string): void;
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
  border-radius: 8px;
  margin: 2px 0;
  transition: background-color 0.2s ease;
}

.chat-title {
  font-weight: 500;
  font-size: 0.95rem;
}

.chat-preview {
  color: #5f6368;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 0.7rem;
  color: #80868b;
  white-space: nowrap;
  text-align: center;
  min-width: 60px;
}

.trash-icon {
  opacity: 0;
  transition: all 0.2s ease;
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
}

.chat-item:hover .trash-icon {
  opacity: 0.7;
}

.trash-icon:hover {
  opacity: 1 !important;
  color: #f44336 !important; /* Red/danger color */
  background-color: rgba(244, 67, 54, 0.1); /* Light red background */
  transform: scale(1.1);
}

/* Dark mode overrides */
:deep(.q-item--dark) .trash-icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
