<template>
  <div class="enhanced-message-input">
    <div class="message-input-container q-pa-sm q-mb-sm rounded-borders" :class="{ 'is-processing': isProcessing, 'near-limit': isNearCharacterLimit }"
    >
    <!-- Main text input area -->
    <div class="auto-expand-textarea-wrapper" :class="{ 'has-content': messageState.text.length > 0 }">
      <textarea
        v-model="messageState.text"
        placeholder="Type your message..."
        class="auto-expand-textarea"
        :class="{
          'dark-input': $q.dark.isActive,
          'large-text': messageState.text.length > LARGE_TEXT_THRESHOLD,
          'near-limit': isNearCharacterLimit
        }"
        :maxlength="MAX_CHARACTER_LIMIT"
        @input="adjustTextareaHeight"
        @keydown="handleKeydown"
        ref="textareaField"
      ></textarea>
      
      <!-- Hidden div to calculate height -->
      <div 
        class="height-calculator" 
        :class="{'large-text': messageState.text.length > LARGE_TEXT_THRESHOLD}"
        ref="heightCalculator"
      >{{ messageState.text + '\n' }}</div>
      
      <!-- Character counter -->
      <div 
        v-if="messageState.text.length > 0" 
        class="character-counter" 
        :class="{ 'near-limit': isNearCharacterLimit }"
      >
        {{ messageState.text.length }}/{{ MAX_CHARACTER_LIMIT }}
      </div>
      <!-- Action buttons -->
      <div class="action-buttons">
        <!-- File attachment button -->
        <q-btn
          v-if="!isProcessing"
          round
          flat
          icon="mdi-attachment"
          size="sm"
          class="primary-icon"
          @click="openFileSelector"
        >
          <q-tooltip>Attach file</q-tooltip>
        </q-btn>
        
        <!-- Send button -->
        <q-btn
          v-if="!isProcessing && messageState.text.trim().length > 0"
          round
          flat
          icon="mdi-send"
          size="sm"
          class="primary-icon"
          @click="sendMessage"
        >
          <q-tooltip>Send message</q-tooltip>
        </q-btn>
        
        <!-- Processing indicator -->
        <div v-if="isProcessing" class="stop-button-container">
          <q-btn
            round
            flat
            icon="mdi-stop"
            size="sm"
            class="stop-button"
            @click="stopProcessing"
          >
            <q-tooltip>Stop generating</q-tooltip>
          </q-btn>
          <div class="rotating-overlay"></div>
        </div>
      </div>
    </div>
    </div>
    
    <!-- File attachments preview area -->
    <div v-if="messageState.attachments.length > 0" class="attachments-preview q-mt-sm">
    <div class="row q-col-gutter-sm">
      <div 
        v-for="(file, index) in messageState.attachments" 
        :key="index"
        class="col-auto attachment-item"
      >
        <q-chip
          removable
          @remove="removeAttachment(index)"
          :color="getFileColor(file)"
          text-color="white"
        >
          <q-icon :name="getFileIcon(file)" left />
          {{ file.name }}
          <template v-if="file.size">
            ({{ formatFileSize(file.size) }})
          </template>
        </q-chip>
      </div>
    </div>
    </div>
    
    <!-- Hidden file input -->
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      :accept="SUPPORTED_FILE_TYPES.join(',')"
      style="display: none"
      multiple
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue';
import { useQuasar } from 'quasar';

// Configuration constants
const MAX_CHARACTER_LIMIT = 4000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const LARGE_TEXT_THRESHOLD = 2000;
const SUPPORTED_FILE_TYPES = ['image/*', 'text/*', '.pdf', '.doc', '.docx'];

// Component props
interface Props {
  /** Whether a message is currently being processed */
  isProcessing?: boolean;
  /** Initial text value */
  initialText?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum number of attachments allowed */
  maxAttachments?: number;
}

// Component emits
interface Emits {
  /** Emitted when a message is sent */
  (e: 'send', message: MessageData): void;
  /** Emitted when processing should be stopped */
  (e: 'stop'): void;
  /** Emitted when files are attached */
  (e: 'files-attached', files: File[]): void;
  /** Emitted when files are removed */
  (e: 'files-removed', fileIndex: number): void;
}

// Message data interface
interface MessageData {
  text: string;
  attachments: File[];
}

// Message state interface
interface MessageState {
  text: string;
  attachments: File[];
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  isProcessing: false,
  initialText: '',
  placeholder: 'Type your message...',
  maxAttachments: 5
});

// Define emits
const emit = defineEmits<Emits>();

// Component state
const $q = useQuasar();
const textareaField = ref<HTMLTextAreaElement | null>(null);
const heightCalculator = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Textarea configuration
const MIN_TEXTAREA_HEIGHT = 54; // Minimum height in pixels
const MAX_TEXTAREA_HEIGHT = 200; // Maximum height in pixels

// Reactive message state
const messageState = reactive<MessageState>({
  text: props.initialText,
  attachments: []
});

// Initialize textarea height on mount
onMounted(() => {
  // Always initialize the textarea height, even if empty
  void nextTick(() => adjustTextareaHeight());
  
  // Set focus to the textarea if needed
  if (props.initialText) {
    void nextTick(() => {
      if (textareaField.value) {
        textareaField.value.focus();
      }
    });
  }
});

// Computed properties
const isNearCharacterLimit = computed<boolean>(() => {
  const length = messageState.text.length;
  const threshold = MAX_CHARACTER_LIMIT * 0.9; // 90% of max limit
  return length > threshold;
});

const canSendMessage = computed(() => {
  return messageState.text.trim().length > 0 || messageState.attachments.length > 0;
});

/**
 * Send the message
 */
function sendMessage(): void {
  if (!canSendMessage.value) return;
  
  // Trim the message text but preserve internal whitespace
  const trimmedText = messageState.text.replace(/^\s+|\s+$/g, '');
  
  const messageData: MessageData = {
    text: trimmedText,
    attachments: [...messageState.attachments]
  };
  
  emit('send', messageData);
  resetMessageState();
  
  // Focus back to the textarea after sending
  void nextTick(() => {
    if (textareaField.value) {
      textareaField.value.focus();
    }
  });
}

/**
 * Reset the message state
 */
function resetMessageState(): void {
  messageState.text = '';
  messageState.attachments = [];
  void nextTick(() => {
    adjustTextareaHeight();
    // Update the file input value if it exists
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  });
}

/**
 * Add a new line to the message
 */
function addNewLine(): void {
  messageState.text += '\n';
  void nextTick(() => adjustTextareaHeight());
}

/**
 * Adjust the height of the textarea based on content
 */
function adjustTextareaHeight(): void {
  if (!textareaField.value || !heightCalculator.value) return;
  
  // Reset height to auto to get the correct scrollHeight
  textareaField.value.style.height = 'auto';
  
  // Get the calculated height from our hidden div
  const calculatedHeight = heightCalculator.value.offsetHeight;
  
  // Apply height constraints
  const newHeight = Math.min(Math.max(calculatedHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);
  textareaField.value.style.height = `${newHeight}px`;
  
  // Add scrollbar if content exceeds max height
  textareaField.value.style.overflowY = calculatedHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  
  // Ensure cursor position is maintained after height change
  const selectionStart = textareaField.value.selectionStart;
  const selectionEnd = textareaField.value.selectionEnd;
  textareaField.value.setSelectionRange(selectionStart, selectionEnd);
}

/**
 * Stop the current processing
 */
function stopProcessing(): void {
  emit('stop');
}

/**
 * Open the file selector dialog
 */
function openFileSelector(): void {
  if (messageState.attachments.length >= props.maxAttachments) {
    alert(`Maximum ${props.maxAttachments} attachments allowed`);
    return;
  }
  
  if (fileInput.value) {
    fileInput.value.click();
  }
}

/**
 * Handle file selection from the file input
 */
function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const files = Array.from(target.files);
  const validFiles: File[] = [];
  
  // Validate files
  files.forEach(file => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      $q.notify({
        message: `File ${file.name} exceeds the maximum size limit of ${formatFileSize(MAX_FILE_SIZE)}`,
        color: 'negative'
      });
      return;
    }
    
    // Check if we've reached the maximum attachments
    if (messageState.attachments.length + validFiles.length >= props.maxAttachments) {
      $q.notify({
        message: `Maximum ${props.maxAttachments} attachments allowed`,
        color: 'negative'
      });
      return;
    }
    
    validFiles.push(file);
  });
  
  // Add valid files to attachments
  if (validFiles.length > 0) {
    messageState.attachments.push(...validFiles);
    emit('files-attached', validFiles);
  }
  
  // Reset the file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  
  // Adjust textarea height after adding attachments
  void nextTick(() => adjustTextareaHeight());
}

/**
 * Remove an attachment by index
 */
function removeAttachment(index: number): void {
  if (index >= 0 && index < messageState.attachments.length) {
    messageState.attachments.splice(index, 1);
    emit('files-removed', index);
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Get appropriate icon for file type
 */
function getFileIcon(file: File): string {
  if (file.type.startsWith('image/')) return 'mdi-image';
  if (file.type.startsWith('text/')) return 'mdi-file-document';
  if (file.type.includes('pdf')) return 'mdi-file-pdf';
  if (file.type.includes('doc')) return 'mdi-file-word';
  return 'mdi-file';
}

/**
 * Get appropriate color for file type
 */
function getFileColor(file: File): string {
  if (file.type.startsWith('image/')) return 'green';
  if (file.type.startsWith('text/')) return 'blue';
  if (file.type.includes('pdf')) return 'red';
  if (file.type.includes('doc')) return 'indigo';
  return 'grey';
}

// Keyboard event handlers
function handleKeydown(event: KeyboardEvent): void {
  // Enter to send message (not when shift is pressed)
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    sendMessage();
  }
  
  // Ctrl+Enter or Cmd+Enter to add new line
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    addNewLine();
  }
  
  // Escape to clear input or stop processing
  if (event.key === 'Escape') {
    if (props.isProcessing) {
      event.preventDefault();
      emit('stop');
    } else if (messageState.text.length > 0 || messageState.attachments.length > 0) {
      event.preventDefault();
      if (window.confirm('Clear message input?')) {
        resetMessageState();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.enhanced-message-input {
  width: 100%;
  
  .message-input-container {
    width: 100%;
    background-color: #ffffff; // Ensure light background in light mode
  }
  
  .input-container {
    position: relative;
  }
  
  .auto-expand-textarea-wrapper {
    position: relative;
    width: 100%;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.24);
    background-color: white;
    transition: border 0.2s ease;
    
    &:focus-within {
      border: 2px solid var(--q-primary);
    }
    
    &.has-content {
      padding-bottom: 24px; // Make room for character counter
    }
    
    // Auto-expanding textarea
    .auto-expand-textarea {
      display: block;
      width: 100%;
      min-height: 54px;
      padding: 12px 40px 12px 12px; // Add right padding for buttons
      border: none;
      outline: none;
      resize: none;
      line-height: 1.5;
      font-family: inherit;
      font-size: inherit;
      color: rgba(0, 0, 0, 0.87); // Ensure visible text in light mode
      background-color: transparent;
      overflow-y: hidden;
      transition: height 0.2s ease, background-color 0.2s ease;
      
      &::placeholder {
        color: rgba(0, 0, 0, 0.6);
      }
      
      // Large text mode
      &.large-text {
        font-size: 0.9em;
      }
      
      &.near-limit {
        caret-color: #f44336;
      }
    }
    
    // Height calculator for auto-expanding textarea
  .height-calculator {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    padding: 12px 40px 12px 12px; // Match textarea padding
    line-height: 1.5;
    
    &.large-text {
      font-size: 0.9em;
    }
  }
    
    // Character counter
    .character-counter {
      position: absolute;
      bottom: 4px;
      right: 12px;
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.6);
      transition: color 0.3s ease;
      padding: 2px 6px;
      border-radius: 10px;
      
      &.near-limit {
        color: #ffffff;
        font-weight: bold;
        background-color: rgba(244, 67, 54, 0.7);
      }
    }
    
    // Action buttons container
    .action-buttons {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
      z-index: 2;
    }
  }
  
  // Dark mode styling
  .dark-input {
    background-color: transparent !important;
    color: rgba(255, 255, 255, 0.9) !important;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5) !important;
    }
  }
  
  // Light mode styling
  .auto-expand-textarea:not(.dark-input) {
    color: rgba(0, 0, 0, 0.87) !important;
  }
  
  // Action button styling
  .primary-icon {
    color: var(--q-primary);
    border-radius: 50%;
    padding: 4px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(25, 118, 210, 0.1);
      transform: scale(1.1);
    }
  }
  
  // Stop button styling
  .stop-button-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .stop-button {
    color: rgba(244, 67, 54, 0.85);
    transition: all 0.2s ease;
    border-radius: 50%;
    padding: 3px;
    font-size: 0.8em;
    
    &:hover {
      transform: scale(1.1);
      color: #f44336;
    }
  }
  
  .rotating-overlay {
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border: 1.6px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    border-top-color: rgba(244, 67, 54, 0.6);
    animation: rotate-animation 1.5s linear infinite;
    pointer-events: none;
  }
  
  @keyframes rotate-animation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  // Attachments area styling
  .attachments-preview {
    margin-top: 8px;
    
    .attachment-item {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }
}

// Dark mode styles
.body--dark .enhanced-message-input {
  --q-separator-color: rgba(255, 255, 255, 0.12);
  --q-action-button-color: grey-5;
  
  .message-input-container {
    background-color: #1d1d1d;
    border: 1px solid #333;
    
    .auto-expand-textarea {
      color: #fff;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
    }
    
    .character-counter {
      color: rgba(255, 255, 255, 0.6);
      
      &.near-limit {
        background-color: rgba(244, 67, 54, 0.7);
        color: #ffffff;
      }
    }
    
    &.near-limit .auto-expand-textarea {
      background-color: rgba(244, 67, 54, 0.05);
    }
    
    &:focus-within {
      border-color: var(--q-primary);
    }
  }
  
  .attachments-preview {
    background-color: #2d2d2d;
  }
}

// Light mode variables
.body--light .enhanced-message-input {
  --q-separator-color: rgba(0, 0, 0, 0.12);
  --q-action-button-color: grey-7;
  
  .message-input-container {
    background-color: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.12);
  }
}

// Near limit styles for light mode
.message-input-container.near-limit .auto-expand-textarea {
  background-color: rgba(244, 67, 54, 0.05);
  transition: background-color 0.3s ease;
}
</style>
