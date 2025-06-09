/**
 * Composable for message draft persistence
 * Handles auto-saving and restoration of message drafts using localStorage
 */
import { ref, watch, onBeforeUnmount } from 'vue';

interface DraftData {
  text: string;
  timestamp: number;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
  }>;
}

export function useDraftPersistence(options: {
  sessionId?: string;
  autoSaveInterval?: number;
  onError?: (error: Error) => void;
} = {}) {
  // Default options
  const {
    sessionId = 'default',
    autoSaveInterval = 2000,
    onError = console.error
  } = options;

  // Storage key for this specific session
  const storageKey = `message_draft_${sessionId}`;
  
  // Draft text state
  const draftText = ref('');
  
  // Auto-save timer
  let autoSaveTimer: number | null = null;
  
  /**
   * Save draft to localStorage
   */
  const saveDraft = (text: string, attachmentsMeta?: Array<{name: string; type: string; size: number}>): void => {
    if (!text.trim() && (!attachmentsMeta || attachmentsMeta.length === 0)) {
      clearDraft();
      return;
    }
    
    try {
      const draftData: DraftData = {
        text,
        timestamp: Date.now()
      };
      
      if (attachmentsMeta && attachmentsMeta.length > 0) {
        draftData.attachments = attachmentsMeta;
      }
      
      localStorage.setItem(storageKey, JSON.stringify(draftData));
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to save draft'));
    }
  };
  
  /**
   * Load draft from localStorage
   */
  const loadDraft = (): { text: string; attachmentsMeta?: Array<{name: string; type: string; size: number}> | undefined } => {
    try {
      const savedDraft = localStorage.getItem(storageKey);
      
      if (!savedDraft) {
        return { text: '' };
      }
      
      const draftData: DraftData = JSON.parse(savedDraft);
      return { 
        text: draftData.text || '',
        attachmentsMeta: draftData.attachments
      };
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to load draft'));
      return { text: '' };
    }
  };
  
  /**
   * Clear draft from localStorage
   */
  const clearDraft = (): void => {
    try {
      localStorage.removeItem(storageKey);
      draftText.value = '';
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to clear draft'));
    }
  };
  
  /**
   * Start auto-saving draft
   */
  const startAutoSave = (initialText: string = ''): void => {
    // Set initial text if provided
    if (initialText) {
      draftText.value = initialText;
    }
    
    // Set up auto-save timer
    stopAutoSave(); // Clear any existing timer
    autoSaveTimer = window.setInterval(() => {
      if (draftText.value) {
        saveDraft(draftText.value);
      }
    }, autoSaveInterval);
  };
  
  /**
   * Stop auto-saving draft
   */
  const stopAutoSave = (): void => {
    if (autoSaveTimer !== null) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }
  };
  
  // Watch for changes to draft text
  watch(draftText, () => {
    // We don't save immediately on every change
    // Auto-save timer will handle the actual saving
  });
  
  // Clean up on component unmount
  onBeforeUnmount(() => {
    stopAutoSave();
  });
  
  return {
    draftText,
    saveDraft,
    loadDraft,
    clearDraft,
    startAutoSave,
    stopAutoSave
  };
}
