interface MetaConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogType?: string;
}

interface RouteMetaConfig {
  [key: string]: MetaConfig;
}

// Default meta configuration
const defaultMeta: MetaConfig = {
  title: 'Mr Roboto Chat',
  description: 'A modern chat application with real-time messaging capabilities',
  keywords: ['chat app', 'messaging', 'real-time chat', 'secure messaging', 'Mr Roboto Chat'],
  ogImage: '/icons/icon-512x512.png',
  ogType: 'website'
};

// Route-specific meta configurations
const routeMeta: RouteMetaConfig = {
  '/': {
    title: 'Mr Roboto Chat - Modern Chat Application',
    description: 'Experience real-time messaging with our modern chat application. Secure, fast, and feature-rich platform for all your communication needs.',
    keywords: ['chat app', 'messaging', 'real-time chat', 'secure messaging', 'Mr Roboto Chat', 'home'],
    ogType: 'website'
  },
  '/login': {
    title: 'Login - Mr Roboto Chat',
    description: 'Log in to your Mr Roboto Chat account to start messaging securely.',
    keywords: ['login', 'sign in', 'chat account', 'Mr Roboto Chat login'],
    ogType: 'website'
  },
  '/privacy': {
    title: 'Privacy Policy - Mr Roboto Chat',
    description: 'Learn about our privacy policy and how we protect your data at Mr Roboto Chat.',
    keywords: ['privacy policy', 'data protection', 'Mr Roboto Chat privacy'],
    ogType: 'article'
  },
  '/terms': {
    title: 'Terms of Service - Mr Roboto Chat',
    description: 'Read our terms of service for using Mr Roboto Chat application.',
    keywords: ['terms of service', 'terms and conditions', 'Mr Roboto Chat terms'],
    ogType: 'article'
  },
  '/contact': {
    title: 'Contact Us - Mr Roboto Chat',
    description: 'Get in touch with the Mr Roboto Chat team for support or inquiries.',
    keywords: ['contact', 'support', 'help', 'Mr Roboto Chat contact'],
    ogType: 'website'
  }
};

/**
 * Get meta configuration for a specific route
 * @param route Route path
 * @returns Meta configuration for the route
 */
export const getMetaConfig = (route: string): MetaConfig => {
  return routeMeta[route] || defaultMeta;
};

export { defaultMeta };
