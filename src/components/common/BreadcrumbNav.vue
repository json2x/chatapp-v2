<template>
  <nav 
    class="breadcrumb-nav" 
    aria-label="Breadcrumb"
    v-if="breadcrumbs.length > 0"
    itemscope 
    itemtype="https://schema.org/BreadcrumbList"
  >
    <ol class="breadcrumb-list">
      <li 
        v-for="(crumb, index) in breadcrumbs" 
        :key="index"
        class="breadcrumb-item"
        :class="{ 'active': index === breadcrumbs.length - 1 }"
        itemprop="itemListElement" 
        itemscope 
        itemtype="https://schema.org/ListItem"
      >
        <template v-if="index < breadcrumbs.length - 1">
          <a 
            :href="crumb.path" 
            itemprop="item"
            @click.prevent="navigateTo(crumb.path)"
          >
            <span itemprop="name">{{ crumb.name }}</span>
          </a>
        </template>
        <template v-else>
          <span itemprop="name">{{ crumb.name }}</span>
        </template>
        <meta itemprop="position" :content="String(index + 1)" />
        <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Breadcrumb {
  name: string;
  path: string;
}

const route = useRoute();
const router = useRouter();

// Map route paths to breadcrumb names
const pathMap: Record<string, string> = {
  '': 'Home',
  'login': 'Login',
  'register': 'Register',
  'chat': 'Chat',
  'settings': 'Settings',
  'privacy': 'Privacy Policy',
  'terms': 'Terms of Service',
  'contact': 'Contact',
  'about': 'About',
  'faq': 'FAQ'
};

// Generate breadcrumbs based on current route
const breadcrumbs = computed(() => {
  const crumbs: Breadcrumb[] = [];
  const pathParts = route.path.split('/').filter(Boolean);
  
  // Always add home as first breadcrumb
  crumbs.push({ name: 'Home', path: '/' });
  
  // Add breadcrumbs for each path segment
  let currentPath = '';
  for (const part of pathParts) {
    currentPath += `/${part}`;
    const name = pathMap[part] || part.charAt(0).toUpperCase() + part.slice(1);
    crumbs.push({ name, path: currentPath });
  }
  
  return crumbs;
});

// Navigate to path
const navigateTo = (path: string) => {
  void router.push(path); // Using void operator to handle the promise
};
</script>

<style scoped>
.breadcrumb-nav {
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.breadcrumb-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.9rem;
}

.breadcrumb-item a {
  color: #1976D2;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-item a:hover {
  color: #1565C0;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #1f2937;
  font-weight: 500;
}

.separator {
  margin: 0 0.5rem;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .breadcrumb-nav {
    padding: 0.75rem 0;
  }
  
  .breadcrumb-item {
    font-size: 0.8rem;
  }
}
</style>
