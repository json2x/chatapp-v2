<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-black">
      <q-toolbar class="q-px-md main-toolbar">
        <!-- Menu button that's only visible when drawer is hidden -->
        <q-btn
          v-if="!leftDrawerOpen"
          flat
          dense
          round
          icon="mdi-menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          color="grey-7"
          class="q-mr-sm"
        />

        <q-toolbar-title>
          <div class="row items-center">
            <q-select 
              class="version-select" 
              v-model="selectedVersion" 
              :options="versionOptions" 
              dense 
              borderless
              dropdown-icon="mdi-chevron-down"
              style="min-width: 160px"
            />
          </div>
        </q-toolbar-title>

        <q-avatar size="32px" class="q-mr-sm cursor-pointer">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png">
        </q-avatar>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="280"
      class="drawer-container"
    >
      <div class="drawer-header q-px-md row items-center">
        <q-btn
          flat
          dense
          round
          icon="mdi-chevron-left"
          aria-label="Close Menu"
          @click="toggleLeftDrawer"
          color="grey-7"
          class="q-mr-sm"
        />
        <div class="text-subtitle1 text-weight-medium app-title">Mr Roboto Chat</div>
      </div>
      <div class="drawer-content-wrapper">
        <q-list padding class="no-border">
          <q-item clickable v-ripple class="q-mb-sm drawer-item" @click="newChat">
            <q-item-section avatar>
              <q-icon name="mdi-chat-plus-outline" />
            </q-item-section>
            <q-item-section>New chat</q-item-section>
          </q-item>
          
          <div class="q-my-md"></div>
          
          <q-item-label header>Recent</q-item-label>
          
          <ChatItem 
            v-for="chat in chatSessions" 
            :key="chat.id" 
            :chat="chat"
            :active="activeChatId === chat.id"
            @select="setActiveChat(chat.id)"
          />
        </q-list>
        
        <div class="settings-container">
          <q-item clickable v-ripple class="drawer-item">
            <q-item-section avatar>
              <q-icon name="mdi-cog" color="grey-7" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChatStore } from 'src/stores/chat-store';
import ChatItem from 'components/ChatItem.vue';

const chatStore = useChatStore();

// Version dropdown
const selectedVersion = ref('2.3 Pro (preview)');
const versionOptions = [
  '2.3 Pro (preview)',
  '2.2 Standard',
  '2.1 Lite'
];

// Chat sessions
const chatSessions = computed(() => chatStore.chatSessions);
const activeChatId = computed(() => chatStore.activeChatId);

// Drawer control
const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function setActiveChat(chatId: string) {
  chatStore.setActiveChat(chatId);
}

function newChat() {
  chatStore.createNewChat();
}
</script>

<style scoped>
.header-shadow {
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

:deep(.version-select .q-field__native) {
  color: #5f6368;
  font-weight: 500;
}

:deep(.version-select .q-field__marginal) {
  color: #5f6368;
}

:deep(.q-drawer) {
  background-color: #f8f9fa;
  border-right: none !important;
}

.drawer-header {
  border-bottom: none;
  height: 64px;
  padding-top: 12px;
  padding-bottom: 12px;
}

:deep(.q-drawer .q-separator) {
  display: none;
}

:deep(.q-drawer .q-list) {
  border: none !important;
}

:deep(.q-item) {
  padding-left: 16px;
  padding-right: 16px;
  min-height: 48px;
}

:deep(.q-item__section--avatar) {
  min-width: 40px;
}

:deep(.q-separator--spaced) {
  margin: 12px 0;
}

:deep(.q-item__label--header) {
  color: #5f6368;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 16px 16px 8px 16px;
}

.drawer-content-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100% - 64px); /* Subtract header height */
  justify-content: space-between;
}

.settings-container {
  margin-top: auto;
}

.drawer-item {
  border-radius: 12px;
  margin: 3px 6px;
  padding: 10px 16px;
  transition: background-color 0.2s ease;
}

.drawer-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.main-toolbar {
  height: 64px;
}

.app-title {
  line-height: 1.5;
  font-size: 1.1rem;
}
</style>
