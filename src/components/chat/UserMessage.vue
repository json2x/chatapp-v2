<template>
  <div class="message-container-wrapper user-message-wrapper">
    <div
      class="chat-message"
      :class="{
        'user-message': role === 'user',
        'assistant-message': role === 'assistant',
        streaming: isStreaming,
      }"
      ref="messageContainer"
    >
      <!-- Message header with role -->
      <div class="message-header justify-end">
        <!-- <div class="sender-name">{{ role === 'user' ? 'You' : 'Assistant' }}</div> -->
      </div>

      <!-- Message content -->
      <div class="message-content">
        <!-- Rendered message content -->
        <div ref="contentElement" class="rendered-content">
          {{ content }}
        </div>
      </div>

      <!-- Message footer with action buttons -->
      <div v-if="role === 'user'" class="message-footer">
        <div class="message-actions">
          <!-- Copy button -->
          <q-btn
            flat
            round
            dense
            icon="mdi-content-copy"
            size="sm"
            :color="$q.dark.isActive ? 'grey-7' : 'grey-6'"
            aria-label="Copy message"
            @click="copyMessage"
          >
            <q-tooltip>Copy message</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { copyToClipboard } from '../../utils/chatUtils';

// Component props
interface Props {
  /** Message content */
  content: string;
  /** Message sender role (user or assistant) */
  role: 'user' | 'assistant';
  /** Whether the message is currently streaming */
  isStreaming?: boolean;
  /** Message ID for editing */
  messageId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
  messageId: '',
});

// Emits
const emit = defineEmits<{
  /** Emitted when content is copied */
  (e: 'copied', success: boolean): void;
}>();

// Component state
const $q = useQuasar();
const messageContainer = ref<HTMLElement | null>(null);
const contentElement = ref<HTMLElement | null>(null);

/**
 * Copies the message content to clipboard
 */
async function copyMessage(): Promise<void> {
  try {
    const success = await copyToClipboard(props.content);
    emit('copied', success);
  } catch (error) {
    console.error('Error copying message:', error);
  }
}
</script>

<style lang="scss" scoped>
.message-container-wrapper {
  width: 100%;
  display: flex;
  margin-bottom: 1rem;

  &.user-message-wrapper {
    justify-content: flex-end;
  }
}

.chat-message {
  width: fit-content;
  max-width: 80%;
  background-color: transparent;

  &.user-message {
    padding: 0.5rem 0;
  }

  .message-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0 0.5rem;

    .sender-name {
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--q-user-name-color, rgba(0, 0, 0, 0.5));
    }
  }

  .message-content {
    position: relative;
    background-color: var(--q-user-message-content-bg, rgba(25, 118, 210, 0.1));
    border-radius: 12px;
    padding: 0.75rem 1rem;

    .rendered-content {
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.5;

      p {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
    }
  }

  // Message footer styling
  .message-footer {
    .message-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  }
}

// Dark mode adjustments
.body--dark {
  .chat-message {
    .message-content {
      background-color: var(--q-user-message-content-bg-dark, rgba(25, 118, 210, 0.2));
    }

    .message-header {
      .sender-name {
        color: var(--q-user-name-color-dark, rgba(255, 255, 255, 0.6));
      }
    }
  }

  --q-separator-color: rgba(255, 255, 255, 0.12);
  --q-action-button-color: grey-5;
}

// Light mode variables
.body--light {
  --q-user-message-content-bg: rgba(25, 118, 210, 0.1);
  --q-user-name-color: rgba(0, 0, 0, 0.5);
  --q-separator-color: rgba(0, 0, 0, 0.12);
  --q-action-button-color: grey-7;
}
</style>
