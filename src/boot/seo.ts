import { boot } from 'quasar/wrappers';
import { getMetaConfig } from 'src/misc/seo-config';
import { watch } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

// This boot file adds SEO meta tag management
export default boot(({ router }) => {
  // Update meta tags when route changes
  const updateMetaTags = (to: RouteLocationNormalized) => {
    const metaConfig = getMetaConfig(to.path);
    
    // Update document title
    document.title = metaConfig.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metaConfig.description);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', metaConfig.keywords.join(', '));
    }
    
    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogType = document.querySelector('meta[property="og:type"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle) ogTitle.setAttribute('content', metaConfig.title);
    if (ogDescription) ogDescription.setAttribute('content', metaConfig.description);
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);
    if (ogType && metaConfig.ogType) ogType.setAttribute('content', metaConfig.ogType);
    if (ogImage && metaConfig.ogImage) {
      // Ensure absolute URL for OG image
      const baseUrl = window.location.origin;
      const imageUrl = metaConfig.ogImage.startsWith('http') 
        ? metaConfig.ogImage 
        : `${baseUrl}${metaConfig.ogImage}`;
      ogImage.setAttribute('content', imageUrl);
    }
    
    // Update Twitter meta tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    
    if (twitterTitle) twitterTitle.setAttribute('content', metaConfig.title);
    if (twitterDescription) twitterDescription.setAttribute('content', metaConfig.description);
    if (twitterUrl) twitterUrl.setAttribute('content', window.location.href);
    if (twitterImage && metaConfig.ogImage) {
      // Ensure absolute URL for Twitter image
      const baseUrl = window.location.origin;
      const imageUrl = metaConfig.ogImage.startsWith('http') 
        ? metaConfig.ogImage 
        : `${baseUrl}${metaConfig.ogImage}`;
      twitterImage.setAttribute('content', imageUrl);
    }
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.href);
    }
  };
  
  // Set initial meta tags
  void router.isReady().then(() => {
    updateMetaTags(router.currentRoute.value);
  });
  
  // Watch for route changes
  watch(
    () => router.currentRoute.value,
    (newRoute) => {
      updateMetaTags(newRoute);
    }
  );
});
