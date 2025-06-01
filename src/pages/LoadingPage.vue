<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div class="text-h2">Processing Login</div>
      <q-spinner-dots size="5em" color="white" />
      <div class="text-subtitle1 q-mt-md">Please wait while we authenticate you...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// This component is just a loading screen while we process the OAuth callback
// The actual processing is done in the route's beforeEnter hook
onMounted(() => {
  console.log('LoadingPage mounted - OAuth callback processing...');
});
</script>
