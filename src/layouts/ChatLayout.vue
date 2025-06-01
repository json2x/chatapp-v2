<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="header-transition">
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
            <!-- Models dropdown with loading state -->
            <div class="row items-center">
              <q-spinner-dots v-if="isLoadingModels" color="primary" size="1em" class="q-mr-sm" />
              <q-select
                v-if="chatStore.versionOptions.length > 0 && !isLoadingModels"
                class="version-select dark-mode-text"
                v-model="chatStore.selectedVersion"
                :options="chatStore.versionOptions"
                dense
                borderless
                dropdown-icon="mdi-chevron-down"
                :input-style="
                  currentTheme === 'dark' ? 'color: rgba(255, 255, 255, 0.85) !important' : ''
                "
                style="min-width: 160px"
                @update:model-value="handleModelChange"
              />
            </div>
          </div>
        </q-toolbar-title>

        <q-avatar size="32px" class="q-mr-sm cursor-pointer">
          <img :src="userSession.avatarUrl" />

          <!-- User menu popup -->
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="mdi-logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-avatar>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="280" class="drawer-container">
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
        <div class="text-subtitle1 text-weight-medium app-title">
          {{ appTitle.slice(0, -titleSplitIndex)
          }}<span class="highlight">{{ appTitle.slice(-titleSplitIndex) }}</span> Chat
        </div>
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

          <div class="conversations-header row items-center justify-between">
            <q-item-label v-if="conversations.length !== 0" header>Recent</q-item-label>
          </div>

          <!-- Empty state loading -->
          <div
            v-if="isLoadingConversations && conversations.length === 0"
            class="q-pa-md text-center"
          >
            <q-spinner-dots color="primary" size="2em" />
            <div class="q-mt-sm text-grey-7">Loading conversations...</div>
          </div>

          <!-- Error state -->
          <div v-else-if="loadError" class="q-pa-md text-center">
            <div class="q-mt-sm text-grey-7">{{ loadError || 'Error loading conversations' }}</div>
            <q-btn
              flat
              round
              color="primary"
              class="q-mt-sm"
              icon="mdi-refresh"
              @click="fetchUserConversations"
            />
          </div>

          <!-- Conversation list -->
          <ChatItem
            v-else
            v-for="chat in conversations"
            :key="chat.id"
            :chat="chat"
            :active="activeChatId === chat.id"
            @select="handleChatSelect(chat.id)"
            @delete="handleDeleteConversation"
          />
        </q-list>

        <div class="q-mb-md settings-container">
          <q-item clickable v-ripple class="drawer-item">
            <q-item-section avatar>
              <q-icon name="mdi-cog" color="grey-7" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>

            <q-menu
              anchor="top right"
              self="top left"
              :offset="[10, 0]"
              class="q-pb-xs settings-dropdown"
            >
              <q-list style="min-width: 200px">
                <q-item-label header class="q-pb-xs q-pt-sm">Theme</q-item-label>
                <q-item clickable @click="setTheme('light')" dense class="q-py-xs theme-item">
                  <q-item-section avatar>
                    <q-icon
                      name="mdi-white-balance-sunny"
                      :color="currentTheme === 'light' ? 'primary' : 'grey-7'"
                      size="sm"
                    />
                  </q-item-section>
                  <q-item-section>Light</q-item-section>
                </q-item>
                <q-item clickable @click="setTheme('dark')" dense class="q-py-xs theme-item">
                  <q-item-section avatar>
                    <q-icon
                      name="mdi-moon-waning-crescent"
                      :color="currentTheme === 'dark' ? 'primary' : 'grey-7'"
                      size="sm"
                    />
                  </q-item-section>
                  <q-item-section>Dark</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
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
import { ref, computed, watch, onMounted } from 'vue';
import { useChatStore } from 'src/stores/chat-store';
import { useUserStore } from 'src/stores/user-store';
import { useAppStore } from 'src/stores/app-store';
import { useRouter } from 'vue-router';
import { logout } from 'src/services/auth';
import { getConversations, deleteConversation } from 'src/services/conversationService';
import { debounce } from 'src/misc/utils';
import ChatItem from 'components/ChatItem.vue';
import { Dark, QSpinnerDots, useQuasar } from 'quasar';

const chatStore = useChatStore();
const userStore = useUserStore();
const appStore = useAppStore();
const router = useRouter();
const $q = useQuasar();
const userSession = computed(() => userStore.userSession);

// App title and split index for styling
const appTitle = computed(() => appStore.title);
const titleSplitIndex = computed(() => appStore.titleSplitIndex);

// Conversations
const conversations = computed(() => chatStore.conversations);
const activeChatId = computed(() => chatStore.activeChatId);

// Drawer control
const leftDrawerOpen = ref(false);

// Theme control
type ThemeType = 'light' | 'dark';
const currentTheme = ref<ThemeType>('light');

// Reactive state
const isLoadingConversations = ref(false);
const isLoadingModels = ref(false);
const loadError = ref<string | null>(null);

// Load theme and fetch conversations on mount
onMounted(async () => {
  // Load theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    currentTheme.value = savedTheme as ThemeType;
    applyTheme(currentTheme.value);
  }

  // Fetch models first
  isLoadingModels.value = true;
  try {
    await chatStore.fetchAvailableModels();
  } catch (error) {
    console.error('Failed to fetch available models:', error);
    // Continue even if models fail to load, we'll use the default options
  } finally {
    isLoadingModels.value = false;
  }

  // Then fetch conversations
  await fetchUserConversations();
});

// Function to fetch conversations for the current user
async function fetchUserConversations() {
  isLoadingConversations.value = true;
  loadError.value = null;

  try {
    // Get user ID from user store
    const userId = userSession.value.id;

    // Fetch conversations for the current user
    const userConversations = await getConversations(userId);

    // Update the chat store with fetched conversations
    chatStore.$patch({
      conversations: userConversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        subtitle: conv.subtitle || 'New conversation',
        timestamp: new Date(conv.updated_at),
        messages: [], // We'll load full messages only when a conversation is selected
      })),
    });

    // We no longer automatically set the first conversation as active
    // This allows the welcome screen with user's name and suggestions to be shown
    // The user must explicitly select a conversation to view it
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    loadError.value = 'Failed to load conversations. Please try again.';
  } finally {
    isLoadingConversations.value = false;
  }
}

// Watch for theme changes and apply them
watch(currentTheme, (newTheme) => {
  applyTheme(newTheme);
  // No need to set localStorage here as it's done in applyTheme
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// Handle model selection change and save to localStorage
function handleModelChange(newModel: string) {
  chatStore.updateSelectedModel(newModel);
}

function setTheme(theme: ThemeType) {
  currentTheme.value = theme;
}

function applyTheme(theme: ThemeType) {
  // Add transitioning class to body
  document.body.classList.add('theme-transitioning');

  // Delay the actual theme change to allow for smooth transition
  setTimeout(() => {
    // Apply dark mode to Quasar
    Dark.set(theme === 'dark');

    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);

    // Remove transitioning class after a short delay
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }, 50);
}

// Original setActiveChat function moved above the debounced version

// Original setActiveChat function
async function setActiveChatImpl(chatId: string) {
  try {
    await chatStore.setActiveChat(chatId);
  } catch (error) {
    console.error('Error setting active chat:', error);
  }
}

// Debounced version with 500ms delay
const setActiveChat = debounce(setActiveChatImpl, 500);

// Function to handle chat selection with immediate loading state
function handleChatSelect(chatId: string) {
  // Immediately set the active chat ID and show loading state
  chatStore.activeChatId = chatId;
  chatStore.isLoadingMessages = true;

  // Then call the debounced function to actually fetch the data
  setActiveChat(chatId);
}

function newChat() {
  chatStore.createNewChat();
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    // Create a router object that matches the expected type in auth.ts
    const routerAdapter = {
      push: (path: string): Promise<void> => {
        return router.push(path).then(() => {});
      },
    };
    await logout(routerAdapter);
    // The logout function will handle the redirect to the landing page
  } catch (error) {
    console.error('Error during logout:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to logout. Please try again.',
    });
  }
}

/**
 * Handle conversation deletion
 */
async function handleDeleteConversation(conversationId: string) {
  try {
    // Show confirmation dialog before deleting
    const confirmed = await new Promise<boolean>((resolve) => {
      // Using Quasar dialog for confirmation
      $q.dialog({
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this conversation?',
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          resolve(true);
        })
        .onCancel(() => {
          resolve(false);
        });
    });

    if (!confirmed) return;

    // Show loading while deleting
    $q.loading.show({
      spinner: QSpinnerDots,
      message: 'Deleting conversation...',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    });

    // Call the API to delete the conversation
    await deleteConversation(conversationId);

    // Remove the conversation from the store
    chatStore.removeConversation(conversationId);

    // If the deleted conversation was active, clear the active chat
    if (activeChatId.value === conversationId) {
      chatStore.activeChatId = null;
    }

    // Show success notification
    $q.notify({
      icon: 'mdi-check-circle',
      message: 'Conversation deleted successfully',
      position: 'top',
      timeout: 2000,
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);

    // Show error notification
    $q.notify({
      icon: 'mdi-alert-circle',
      message: 'Failed to delete conversation',
      position: 'top',
      timeout: 2000,
    });
  } finally {
    $q.loading.hide();
  }
}
</script>

<style scoped>
/* Global font family to match landing page */
:deep(*) {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
}

.header-shadow {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

.drawer-sub-item {
  border-radius: 12px;
  margin: 3px 6px 3px 12px;
  padding: 8px 16px;
  transition: background-color 0.2s ease;
}

.drawer-sub-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.q-expansion-item__content) {
  padding: 0;
}

/* Settings dropdown styling */
.settings-dropdown {
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.settings-dropdown :deep(.q-item) {
  min-height: 32px;
}

.theme-item {
  min-height: 28px !important;
  font-size: 0.9rem;
}

.settings-dropdown :deep(.q-item__section--avatar) {
  min-width: 40px;
}
.main-toolbar {
  height: 64px;
}

.app-title {
  line-height: 1.5;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.05em;
}

.highlight {
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 800;
}
</style>
