// Performance Optimization Script for ECE Website
// Optimizes loading, rendering, and user interactions

(function() {
  'use strict';

  // ========================================
  // IMAGE OPTIMIZATION & LAZY LOADING
  // ========================================
  
  function optimizeImages() {
    // Add loading attributes to images that don't have them
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img, index) => {
      // First few images load eagerly, rest lazy
      img.loading = index < 3 ? 'eager' : 'lazy';
      img.decoding = 'async';
      
      // Add error handling
      img.addEventListener('error', function() {
        this.style.display = 'none';
        console.warn('Failed to load image:', this.src);
      });
      
      // Add load event for fade-in effect
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
    });
  }

  // ========================================
  // PRELOAD CRITICAL RESOURCES
  // ========================================
  
  function preloadCriticalResources() {
    const criticalImages = [
      '../images/activities/PRAVEEN J.jpeg',
      '../images/activities/KAVITHA K J.jpg',
      '../images/activities/ARUN KUMAR K M.jpg'
    ];
    
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // ========================================
  // PERFORMANCE MONITORING
  // ========================================
  
  function monitorPerformance() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with web-vitals library if available
      console.log('Performance monitoring active');
    }
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn('Long task detected:', entry.duration + 'ms');
            }
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Longtask API not supported
      }
    }
  }

  // ========================================
  // MEMORY OPTIMIZATION
  // ========================================
  
  function optimizeMemory() {
    // Clean up event listeners on page unload
    window.addEventListener('beforeunload', () => {
      // Remove all custom event listeners
      const elements = document.querySelectorAll('[data-cleanup]');
      elements.forEach(el => {
        el.removeEventListener('click', el._clickHandler);
        el.removeEventListener('scroll', el._scrollHandler);
      });
      
      // Clear any intervals
      if (window.performanceInterval) {
        clearInterval(window.performanceInterval);
      }
    });
  }

  // ========================================
  // SCROLL OPTIMIZATION
  // ========================================
  
  function optimizeScrolling() {
    let ticking = false;
    
    function updateOnScroll() {
      // Batch scroll-related DOM updates
      requestAnimationFrame(() => {
        // Update sticky header
        const header = document.querySelector('.site-header');
        if (header) {
          const scrolled = window.scrollY > 6;
          header.style.boxShadow = scrolled ? 'var(--shadow-light)' : 'none';
        }
        
        ticking = false;
      });
    }
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        updateOnScroll();
      }
    }, { passive: true });
  }

  // ========================================
  // FONT OPTIMIZATION
  // ========================================
  
  function optimizeFonts() {
    // Optimize font loading
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    }
    
    // Preload critical fonts
    const fontPreloads = [
      { family: 'Inter', weight: '400' },
      { family: 'Inter', weight: '600' },
      { family: 'Inter', weight: '700' }
    ];
    
    fontPreloads.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      // Note: Actual font URLs would need to be specified
      document.head.appendChild(link);
    });
  }

  // ========================================
  // ANIMATION OPTIMIZATION
  // ========================================
  
  function optimizeAnimations() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      document.body.classList.add('reduce-motion');
    }
    
    // Hover effects disabled to remove white circle cursor effect
    // const animatedElements = document.querySelectorAll('.faculty-card, .activity-card');
    // animatedElements.forEach(el => {
    //   el.addEventListener('mouseenter', () => {
    //     el.style.willChange = 'transform, box-shadow';
    //   });
    //   
    //   el.addEventListener('mouseleave', () => {
    //     el.style.willChange = 'auto';
    //   });
    // });
  }

  // ========================================
  // INTERSECTION OBSERVER OPTIMIZATION
  // ========================================
  
  function setupIntersectionObservers() {
    // Optimize reveal animations
    const revealElements = document.querySelectorAll('.reveal, .faculty-card');
    
    if ('IntersectionObserver' in window && revealElements.length > 0) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });
      
      revealElements.forEach(el => revealObserver.observe(el));
    }
  }

  // ========================================
  // INITIALIZATION
  // ========================================
  
  function initializeOptimizations() {
    optimizeImages();
    preloadCriticalResources();
    monitorPerformance();
    optimizeMemory();
    optimizeScrolling();
    optimizeFonts();
    optimizeAnimations();
    setupIntersectionObservers();
    
    console.log('✅ Performance optimizations initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOptimizations);
  } else {
    initializeOptimizations();
  }

  // Export for manual initialization if needed
  window.ECEPerformanceOptimizer = {
    init: initializeOptimizations,
    optimizeImages,
    preloadCriticalResources,
    monitorPerformance
  };

})();
