<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Session 1 -->
      <div class="col-12 col-md-6">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Chat Session 1</div>
            <div class="text-subtitle2">Session ID: "chat-1"</div>
          </q-card-section>
          
          <q-card-section class="q-pa-none">
            <div class="chat-container q-pa-md">
              <div class="chat-messages q-mb-md">
                <q-chat-message
                  name="System"
                  :text="['This is chat session 1. Type a message below and it will be saved as a draft.']"
                  bg-color="primary"
                  text-color="white"
                />
              </div>
            </div>
          </q-card-section>
          
          <q-card-section>
            <enhanced-message-input
              session-id="chat-1"
              placeholder="Type in session 1..."
              @send="handleSend('chat-1', $event)"
            />
          </q-card-section>
        </q-card>
      </div>
      
      <!-- Session 2 -->
      <div class="col-12 col-md-6">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-h6">Chat Session 2</div>
            <div class="text-subtitle2">Session ID: "chat-2"</div>
          </q-card-section>
          
          <q-card-section class="q-pa-none">
            <div class="chat-container q-pa-md">
              <div class="chat-messages q-mb-md">
                <q-chat-message
                  name="System"
                  :text="['This is chat session 2. Type a message below and it will be saved as a separate draft.']"
                  bg-color="secondary"
                  text-color="white"
                />
              </div>
            </div>
          </q-card-section>
          
          <q-card-section>
            <enhanced-message-input
              session-id="chat-2"
              placeholder="Type in session 2..."
              @send="handleSend('chat-2', $event)"
            />
          </q-card-section>
        </q-card>
      </div>
      
      <!-- Debug Panel -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Debug Panel</div>
          </q-card-section>
          
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="customSessionId"
                  label="Custom Session ID"
                  outlined
                  dense
                />
              </div>
              
              <div class="col-12 col-md-6 q-gutter-sm">
                <q-btn
                  color="primary"
                  label="View Draft"
                  @click="viewDraft(customSessionId)"
                />
                <q-btn
                  color="negative"
                  label="Clear Draft"
                  @click="clearDraft(customSessionId)"
                />
              </div>
            </div>
            
            <q-separator class="q-my-md" />
            
            <div>
              <div class="text-subtitle2">Stored Drafts:</div>
              <pre class="bg-grey-2 q-pa-sm rounded-borders">{{ storedDrafts }}</pre>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import EnhancedMessageInput from '../components/chat/EnhancedMessageInput.vue';

const $q = useQuasar();
const customSessionId = ref('custom-session');
const storedDrafts = ref('{}');

// Handle message send
function handleSend(sessionId: string, message: { text: string; attachments: File[] }) {
  $q.notify({
    message: `Message sent from session ${sessionId}: ${message.text}`,
    color: 'positive',
    icon: 'send'
  });
  
  // Refresh stored drafts display
  refreshStoredDrafts();
}

// View draft for a specific session
function viewDraft(sessionId: string) {
  if (!sessionId) {
    $q.notify({
      message: 'Please enter a session ID',
      color: 'warning'
    });
    return;
  }
  
  try {
    const key = `message_draft_${sessionId}`;
    const draft = localStorage.getItem(key);
    
    if (draft) {
      $q.dialog({
        title: `Draft for session "${sessionId}"`,
        message: `<pre>${JSON.stringify(JSON.parse(draft), null, 2)}</pre>`,
        html: true
      });
    } else {
      $q.notify({
        message: `No draft found for session "${sessionId}"`,
        color: 'info'
      });
    }
  } catch (error: unknown) {
    $q.notify({
      message: `Error retrieving draft: ${error instanceof Error ? error.message : String(error)}`,
      color: 'negative'
    });
  }
}

// Clear draft for a specific session
function clearDraft(sessionId: string) {
  if (!sessionId) {
    $q.notify({
      message: 'Please enter a session ID',
      color: 'warning'
    });
    return;
  }
  
  try {
    const key = `message_draft_${sessionId}`;
    localStorage.removeItem(key);
    $q.notify({
      message: `Draft for session "${sessionId}" cleared`,
      color: 'positive'
    });
    refreshStoredDrafts();
  } catch (error: unknown) {
    $q.notify({
      message: `Error clearing draft: ${error instanceof Error ? error.message : String(error)}`,
      color: 'negative'
    });
  }
}

// Get all drafts from localStorage
function refreshStoredDrafts() {
  try {
    const drafts: Record<string, unknown> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('message_draft_')) {
        const value = localStorage.getItem(key);
        if (value) {
          drafts[key] = JSON.parse(value);
        }
      }
    }
    
    storedDrafts.value = JSON.stringify(drafts, null, 2);
  } catch (error) {
    console.error('Error refreshing stored drafts:', error);
    storedDrafts.value = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Initialize
onMounted(() => {
  refreshStoredDrafts();
});
</script>

<style lang="scss" scoped>
.chat-container {
  height: 200px;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.03);
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}
</style>
