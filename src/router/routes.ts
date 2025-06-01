import type { RouteRecordRaw } from 'vue-router';
import { handleAuthCallback } from 'src/services/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/LandingPage.vue'),
  },

  {
    path: '/chat',
    component: () => import('layouts/ChatLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
    meta: { requiresAuth: true },
  },

  {
    path: '/test',
    component: () => import('pages/TestPage.vue'),
  },

  // Auth callback route to handle OAuth redirects
  {
    path: '/auth/callback',
    beforeEnter: async (to, from, next) => {
      // Process the OAuth callback
      const result = await handleAuthCallback();

      if (result.success) {
        // Redirect to chat page with clean URL
        next('/chat');
      } else {
        // Redirect to landing page if there was an error
        next('/');
      }
    },
    component: () => import('pages/LoadingPage.vue'), // Create a simple loading page
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
