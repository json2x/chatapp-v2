import { boot } from 'quasar/wrappers';

// This boot file handles page speed optimizations
export default boot(() => {
  // Lazy load images when they enter the viewport
  const lazyLoadImages = () => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target as HTMLImageElement;
            if (lazyImage.dataset.src) {
              lazyImage.src = lazyImage.dataset.src;
              lazyImage.classList.remove('lazy-image');
              imageObserver.unobserve(lazyImage);
            }
          }
        });
      });

      const lazyImages = document.querySelectorAll('img.lazy-image');
      lazyImages.forEach((image) => {
        imageObserver.observe(image);
      });
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      const lazyImages = document.querySelectorAll('img.lazy-image');
      lazyImages.forEach((image) => {
        const lazyImage = image as HTMLImageElement;
        if (lazyImage.dataset.src) {
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy-image');
        }
      });
    }
  };

  // Defer non-critical CSS
  const deferNonCriticalCSS = () => {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"][data-defer="true"]');
    stylesheets.forEach((stylesheet) => {
      const link = stylesheet as HTMLLinkElement;
      link.setAttribute('media', 'print');
      link.setAttribute('onload', "this.media='all'");
    });
  };

  // Preconnect to important domains
  const addPreconnect = () => {
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://randomuser.me'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  };

  // Initialize optimizations when DOM is ready
  window.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
    deferNonCriticalCSS();
    addPreconnect();
  });
});
