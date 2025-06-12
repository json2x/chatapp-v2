<template>
  <div
    class="enhanced-message-input"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleFileDrop"
  >
    <!-- Drag overlay -->
    <div v-if="isDraggingFile" class="drag-overlay flex flex-center">
      <div class="drag-content text-center">
        <q-icon name="mdi-file-upload" size="48px" color="primary" />
        <div class="text-h6 q-mt-sm">Drop files to attach</div>
        <div class="text-caption">Maximum {{ props.maxAttachments }} files</div>
      </div>
    </div>

    <div
      class="message-input-container q-pa-sm q-mb-sm q-dark-box"
      :class="{
        'is-processing': isProcessing,
        'near-limit': isNearCharacterLimit,
        'drag-active': isDraggingFile,
      }"
    >
      <!-- Main text input area -->
      <div
        class="auto-expand-textarea-wrapper"
        :class="{ 'has-content': messageState.text.length > 0 }"
      >
        <textarea
          v-model="messageState.text"
          placeholder="Type your message..."
          class="auto-expand-textarea"
          :class="{
            'dark-input': $q.dark.isActive,
            'large-text': messageState.text.length > LARGE_TEXT_THRESHOLD,
            'near-limit': isNearCharacterLimit,
          }"
          :maxlength="MAX_CHARACTER_LIMIT"
          @input="adjustTextareaHeight"
          @keydown="handleKeydown"
          ref="textareaField"
        ></textarea>

        <!-- Hidden div to calculate height -->
        <div
          class="height-calculator"
          :class="{ 'large-text': messageState.text.length > LARGE_TEXT_THRESHOLD }"
          ref="heightCalculator"
        >
          {{ messageState.text + '\n' }}
        </div>

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
            v-if="!isProcessing"
            round
            flat
            icon="mdi-send"
            size="sm"
            class="primary-icon"
            @click="sendMessage"
            :disable="!canSendMessage || isProcessing"
            :loading="isProcessing"
          >
            <q-tooltip>Send message</q-tooltip>
          </q-btn>

          <!-- Processing indicator -->
          <div v-if="isProcessing" class="stop-button-container">
            <q-btn round flat icon="mdi-stop" size="sm" class="stop-button" @click="stopProcessing">
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
          <!-- File preview card -->
          <q-card class="file-preview-card" bordered flat>
            <!-- Preview content -->
            <div class="file-preview-content" @click="openFilePreview(file)">
              <!-- Image preview -->
              <div v-if="isImageFile(file)" class="image-preview">
                <img :src="getFilePreviewUrl(file)" :alt="file.name" class="preview-image" />
              </div>
              
              <!-- Text file preview -->
              <div v-else-if="isTextFile(file)" class="text-preview">
                <div class="text-preview-content" v-html="getTextPreview(file)"></div>
              </div>
              
              <!-- Document/generic file preview -->
              <div v-else class="document-preview">
                <q-icon :name="getFileIcon(file)" size="24px" :color="getFileColor(file)" />
              </div>
            </div>
            
            <!-- File info footer -->
            <q-card-section class="file-info q-pa-xs">
              <div class="file-name text-weight-medium">{{ truncateFilename(file.name, 10) }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <q-btn
                  round
                  flat
                  dense
                  icon="mdi-close"
                  size="xs"
                  class="remove-btn"
                  @click="removeAttachment(index)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      
      <!-- Preview modal for larger view -->
      <q-dialog v-model="previewModalOpen" maximized>
        <q-card class="preview-modal-card">
          <q-card-section class="preview-modal-header row items-center q-pb-none">
            <div class="text-h6">{{ currentPreviewFile ? currentPreviewFile.name : '' }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          
          <q-card-section class="preview-modal-content">
            <!-- Image preview -->
            <div v-if="currentPreviewFile && isImageFile(currentPreviewFile)" class="full-image-preview">
              <img :src="getFilePreviewUrl(currentPreviewFile)" :alt="currentPreviewFile.name" class="full-preview-image" />
            </div>
            
            <!-- Text preview -->
            <div v-else-if="currentPreviewFile && isTextFile(currentPreviewFile)" class="full-text-preview">
              <pre class="text-content">{{ filePreviewContent }}</pre>
            </div>
            
            <!-- Document/generic preview -->
            <div v-else class="full-document-preview">
              <div class="document-icon-container">
                <q-icon 
                  :name="currentPreviewFile ? getFileIcon(currentPreviewFile) : 'mdi-file'" 
                  size="128px" 
                  :color="currentPreviewFile ? getFileColor(currentPreviewFile) : 'grey'" 
                />
              </div>
              <div class="text-center q-mt-md">
                <p>Preview not available for this file type</p>
                <p v-if="currentPreviewFile" class="text-caption">{{ currentPreviewFile.type || 'Unknown type' }}</p>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
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
import { ref, computed, reactive, nextTick, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useDraftPersistence } from '../../composables/useDraftPersistence';

// Configuration constants
const MAX_CHARACTER_LIMIT = 4000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const LARGE_TEXT_THRESHOLD = 2000;
const SUPPORTED_FILE_TYPES = [
  'image/*',
  'text/*',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
];

// File validation error types
const FILE_ERROR_TYPE = {
  SIZE: 'size',
  TYPE: 'type',
  LIMIT: 'limit',
  GENERIC: 'generic',
} as const;

// Default file type to icon mapping
const DEFAULT_FILE_TYPE_ICONS = {
  'image/': 'mdi-image',
  'text/': 'mdi-file-document',
  'application/pdf': 'mdi-file-pdf-box',
  'application/msword': 'mdi-file-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'mdi-file-word',
  'application/vnd.ms-excel': 'mdi-file-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'mdi-file-excel',
  'video/': 'mdi-video',
  'audio/': 'mdi-music',
  default: 'mdi-file',
} as const;

// Default file type to color mapping
const DEFAULT_FILE_TYPE_COLORS = {
  'image/': 'orange-8',
  'text/': 'grey',
  'application/pdf': 'red',
  'application/msword': 'blue-6',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'blue-6',
  'application/vnd.ms-excel': 'green-8',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'green-8',
  'video/': 'purple-8',
  'audio/': 'purple-8',
  default: 'grey',
} as const;

// Component props
interface Props {
  /** Whether a message is currently being processed */
  isProcessing?: boolean;
  /** Initial text to populate the input with */
  initialText?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Maximum number of attachments allowed */
  maxAttachments?: number;
  /** Session ID for draft persistence */
  sessionId?: string;
  /** Whether to enable draft persistence */
  enableDraftPersistence?: boolean;
  /** Custom file type to icon mapping */
  fileTypeIcons?: Record<string, string>;
  /** Custom file type to color mapping */
  fileTypeColors?: Record<string, string>;
}

// Component emits
interface Emits {
  /** Emitted when a message is sent */
  (event: 'send', message: MessageData): void;
  /** Emitted when processing should be stopped */
  (event: 'stop'): void;
  /** Emitted when files are attached */
  (event: 'files-attached', files: File[]): void;
  /** Emitted when files are removed */
  (event: 'files-removed', fileIndex: number): void;
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

// File error interface
interface FileError {
  file: string;
  type: string;
  message: string;
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  isProcessing: false,
  initialText: '',
  placeholder: 'Type your message...',
  maxAttachments: 5,
  sessionId: 'default',
  enableDraftPersistence: true,
});

// Define emits
const emit = defineEmits<Emits>();

// Component state
const $q = useQuasar();
const textareaField = ref<HTMLTextAreaElement | null>(null);
const heightCalculator = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isDraggingFile = ref(false);
const dragCounter = ref(0); // Counter to handle nested drag events
const fileErrors = ref<FileError[]>([]);
const previewModalOpen = ref(false);
const currentPreviewFile = ref<File | null>(null);
const filePreviewContent = ref('');
// Track last drag target and timestamp to prevent flickering and improve drag detection
const lastDragTarget = ref<EventTarget | null>(null);
const lastDragTime = ref<number>(0);

// Textarea configuration
const MIN_TEXTAREA_HEIGHT = 54; // Minimum height in pixels
const MAX_TEXTAREA_HEIGHT = 200; // Maximum height in pixels

// Draft persistence system
const { draftText, saveDraft, loadDraft, clearDraft, startAutoSave } = useDraftPersistence({
  sessionId: props.sessionId,
  autoSaveInterval: 2000,
  onError: (error) => {
    console.error('Draft persistence error:', error);
    $q.notify({
      message: 'Failed to save draft message',
      color: 'negative',
      icon: 'warning',
    });
  },
});

// Load saved draft if available
const savedDraft = props.enableDraftPersistence ? loadDraft() : { text: '' };

// Reactive message state
const messageState = reactive<MessageState>({
  text: props.initialText || savedDraft.text || '',
  attachments: [],
});

// Set up draft auto-saving
if (props.enableDraftPersistence) {
  // Initialize draft text with current message text
  draftText.value = messageState.text;

  // Start auto-save process
  startAutoSave(messageState.text);
}

// Initialize textarea height on mount
onMounted(() => {
  // Always initialize the textarea height, even if empty
  void nextTick(() => adjustTextareaHeight());

  // Set focus to the textarea if needed
  if (messageState.text) {
    void nextTick(() => {
      if (textareaField.value) {
        textareaField.value.focus();
      }
    });
  }
});

/**
 * Save current draft with text and attachments
 */
function saveCurrentDraft(): void {
  if (!props.enableDraftPersistence) return;

  const attachmentsMeta = messageState.attachments.map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
  }));

  saveDraft(messageState.text, attachmentsMeta);
}

// Watch for changes to update draft text
watch(
  () => messageState.text,
  (newText) => {
    if (props.enableDraftPersistence) {
      draftText.value = newText;
      saveCurrentDraft();
    }
  },
);

// Watch for changes to attachments
watch(
  () => messageState.attachments.length,
  () => {
    if (props.enableDraftPersistence) {
      saveCurrentDraft();
    }
  },
);

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
 * Validates message content before sending
 * Handles the loading state during send
 * Clears draft after successful send
 */
function sendMessage(): void {
  // Validate message before sending
  if (!canSendMessage.value || props.isProcessing) return;

  // Trim the message text but preserve internal whitespace
  const trimmedText = messageState.text.replace(/^\s+|\s+$/g, '');

  // Create message data object
  const messageData: MessageData = {
    text: trimmedText,
    attachments: [...messageState.attachments],
  };

  // Emit the send event with message data
  emit('send', messageData);

  // Clear draft from localStorage after successful send
  if (props.enableDraftPersistence) {
    clearDraft();
  }

  // Reset message state
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

  // Update draft text if persistence is enabled
  if (props.enableDraftPersistence) {
    draftText.value = '';
  }

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
 * Handle drag enter event
 */
function handleDragEnter(event: DragEvent): void {
  // Always prevent default to stop browser from opening the file
  event.preventDefault();
  event.stopPropagation();
  
  // Save the current target as the last drag target
  lastDragTarget.value = event.target;
  
  // Increment drag counter to handle nested elements
  dragCounter.value++;
  
  // Update timestamp to track recent drag activity
  lastDragTime.value = Date.now();
  
  // Check if the dragged items contain files
  if (event.dataTransfer?.types.includes('Files')) {
    isDraggingFile.value = true;
  }
}

/**
 * Handle file drag over event
 */
function handleDragOver(event: DragEvent): void {
  // Always prevent default to stop browser from opening the file
  event.preventDefault();
  event.stopPropagation();
  
  // Update timestamp to prevent flickering
  lastDragTime.value = Date.now();
  
  // Check if the dragged items contain files
  if (event.dataTransfer?.types.includes('Files')) {
    // Add visual feedback for valid drop target
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }
}

/**
 * Handle file drag leave event
 */
function handleDragLeave(event: DragEvent): void {
  // Always prevent default to stop browser from opening the file
  event.preventDefault();
  event.stopPropagation();
  
  // Check if we're leaving the same element we entered
  // This helps prevent flickering when moving between child elements
  if (event.target === lastDragTarget.value) {
    lastDragTarget.value = null;
  }
  
  // Decrement drag counter
  dragCounter.value--;
  
  // Add a small delay to prevent flickering
  setTimeout(() => {
    // Only reset dragging state when counter reaches 0 and enough time has passed
    if (dragCounter.value <= 0 && Date.now() - lastDragTime.value > 50) {
      dragCounter.value = 0;
      isDraggingFile.value = false;
    }
  }, 50);
}

/**
 * Handle file drop event
 */
function handleFileDrop(event: DragEvent): void {
  // Always prevent default to stop browser from opening the file
  event.preventDefault();
  event.stopPropagation();

  // Reset drag state immediately
  isDraggingFile.value = false;
  dragCounter.value = 0;

  // Process dropped files
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  }
}

/**
 * Open the file selector dialog
 */
function openFileSelector(): void {
  if (messageState.attachments.length >= props.maxAttachments) {
    $q.notify({
      message: `Maximum ${props.maxAttachments} attachments allowed`,
      color: 'warning',
      icon: 'warning',
    });
    return;
  }

  if (fileInput.value) {
    fileInput.value.click();
  }
}

/**
 * Process files for attachment with comprehensive validation
 */
function processFiles(files: File[]): void {
  const validFiles: File[] = [];
  const errors: FileError[] = [];

  // Validate files
  for (const file of files) {
    // Check if we've reached the maximum attachments
    if (messageState.attachments.length + validFiles.length >= props.maxAttachments) {
      errors.push({
        file: file.name,
        type: FILE_ERROR_TYPE.LIMIT,
        message: `${file.name}: Maximum ${props.maxAttachments} attachments allowed`,
      });
      continue;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push({
        file: file.name,
        type: FILE_ERROR_TYPE.SIZE,
        message: `${file.name}: Exceeds the maximum size limit of ${formatFileSize(MAX_FILE_SIZE)}`,
      });
      continue;
    }

    // Check file type
    if (!isFileTypeSupported(file)) {
      errors.push({
        file: file.name,
        type: FILE_ERROR_TYPE.TYPE,
        message: `${file.name}: File type not supported`,
      });
      continue;
    }

    validFiles.push(file);
  }

  // Add valid files to attachments
  if (validFiles.length > 0) {
    messageState.attachments.push(...validFiles);
    emit('files-attached', validFiles);

    // Save draft with new attachments
    if (props.enableDraftPersistence) {
      saveCurrentDraft();
    }
  }

  // Handle errors
  if (errors.length > 0) {
    // Add new errors to existing errors
    fileErrors.value = [...fileErrors.value, ...errors];

    // Show notification for the first error
    if (errors.length === 1 && errors[0]) {
      $q.notify({
        message: errors[0].message || 'File could not be attached',
        color: 'negative',
        icon: 'warning',
        timeout: 3000,
      });
    } else {
      $q.notify({
        message: `${errors.length} files could not be attached. See details below.`,
        color: 'negative',
        icon: 'warning',
        timeout: 3000,
      });
    }

    // Auto-dismiss errors after 8 seconds if there aren't too many
    if (fileErrors.value.length <= 3) {
      setTimeout(() => {
        clearFileErrors();
      }, 8000);
    }
  }

  // Adjust textarea height after adding attachments
  void nextTick(() => adjustTextareaHeight());
}

/**
 * Handle file selection from the file input
 */
function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const files = Array.from(target.files);
  processFiles(files);

  // Reset the file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
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
 * Truncate filename with ellipsis
 */
function truncateFilename(filename: string, maxLength: number): string {
  if (filename.length <= maxLength) return filename;

  // Get file extension
  const lastDotIndex = filename.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';

  // Calculate how much of the name we can show
  const nameLength = maxLength - 3 - extension.length; // 3 for the ellipsis
  if (nameLength <= 0) return filename.substring(0, maxLength - 3) + '...'; // If extension is too long

  // Return truncated name with extension
  return filename.substring(0, nameLength) + '...' + extension;
}

/**
 * Get appropriate icon for file type
 */
function getFileIcon(file: File): string {
  // Create merged mapping
  const mergedMap = { ...DEFAULT_FILE_TYPE_ICONS, ...(props.fileTypeIcons || {}) };
  const fileType = file.type || '';

  // Check for exact match
  if (fileType in mergedMap) {
    return mergedMap[fileType as keyof typeof mergedMap];
  }

  // Check for prefix match (e.g., 'image/', 'text/')
  for (const [prefix, icon] of Object.entries(mergedMap)) {
    if (prefix.endsWith('/') && fileType.startsWith(prefix)) {
      return icon;
    }
  }

  // Return default icon
  return mergedMap.default || 'mdi-file';
}

/**
 * Check if file is an image
 */
function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a text file
 */
function isTextFile(file: File): boolean {
  return file.type.startsWith('text/') || 
         file.name.endsWith('.txt') || 
         file.name.endsWith('.md') || 
         file.name.endsWith('.csv') || 
         file.name.endsWith('.json');
}

/**
 * Get preview URL for file
 */
function getFilePreviewUrl(file: File): string {
  if (isImageFile(file)) {
    return URL.createObjectURL(file);
  }
  return '';
}

/**
 * Get text preview content
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTextPreview(file: File): string {
  // For initial preview, show a placeholder
  return '<div class="text-center text-grey">Text preview</div>';
}

/**
 * Open file preview modal
 */
function openFilePreview(file: File): void {
  currentPreviewFile.value = file;
  
  if (isTextFile(file)) {
    // Read text file content
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Limit preview to first 10000 characters
        const content = String(e.target.result as string);
        filePreviewContent.value = content.length > 10000 
          ? content.substring(0, 10000) + '\n[Content truncated...]' 
          : content;
      } else {
        filePreviewContent.value = 'Unable to read file content';
      }
    };
    reader.onerror = () => {
      filePreviewContent.value = 'Error reading file';
    };
    reader.readAsText(file);
  }
  
  previewModalOpen.value = true;
}

/**
 * Check if file type is supported
 */
function isFileTypeSupported(file: File): boolean {
  const fileType = file.type;
  const fileName = file.name;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

  // Check if the file type matches any of the supported types
  for (const supportedType of SUPPORTED_FILE_TYPES) {
    // Handle wildcard types like 'image/*'
    if (supportedType.endsWith('/*') && fileType.startsWith(supportedType.replace('/*', '/'))) {
      return true;
    }
    // Handle specific extensions like '.pdf'
    else if (
      supportedType.startsWith('.') &&
      fileExtension.toLowerCase() === supportedType.toLowerCase()
    ) {
      return true;
    }
    // Handle exact matches
    else if (fileType === supportedType) {
      return true;
    }
  }

  return false;
}

/**
 * Clear all file errors
 */
function clearFileErrors(): void {
  fileErrors.value = [];
}

function getFileColor(file: File): string {
  // Create merged mapping
  const mergedMap = { ...DEFAULT_FILE_TYPE_COLORS, ...(props.fileTypeColors || {}) };
  const fileType = file.type || '';

  // Check for exact match
  if (fileType in mergedMap) {
    return mergedMap[fileType as keyof typeof mergedMap];
  }

  // Check for prefix match (e.g., 'image/', 'text/')
  for (const [prefix, color] of Object.entries(mergedMap)) {
    if (prefix.endsWith('/') && fileType.startsWith(prefix)) {
      return color;
    }
  }

  // Return default color
  return mergedMap.default || 'grey';
}

/**
 * Handle keyboard events
 * - Shift+Enter: Creates a new line
 * - Enter: Sends the message (when not empty)
 * - Ctrl/Cmd+Enter: Alternative way to send message
 * - Escape: Clear input or stop processing
 */
function handleKeydown(event: KeyboardEvent): void {
  // Shift+Enter to add a new line
  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault();
    addNewLine();
    return;
  }

  // Ctrl+Enter or Cmd+Enter as alternative send method
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    if (canSendMessage.value && !props.isProcessing) {
      sendMessage();
    }
    return;
  }

  // Enter to send message (when not empty and not processing)
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    if (canSendMessage.value && !props.isProcessing) {
      sendMessage();
    }
    return;
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
    border-radius: 8px !important; // Explicitly set border radius
    overflow: hidden; // Prevent content from overflowing rounded corners
    border: 1px solid rgba(0, 0, 0, 0.12); // Consistent border styling
    box-shadow: none; // Remove any shadow that might affect border appearance
    position: relative; // Needed for proper border rendering
  }

  .input-container {
    position: relative;
  }

  .auto-expand-textarea-wrapper {
    position: relative;
    width: 100%;
    border-radius: 0; // Remove border radius from inner wrapper
    border: none; // Remove border as it's handled by the container
    background-color: transparent;
    transition: all 0.2s ease;

    &:focus-within {
      // Remove the border change on focus
      border: none;
      outline: none;
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
      caret-color: transparent; // Hide the cursor by default

      &:focus {
        caret-color: auto; // Show cursor only when focused
      }
      overflow-y: hidden;
      transition:
        height 0.2s ease,
        background-color 0.2s ease;

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
    background-color: transparent;
    padding: 0 8px; // Add horizontal padding

    .attachment-item {
      .attachment-chip {
        .truncate-filename {
          max-width: 150px;
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: bottom;
        }
      }
    }
  }

  // File preview styling
  .file-preview-card {
    width: 90px;
    max-width: 90px;
    transition: transform 0.2s ease;
    overflow: hidden;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
    }
    
    .file-preview-content {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      cursor: pointer;
      background-color: #f5f5f5;
      
      .image-preview {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .text-preview {
        width: 100%;
        height: 100%;
        padding: 8px;
        overflow: hidden;
        font-size: 11px;
        color: #333;
        background-color: #fff;
        border: 1px solid #eee;
        
        .text-preview-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
      
      .document-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    }
    
    .file-info {
      display: flex;
      flex-direction: column;
      padding: 8px;
      
      .file-name {
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .file-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 4px;
        
        .file-size {
          font-size: 11px;
          color: #666;
        }
        
        .remove-btn {
          margin-right: -8px;
        }
      }
    }
  }
  
  // Preview modal styling
  .preview-modal-card {
    .preview-modal-content {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      
      .full-image-preview {
        max-width: 100%;
        max-height: 80vh;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .full-preview-image {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
        }
      }
      
      .full-text-preview {
        width: 100%;
        max-height: 80vh;
        overflow: auto;
        padding: 16px;
        background-color: #f8f8f8;
        border-radius: 4px;
        
        .text-content {
          white-space: pre-wrap;
          word-break: break-word;
          font-family: monospace;
          font-size: 14px;
        }
      }
      
      .full-document-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    }
  }

  // Drag and drop styles
  position: relative;
  z-index: 1; /* Ensure proper stacking context */

  .drag-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    border-radius: 8px;
    border: 2px dashed var(--q-primary);
    animation: pulse 2s infinite ease-in-out;
    pointer-events: none; /* Prevent overlay from intercepting events */
  }

  .drag-content {
    pointer-events: none;
  }

  .message-input-container.drag-active {
    border: 2px dashed var(--q-primary);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 0.7;
  }
}

// Dark mode styles
.body--dark .enhanced-message-input {
  --q-separator-color: rgba(255, 255, 255, 0.12);
  --q-action-button-color: grey-5;

  .message-input-container {
    background-color: var(--q-dark-page) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 8px !important; /* Ensure border radius is maintained in dark mode */
    overflow: hidden; /* Ensure content doesn't overflow the rounded corners */
    box-shadow: none !important; /* Remove any shadow effects */
    /* Fix for the corners showing incorrectly in dark mode */
    &::before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      border-radius: 8px;
      pointer-events: none;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .auto-expand-textarea {
      color: #fff;
      background-color: var(--q-dark-page) !important;

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
    background-color: transparent !important;
  }

  .drag-overlay {
    background-color: rgba(30, 30, 30, 0.9);
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

  .drag-overlay {
    background-color: rgba(255, 255, 255, 0.9);
  }
}

// Near limit styles for light mode
.message-input-container.near-limit .auto-expand-textarea {
  background-color: rgba(244, 67, 54, 0.05);
  transition: background-color 0.3s ease;
}
</style>
