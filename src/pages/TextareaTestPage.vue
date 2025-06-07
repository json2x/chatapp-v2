<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Enhanced Message Input Test</q-toolbar-title>
        <q-btn flat round dense icon="home" to="/" />
      </q-toolbar>
    </q-header>
    
    <q-page-container>
      <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h6">Enhanced Message Input Test</div>
            <div class="text-subtitle2">Auto-expanding textarea with character counting</div>
          </q-card-section>
          
          <q-card-section>
            <enhanced-message-input 
              :is-processing="isProcessing"
              :initial-text="initialText"
              :max-attachments="5"
              @send="handleSend"
              @stop="handleStop"
              @files-attached="handleFilesAttached"
              @files-removed="handleFilesRemoved"
            />
          </q-card-section>
          
          <q-card-section v-if="lastMessage">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2">Last Message:</div>
            <pre class="message-preview">{{ JSON.stringify(lastMessage, null, 2) }}</pre>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-md-6">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h6">Controls</div>
          </q-card-section>
          
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-toggle
                  v-model="isProcessing"
                  label="Toggle Processing State"
                />
              </div>
              
              <div class="col-12">
                <q-input
                  v-model="initialText"
                  label="Set Initial Text"
                  outlined
                  dense
                />
              </div>
              
              <div class="col-12">
                <q-btn
                  color="primary"
                  label="Reset Component"
                  @click="resetComponent"
                  class="q-mt-sm"
                />
              </div>
            </div>
          </q-card-section>
          
          <q-card-section>
            <div class="text-h6">Acceptance Criteria</div>
            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    <q-checkbox v-model="criteria.autoExpand" label="Textarea expands automatically as user types" />
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>
                    <q-checkbox v-model="criteria.maxHeight" label="Maximum height with scrolling for overflow" />
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>
                    <q-checkbox v-model="criteria.charCount" label="Character count updates in real-time" />
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section>
                  <q-item-label>
                    <q-checkbox v-model="criteria.smoothAnimation" label="Smooth animations during height changes" />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import EnhancedMessageInput from 'src/components/chat/EnhancedMessageInput.vue';

// Define message interface to match the component's MessageData
interface MessageData {
  text: string;
  attachments: File[];
}

// Component state
const isProcessing = ref(false);
const initialText = ref('');
const lastMessage = ref<MessageData | null>(null);
const key = ref(0);

// Acceptance criteria checklist
const criteria = reactive({
  autoExpand: false,
  maxHeight: false,
  charCount: false,
  smoothAnimation: false
});

// Event handlers
function handleSend(message: MessageData): void {
  lastMessage.value = message;
  console.log('Message sent:', message);
}

function handleStop() {
  isProcessing.value = false;
  console.log('Processing stopped');
}

function handleFilesAttached(files: File[]): void {
  console.log('Files attached:', files);
}

function handleFilesRemoved(index: number): void {
  console.log('File removed at index:', index);
}

// Reset the component by changing its key
function resetComponent() {
  key.value++;
  lastMessage.value = null;
}
</script>

<style lang="scss" scoped>
.message-preview {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
  white-space: pre-wrap;
  font-family: monospace;
}

.body--dark {
  .message-preview {
    background-color: #1d1d1d;
  }
}
</style>
