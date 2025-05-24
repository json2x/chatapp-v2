<template>
  <q-card
    class="suggestion-card q-px-md q-py-sm cursor-pointer"
    bordered
    flat
    @click="$emit('select')"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :style="isDark && isHovered ? 'background-color: #181818 !important' : ''"
  >
    <div class="text-subtitle2 text-weight-medium">{{ title }}</div>
    <div class="text-caption text-grey-7">{{ description }}</div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const isHovered = ref(false);
const isDark = computed(() => $q.dark.isActive);

defineProps<{
  title: string;
  description: string;
}>();

defineEmits<{
  (e: 'select'): void;
}>();
</script>

<style scoped>
.suggestion-card {
  min-width: 180px;
  max-width: 200px;
  height: 80px;
  border-radius: 12px;
  border: 1px solid #e0e0e0 !important;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.suggestion-card:hover {
  background-color: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

/* Dark mode styles */
:deep(.body--dark) .suggestion-card {
  background-color: #2c2c2c !important;
  border-color: #444 !important;
}

:deep(.body--dark) .suggestion-card:hover {
  background-color: #181818 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* Additional direct selector for hover in dark mode */
.body--dark .suggestion-card:hover {
  background-color: #181818 !important;
}

:deep(.body--dark) .text-grey-7 {
  color: rgba(255, 255, 255, 0.7) !important;
}

.text-subtitle2 {
  font-size: 0.95rem;
  line-height: 1.4;
}

.text-caption {
  font-size: 0.85rem;
  line-height: 1.2;
}
</style>
