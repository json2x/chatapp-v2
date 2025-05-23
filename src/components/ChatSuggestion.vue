<template>
  <q-card
    class="suggestion-card q-px-md q-py-sm cursor-pointer"
    bordered
    flat
    @click="$emit('select')"
  >
    <div class="text-subtitle2 text-weight-medium">{{ title }}</div>
    <div class="text-caption text-grey-7">{{ description }}</div>
  </q-card>
</template>

<script setup lang="ts">
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

.text-subtitle2 {
  font-size: 0.95rem;
  line-height: 1.4;
}

.text-caption {
  font-size: 0.85rem;
  line-height: 1.2;
}
</style>
