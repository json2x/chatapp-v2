<template>
  <div
    class="chat-message"
    :class="{
      'user-message': role === 'user',
      'assistant-message': role === 'assistant',
      'streaming': isStreaming
    }"
    ref="messageContainer"
  >
    <!-- Message header with avatar and role -->
    <div class="message-header">
      <div class="avatar" :class="role">
        <q-avatar :color="role === 'user' ? 'primary' : 'secondary'" text-color="white">
          {{ role === 'user' ? 'U' : 'A' }}
        </q-avatar>
      </div>
      <div class="sender-name">{{ role === 'user' ? 'You' : 'Assistant' }}</div>
      <div class="message-actions">
        <q-btn
          v-if="role === 'assistant'"
          flat
          round
          dense
          icon="content_copy"
          size="sm"
          aria-label="Copy message"
          @click="copyFullMessage"
        >
          <q-tooltip>Copy message</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Message content -->
    <div class="message-content" :class="{ 'long-content': isLongContent }">
      <!-- Loading state for streaming messages -->
      <div v-if="isStreaming && !content" class="streaming-placeholder">
        <q-spinner-dots color="primary" size="2em" />
      </div>

      <!-- Rendered message content -->
      <div
        v-else
        ref="contentElement"
        class="rendered-content"
        :class="{ 'markdown-body': role === 'assistant' }"
      >
        <!-- For user messages, simple text display -->
        <div v-if="role === 'user'">{{ content }}</div>

        <!-- For assistant messages, render with markdown and other enhancements -->
        <div
          v-else
          class="markdown-content"
          v-html="renderedContent"
          ref="markdownContent"
        ></div>
      </div>

      <!-- Expandable content indicator for long messages -->
      <div
        v-if="isCollapsible && !isExpanded"
        class="collapse-overlay"
        @click="toggleExpand"
      ></div>
    </div>

    <!-- Expand/collapse button for long content -->
    <div v-if="isCollapsible" class="expand-collapse">
      <q-btn
        flat
        no-caps
        :label="isExpanded ? 'Show less' : 'Show more'"
        :icon-right="isExpanded ? 'expand_less' : 'expand_more'"
        @click="toggleExpand"
        size="sm"
        color="primary"
      />
    </div>

    <!-- Error message if rendering fails -->
    <div v-if="renderError" class="render-error">
      <q-banner dense rounded class="bg-negative text-white">
        <template v-slot:avatar>
          <q-icon name="error" color="white" />
        </template>
        Failed to render message content. Please try again.
      </q-banner>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { renderChatMessage, extractCodeBlocks, copyToClipboard, addCopyButtons } from '../utils/chatUtils';
import mermaid from 'mermaid';

// Initialize mermaid with optimal settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose', // Required for dynamic rendering
  fontFamily: 'Roboto, sans-serif'
});

// Component props
interface Props {
  /** Message content (markdown or plain text) */
  content: string;
  /** Message sender role (user or assistant) */
  role: 'user' | 'assistant';
  /** Whether the message is currently streaming */
  isStreaming?: boolean;
  /** Whether to automatically process diagrams */
  processDiagrams?: boolean;
  /** Maximum height before collapsing content */
  maxHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
  processDiagrams: true,
  maxHeight: 300
});

// Emits
const emit = defineEmits<{
  /** Emitted when content rendering is complete */
  (e: 'rendered'): void;
  /** Emitted when content is copied */
  (e: 'copied', success: boolean): void;
}>();

// Component state
const $q = useQuasar();
const messageContainer = ref<HTMLElement | null>(null);
const contentElement = ref<HTMLElement | null>(null);
const markdownContent = ref<HTMLElement | null>(null);
const renderError = ref(false);
const isExpanded = ref(false);
const isLongContent = ref(false);
const isCollapsible = ref(false);

// Computed properties
const renderedContent = computed(() => {
  if (!props.content) return '';
  try {
    return renderChatMessage(props.content);
  } catch (error) {
    console.error('Error rendering message:', error);
    // Handle the error outside the computed property
    void nextTick(() => {
      renderError.value = true;
    });
    return `<p>Error rendering content</p>`;
  }
});

// Methods

/**
 * Processes the rendered content to enhance it with interactive features
 */
async function processContent(): Promise<void> {
  if (props.role !== 'assistant' || !markdownContent.value) return;
  
  try {
    // Reset state
    renderError.value = false;
    
    await nextTick();
    
    // Extract and enhance code blocks
    const codeBlocks = extractCodeBlocks(markdownContent.value);
    addCopyButtons(codeBlocks, (success) => {
      emit('copied', success);
    });
    
    // Process mermaid diagrams if enabled
    if (props.processDiagrams) {
      await processMermaidDiagrams();
    }
    
    // Check if content should be collapsible
    checkContentHeight();
    
    // Signal that rendering is complete
    emit('rendered');
  } catch (error) {
    console.error('Error processing content:', error);
    renderError.value = true;
  }
}

/**
 * Processes mermaid diagrams in the content
 */
async function processMermaidDiagrams(): Promise<void> {
  if (!markdownContent.value) return;
  
  // Find all pre > code.language-mermaid elements
  const mermaidCodeBlocks = markdownContent.value.querySelectorAll('pre > code.language-mermaid');
  
  for (let i = 0; i < mermaidCodeBlocks.length; i++) {
    const codeBlock = mermaidCodeBlocks[i];
    if (!codeBlock) continue;
    
    const preElement = codeBlock.parentElement;
    if (!preElement) continue;
    
    try {
      const mermaidDefinition = codeBlock.textContent || '';
      if (!mermaidDefinition.trim()) continue;
      
      // Create a container for the diagram
      const diagramContainer = document.createElement('div');
      diagramContainer.className = 'mermaid-diagram';
      diagramContainer.setAttribute('aria-label', 'Diagram');
      
      // Replace the pre element with the diagram container
      preElement.parentNode?.replaceChild(diagramContainer, preElement);
      
      // Render the diagram
      const { svg } = await mermaid.render(`mermaid-diagram-${i}`, mermaidDefinition);
      diagramContainer.innerHTML = svg;
    } catch (error) {
      console.error('Error rendering mermaid diagram:', error);
      // Restore the original code block on error
      const errorMessage = document.createElement('div');
      errorMessage.className = 'mermaid-error';
      errorMessage.innerHTML = `<p class="text-negative">Failed to render diagram</p>`;
      preElement.parentNode?.insertBefore(errorMessage, preElement.nextSibling);
    }
  }
}

/**
 * Checks if the content height exceeds the maximum height and should be collapsible
 */
function checkContentHeight(): void {
  if (!contentElement.value) return;
  
  const contentHeight = contentElement.value.scrollHeight;
  isLongContent.value = contentHeight > props.maxHeight;
  isCollapsible.value = contentHeight > props.maxHeight;
}

/**
 * Toggles the expanded state of collapsible content
 */
function toggleExpand(): void {
  isExpanded.value = !isExpanded.value;
}

/**
 * Copies the full message content to clipboard
 */
async function copyFullMessage(): Promise<void> {
  try {
    const success = await copyToClipboard(props.content);
    
    // Show notification
    $q.notify({
      type: success ? 'positive' : 'negative',
      message: success ? 'Message copied to clipboard' : 'Failed to copy message',
      position: 'top',
      timeout: 2000
    });
    
    emit('copied', success);
  } catch (error) {
    console.error('Error copying message:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to copy message',
      position: 'top',
      timeout: 2000
    });
    
    emit('copied', false);
  }
}

// Lifecycle hooks
onMounted(() => {
  void processContent();
});

// Watch for content changes to reprocess content
watch(() => props.content, () => {
  void nextTick(() => {
    void processContent();
  });
});

// Watch for streaming state changes
watch(() => props.isStreaming, (isStreaming) => {
  if (!isStreaming) {
    void nextTick(() => {
      void processContent();
    });
  }
});
</script>

<style lang="scss" scoped>
.chat-message {
  margin-bottom: 1rem;
  width: 100%;
  
  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  &__role {
    font-weight: 500;
    margin-left: 0.5rem;
    text-transform: capitalize;
  }
  
  &__content {
    position: relative;
    transition: max-height 0.3s ease;
    overflow: hidden;
    
    &--collapsed {
      max-height: v-bind('props.maxHeight + "px"');
    }
    
    &--expanded {
      max-height: none;
    }
  }
  
  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
    gap: 0.5rem;
  }
  
  &__expand-btn {
    margin-top: 0.5rem;
    width: 100%;
    justify-content: center;
  }
  
  &__fade-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to bottom, transparent, var(--q-primary-fade));
    pointer-events: none;
    opacity: 0.8;
  }
}

// Markdown content styling
.markdown-content {
  line-height: 1.6;
  
  :deep(p) {
    margin-bottom: 1rem;
  }
  
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  :deep(code) {
    font-family: 'Fira Code', monospace;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
    background-color: var(--q-code-bg);
  }
  
  :deep(pre) {
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 4px;
    background-color: var(--q-code-block-bg);
    position: relative;
    overflow: auto;
    
    code {
      padding: 0;
      background-color: transparent;
      font-size: 0.9rem;
      display: block;
      overflow-x: auto;
    }
  }
  
  :deep(blockquote) {
    border-left: 4px solid var(--q-primary);
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
    color: var(--q-blockquote);
  }
  
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
    
    th, td {
      border: 1px solid var(--q-table-border);
      padding: 0.5rem;
    }
    
    th {
      background-color: var(--q-table-header-bg);
    }
    
    tr:nth-child(even) {
      background-color: var(--q-table-row-alt);
    }
  }
  
  :deep(a) {
    color: var(--q-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  :deep(ul), :deep(ol) {
    padding-left: 2rem;
    margin: 1rem 0;
  }
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
  
  :deep(.math) {
    overflow-x: auto;
    max-width: 100%;
    padding: 0.5rem 0;
  }
  
  :deep(.math-display) {
    display: block;
    margin: 1rem 0;
  }
  
  :deep(.copy-button) {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    opacity: 0.7;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
  }
  
  :deep(.mermaid-diagram) {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    background-color: var(--q-diagram-bg);
    padding: 1rem;
    border-radius: 4px;
    
    svg {
      max-width: 100%;
    }
  }
  
  :deep(.mermaid-error) {
    color: var(--q-negative);
    padding: 0.5rem;
    border: 1px solid var(--q-negative);
    border-radius: 4px;
    margin: 1rem 0;
  }
}

// Dark mode adjustments
.body--dark {
  --q-primary-fade: rgba(25, 25, 25, 0.9);
  --q-code-bg: rgba(255, 255, 255, 0.1);
  --q-code-block-bg: #1e1e1e;
  --q-blockquote: rgba(255, 255, 255, 0.7);
  --q-table-border: #444;
  --q-table-header-bg: #333;
  --q-table-row-alt: #2a2a2a;
  --q-diagram-bg: #2a2a2a;
}

// Light mode variables
.body--light {
  --q-primary-fade: rgba(255, 255, 255, 0.9);
  --q-code-bg: rgba(0, 0, 0, 0.05);
  --q-code-block-bg: #f5f5f5;
  --q-blockquote: rgba(0, 0, 0, 0.6);
  --q-table-border: #ddd;
  --q-table-header-bg: #f0f0f0;
  --q-table-row-alt: #f9f9f9;
  --q-diagram-bg: #f9f9f9;
}

// Streaming animation
@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.streaming-indicator {
  animation: pulse 1.5s infinite;
  display: inline-block;
  margin-left: 0.25rem;
}
</style>