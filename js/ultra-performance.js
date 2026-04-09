// Ultra Performance Optimization Script
// Advanced performance optimizations for zero-lag experience

(function() {
  'use strict';

  // Performance monitoring
  const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
      if (entry.entryType === 'first-input') {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    }
  });

  try {
    perfObserver.observe({entryTypes: ['largest-contentful-paint', 'first-input']});
  } catch (e) {
    // Fallback for older browsers
  }

  // Advanced Image Lazy Loading with Intersection Observer
  class UltraImageLoader {
    constructor() {
      this.imageObserver = null;
      this.images = [];
      this.loadedImages = new Set();
      this.init();
    }

    init() {
      if ('IntersectionObserver' in window) {
        this.imageObserver = new IntersectionObserver(
          this.handleImageIntersection.bind(this),
          {
            root: null,
            rootMargin: '50px 0px',
            threshold: 0.01
          }
        );
        this.observeImages();
      } else {
        // Fallback for older browsers
        this.loadAllImages();
      }
    }

    observeImages() {
      this.images = document.querySelectorAll('img[loading="lazy"]');
      this.images.forEach(img => {
        if (!this.loadedImages.has(img.src)) {
          this.imageObserver.observe(img);
        }
      });
    }

    handleImageIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          this.imageObserver.unobserve(img);
        }
      });
    }

    loadImage(img) {
      return new Promise((resolve, reject) => {
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
          // Use requestAnimationFrame for smooth loading
          requestAnimationFrame(() => {
            img.src = imageLoader.src;
            img.classList.add('loaded');
            this.loadedImages.add(img.src);
            resolve(img);
          });
        };

        imageLoader.onerror = () => {
          img.style.display = 'none';
          reject(new Error(`Failed to load image: ${img.src}`));
        };

        imageLoader.src = img.dataset.src || img.src;
      });
    }

    loadAllImages() {
      this.images = document.querySelectorAll('img[loading="lazy"]');
      this.images.forEach(img => this.loadImage(img));
    }

    refresh() {
      this.observeImages();
    }
  }

  // Advanced Scroll Performance
  class UltraScrollOptimizer {
    constructor() {
      this.ticking = false;
      this.lastScrollY = 0;
      this.scrollDirection = 'down';
      this.init();
    }

    init() {
      // Use passive listeners for better performance
      window.addEventListener('scroll', this.handleScroll.bind(this), { 
        passive: true,
        capture: false
      });
    }

    handleScroll() {
      if (!this.ticking) {
        requestAnimationFrame(this.updateScroll.bind(this));
        this.ticking = true;
      }
    }

    updateScroll() {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      // Determine scroll direction
      this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
      this.lastScrollY = currentScrollY;

      // Update header shadow
      this.updateHeader(currentScrollY);
      
      // Update scroll-based animations
      this.updateScrollAnimations(currentScrollY);

      this.ticking = false;
    }

    updateHeader(scrollY) {
      const header = document.querySelector('.site-header');
      if (header) {
        const shouldHaveShadow = scrollY > 6;
        const currentShadow = header.style.boxShadow;
        const targetShadow = shouldHaveShadow ? 'var(--shadow-light)' : 'none';
        
        if (currentShadow !== targetShadow) {
          header.style.boxShadow = targetShadow;
        }
      }
    }

    updateScrollAnimations(scrollY) {
      // Add any scroll-based animations here
      const cards = document.querySelectorAll('.faculty-card');
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && !card.classList.contains('animate-in')) {
          // Stagger animation
          setTimeout(() => {
            card.classList.add('animate-in');
          }, index * 50);
        }
      });
    }
  }

  // Memory Management
  class MemoryOptimizer {
    constructor() {
      this.observers = [];
      this.timers = [];
      this.eventListeners = [];
      this.init();
    }

    init() {
      // Clean up on page unload
      window.addEventListener('beforeunload', this.cleanup.bind(this));
      
      // Monitor memory usage
      if ('memory' in performance) {
        this.monitorMemory();
      }
    }

    addObserver(observer) {
      this.observers.push(observer);
    }

    addTimer(timer) {
      this.timers.push(timer);
    }

    addEventListener(element, event, handler, options) {
      element.addEventListener(event, handler, options);
      this.eventListeners.push({ element, event, handler, options });
    }

    cleanup() {
      // Disconnect observers
      this.observers.forEach(observer => {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      });

      // Clear timers
      this.timers.forEach(timer => {
        clearTimeout(timer);
        clearInterval(timer);
      });

      // Remove event listeners
      this.eventListeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });

      // Clear arrays
      this.observers.length = 0;
      this.timers.length = 0;
      this.eventListeners.length = 0;
    }

    monitorMemory() {
      const checkMemory = () => {
        const memory = performance.memory;
        const used = memory.usedJSHeapSize / 1048576; // Convert to MB
        const limit = memory.jsHeapSizeLimit / 1048576;
        
        if (used / limit > 0.8) {
          console.warn('High memory usage detected:', used.toFixed(2), 'MB');
          this.optimizeMemory();
        }
      };

      setInterval(checkMemory, 30000); // Check every 30 seconds
    }

    optimizeMemory() {
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
      
      // Clear unused image cache
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.offsetParent && img.src) {
          img.removeAttribute('src');
        }
      });
    }
  }

  // Advanced Event Delegation
  class EventOptimizer {
    constructor() {
      this.delegatedEvents = new Map();
      this.init();
    }

    init() {
      // Set up optimized event delegation
      this.setupFacultyCardEvents();
      this.setupModalEvents();
    }

    setupFacultyCardEvents() {
      const container = document.body;
      
      // Use single delegated event listener
      container.addEventListener('click', (e) => {
        const card = e.target.closest('.faculty-card');
        if (card && !e.target.closest('.faculty-linkedin')) {
          e.preventDefault();
          const facultyName = card.getAttribute('data-faculty');
          if (facultyName && typeof openAchievementModal === 'function') {
            openAchievementModal(facultyName);
          }
        }
      }, { passive: false });

      // Hover effects disabled to remove white circle cursor effect
      // container.addEventListener('mouseenter', (e) => {
      //   const card = e.target.closest('.faculty-card');
      //   if (card) {
      //     card.classList.add('hover');
      //   }
      // }, { passive: true, capture: true });

      // container.addEventListener('mouseleave', (e) => {
      //   const card = e.target.closest('.faculty-card');
      //   if (card) {
      //     card.classList.remove('hover');
      //   }
      // }, { passive: true, capture: true });
    }

    setupModalEvents() {
      // Optimized modal events
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const modal = document.querySelector('.achievement-modal.active');
          if (modal && typeof closeAchievementModal === 'function') {
            closeAchievementModal();
          }
        }
      }, { passive: false });
    }
  }

  // Resource Preloader
  class ResourcePreloader {
    constructor() {
      this.preloadQueue = [];
      this.preloadedResources = new Set();
      this.init();
    }

    init() {
      // Preload critical resources
      this.preloadCriticalImages();
      this.preloadFonts();
    }

    preloadCriticalImages() {
      // Only preload images that are actually used on the current page
      const currentPage = window.location.pathname;
      
      // Only preload faculty images on faculty-related pages
      if (currentPage.includes('faculty') || currentPage.includes('about')) {
        const criticalImages = [
          '../images/activities/PRAVEEN J.jpeg',
          '../images/activities/KAVITHA K J.jpg',
          '../images/activities/ARUN KUMAR K M.jpeg'
        ];
        
        criticalImages.forEach(src => this.preloadImage(src));
      }
      
      // For index page, preload HOD image if it exists
      if (currentPage.includes('index.html') || currentPage === '/' || currentPage === '') {
        const hodImage = document.querySelector('.hod-photo img');
        if (hodImage && hodImage.src) {
          this.preloadImage(hodImage.src);
        }
      }
    }

    preloadImage(src) {
      if (this.preloadedResources.has(src)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      
      this.preloadedResources.add(src);
    }

    preloadFonts() {
      // Preload web fonts if any
      const fonts = document.querySelectorAll('link[rel="preload"][as="font"]');
      fonts.forEach(font => {
        if (!font.crossOrigin) {
          font.crossOrigin = 'anonymous';
        }
      });
    }
  }

  // Initialize all optimizations
  function initializeOptimizations() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeOptimizations);
      return;
    }

    // Initialize all optimizers
    const imageLoader = new UltraImageLoader();
    const scrollOptimizer = new UltraScrollOptimizer();
    const memoryOptimizer = new MemoryOptimizer();
    const eventOptimizer = new EventOptimizer();
    const resourcePreloader = new ResourcePreloader();

    // Add to global scope for debugging
    window.UltraPerformance = {
      imageLoader,
      scrollOptimizer,
      memoryOptimizer,
      eventOptimizer,
      resourcePreloader
    };

    console.log('🚀 Ultra Performance optimizations loaded');
  }

  // Start optimization
  initializeOptimizations();

})();
