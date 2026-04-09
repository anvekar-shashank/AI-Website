// Gallery Optimizer - Ultra Performance Gallery with Click-to-Enlarge
(function() {
  'use strict';

  // Polyfill for inert attribute if not supported
  if (!('inert' in HTMLElement.prototype)) {
    Object.defineProperty(HTMLElement.prototype, 'inert', {
      enumerable: true,
      get: function() {
        return this.hasAttribute('inert');
      },
      set: function(value) {
        if (value) {
          this.setAttribute('inert', '');
        } else {
          this.removeAttribute('inert');
        }
      }
    });
  }

  class GalleryOptimizer {
    constructor() {
      this.modal = document.getElementById('galleryModal');
      this.modalTitle = document.getElementById('galleryModalTitle');
      this.modalTrack = document.getElementById('galleryModalTrack');
      this.modalPrev = document.getElementById('galleryModalPrev');
      this.modalNext = document.getElementById('galleryModalNext');
      this.modalIndicators = document.getElementById('galleryModalIndicators');
      this.modalClose = this.modal?.querySelector('.gallery-modal__close');
      this.modalBackdrop = this.modal?.querySelector('.gallery-modal__backdrop');
      
      this.currentImages = [];
      this.currentIndex = 0;
      this.autoplayInterval = null;
      this.isOpen = false;
      
      this.init();
    }

    init() {
      if (!this.modal) return;
      
      // Add performance optimizations to all gallery cards
      this.optimizeGalleryCards();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Add click handlers to all activity cards
      this.setupClickHandlers();
      
      console.log('🖼️ Gallery Optimizer initialized');
    }

    optimizeGalleryCards() {
      const activityCards = document.querySelectorAll('.activity-card');
      
      activityCards.forEach((card, index) => {
        // Add performance optimizations
        card.style.willChange = 'transform, box-shadow';
        card.style.backfaceVisibility = 'hidden';
        card.style.transform = 'translateZ(0)';
        
        // Hover effects disabled to remove white circle cursor effect
        
        // Optimize images within the card
        const images = card.querySelectorAll('img');
        images.forEach((img, imgIndex) => {
          // Add loading optimization
          if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', index < 3 ? 'eager' : 'lazy');
          }
          if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
          }
          
          // Add performance attributes
          img.style.imageRendering = 'crisp-edges';
          img.style.willChange = 'transform';
          
          // Preload first few images
          if (index < 2 && imgIndex === 0) {
            img.setAttribute('fetchpriority', 'high');
          }
        });
      });
    }

    setupEventListeners() {
      // Close modal events
      this.modalClose?.addEventListener('click', () => this.closeModal());
      this.modalBackdrop?.addEventListener('click', () => this.closeModal());
      
      // Navigation events
      this.modalPrev?.addEventListener('click', () => this.previousImage());
      this.modalNext?.addEventListener('click', () => this.nextImage());
      
      // Keyboard events
      document.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;
        
        switch (e.key) {
          case 'Escape':
            this.closeModal();
            break;
          case 'ArrowLeft':
            this.previousImage();
            break;
          case 'ArrowRight':
            this.nextImage();
            break;
        }
      });
      
      // Touch/swipe support
      let startX = null;
      let startY = null;
      
      this.modalTrack?.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });
      
      this.modalTrack?.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = startX - endX;
        const deltaY = startY - endY;
        
        // Only trigger if horizontal swipe is more significant than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            this.nextImage();
          } else {
            this.previousImage();
          }
        }
        
        startX = null;
        startY = null;
      }, { passive: true });
    }

    setupClickHandlers() {
      const activityCards = document.querySelectorAll('.activity-card');
      
      activityCards.forEach(card => {
        card.addEventListener('click', (e) => {
          // Prevent if clicking on slideshow controls
          if (e.target.closest('.gallery-slideshow__indicators') || 
              e.target.closest('[data-prev]') || 
              e.target.closest('[data-next]')) {
            return;
          }
          
          this.openModal(card);
        });
      });
    }

    openModal(card) {
      const title = card.querySelector('.activity-card__title')?.textContent || 'Gallery';
      const images = Array.from(card.querySelectorAll('.gallery-slideshow__slide img'));
      
      if (images.length === 0) return;
      
      this.currentImages = images.map(img => ({
        src: img.src,
        alt: img.alt || title
      }));
      
      this.currentIndex = 0;
      this.modalTitle.textContent = title;
      
      console.log('Opening modal with images:', this.currentImages);
      
      // Remove inert first to allow content to load
      this.modal.removeAttribute('inert');
      
      // Build modal content
      this.buildModalContent();
      
      // Show modal with animation
      requestAnimationFrame(() => {
        this.modal.classList.add('gallery-modal--active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        // Preload adjacent images for better performance
        this.preloadAdjacentImages();
        
        // Start autoplay
        this.startAutoplay();
        
        // Focus management - delay focus until modal is fully visible
        setTimeout(() => {
          this.modalClose?.focus();
        }, 100);
      });
    }

    preloadAdjacentImages() {
      if (this.currentImages.length <= 1) return;

      const preloadImage = (src) => {
        if (!src) return;

        // Check if image is already preloaded or in cache
        const img = new Image();
        img.onload = () => {
          // Image loaded successfully
        };
        img.onerror = () => {
          console.warn('Failed to preload image:', src);
        };
        img.src = src;
      };

      // Preload current, next, and previous images
      const currentIndex = this.currentIndex;
      const totalImages = this.currentImages.length;

      // Preload current image
      preloadImage(this.currentImages[currentIndex]?.src);

      // Preload next image
      const nextIndex = (currentIndex + 1) % totalImages;
      preloadImage(this.currentImages[nextIndex]?.src);

      // Preload previous image
      const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
      preloadImage(this.currentImages[prevIndex]?.src);

      // Preload image after next for better UX
      const nextNextIndex = (currentIndex + 2) % totalImages;
      preloadImage(this.currentImages[nextNextIndex]?.src);
    }

    buildModalContent() {
      // Clear existing content
      this.modalTrack.innerHTML = '';
      this.modalIndicators.innerHTML = '';

      // Build slides
      this.currentImages.forEach((imageData, index) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-modal__slide';
        
        // Create image element with eager loading for modal
        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt;
        img.loading = 'eager'; // Force eager loading in modal
        img.decoding = 'async';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.maxHeight = '70vh';
        img.style.objectFit = 'contain';
        img.style.display = 'block';
        
        // Add loading event listeners with retry logic
        img.addEventListener('load', () => {
          console.log('Image loaded successfully:', imageData.src);
        });
        
        img.addEventListener('error', (e) => {
          console.warn('Image load failed, retrying:', imageData.src);
          // Retry loading the image once
          setTimeout(() => {
            img.src = imageData.src;
          }, 100);
        });
        
        slide.appendChild(img);
        this.modalTrack.appendChild(slide);

        // Build indicators
        const indicator = document.createElement('button');
        indicator.className = `gallery-modal__indicator ${index === 0 ? 'active' : ''}`;
        indicator.setAttribute('data-index', index);
        indicator.setAttribute('aria-label', `Go to image ${index + 1}`);
        indicator.addEventListener('click', () => this.goToImage(index));
        this.modalIndicators.appendChild(indicator);
      });

      // Update navigation visibility
      this.updateNavigation();
    }

    updateNavigation() {
      const hasMultipleImages = this.currentImages.length > 1;

      if (this.modalPrev) {
        this.modalPrev.style.display = hasMultipleImages ? 'block' : 'none';
      }
      if (this.modalNext) {
        this.modalNext.style.display = hasMultipleImages ? 'block' : 'none';
      }

      // Update indicators
      const indicators = this.modalIndicators.querySelectorAll('.gallery-modal__indicator');
      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === this.currentIndex);
      });

      // Update track position
      this.modalTrack.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }

    previousImage() {
      if (this.currentImages.length <= 1) return;

      this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
      this.updateNavigation();
      this.restartAutoplay();

      // Preload adjacent images for smoother navigation
      this.preloadAdjacentImages();
    }

    nextImage() {
      if (this.currentImages.length <= 1) return;

      this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;
      this.updateNavigation();
      this.restartAutoplay();

      // Preload adjacent images for smoother navigation
      this.preloadAdjacentImages();
    }

    startAutoplay() {
      this.stopAutoplay();
      
      if (this.currentImages.length <= 1) return;
      
      this.autoplayInterval = setInterval(() => {
        this.nextImage();
      }, 4000); // 4 seconds per slide
    }

    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    }

    restartAutoplay() {
      this.stopAutoplay();
      this.startAutoplay();
    }

    closeModal() {
      if (!this.isOpen) return;
      
      this.stopAutoplay();
      
      requestAnimationFrame(() => {
        this.modal.setAttribute('inert', '');
        this.modal.classList.remove('gallery-modal--active');
        document.body.style.overflow = '';
        this.isOpen = false;

        // Clear content after animation
        setTimeout(() => {
          this.modalTrack.innerHTML = '';
          this.modalIndicators.innerHTML = '';
          this.currentImages = [];
          this.currentIndex = 0;
        }, 300);
      });
    }
  }

  // Enhanced Activity Card Performance
  class ActivityCardOptimizer {
    constructor() {
      this.cards = document.querySelectorAll('.activity-card');
      this.observedCards = new Set();
      this.init();
    }

    init() {
      this.optimizeCards();
      this.setupIntersectionObserver();
      this.optimizeSlideShows();
    }

    optimizeCards() {
      this.cards.forEach((card, index) => {
        // Add performance CSS
        card.style.contain = 'layout style paint';
        card.style.willChange = 'transform, box-shadow';
        card.style.isolation = 'isolate';
        
        // Optimize transitions
        card.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Add staggered animation delay
        card.style.animationDelay = `${index * 100}ms`;
      });
    }

    setupIntersectionObserver() {
      if (!('IntersectionObserver' in window)) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const card = entry.target;
          
          if (entry.isIntersecting && !this.observedCards.has(card)) {
            this.observedCards.add(card);
            this.activateCard(card);
          } else if (!entry.isIntersecting && this.observedCards.has(card)) {
            this.deactivateCard(card);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px 0px'
      });
      
      this.cards.forEach(card => observer.observe(card));
    }

    activateCard(card) {
      // Start slideshow if it exists
      const slideshow = card.querySelector('[data-slider]');
      if (slideshow && !slideshow.__activated) {
        slideshow.__activated = true;
        
        // Trigger slideshow initialization if not already done
        if (typeof initSlider === 'function') {
          initSlider(slideshow);
        }
      }
      
      // Add active class for animations
      card.classList.add('activity-card--active');
    }

    deactivateCard(card) {
      // Pause slideshow to save resources
      const slideshow = card.querySelector('[data-slider]');
      if (slideshow && slideshow.__activated) {
        // Pause autoplay when out of view
        const event = new CustomEvent('pauseSlideshow');
        slideshow.dispatchEvent(event);
      }
    }

    optimizeSlideShows() {
      const slideshows = document.querySelectorAll('.gallery-slideshow');
      
      slideshows.forEach(slideshow => {
        // Add performance optimizations
        slideshow.style.willChange = 'transform';
        slideshow.style.contain = 'layout style paint';
        
        const track = slideshow.querySelector('.gallery-slideshow__track');
        if (track) {
          track.style.willChange = 'transform';
          track.style.backfaceVisibility = 'hidden';
        }
        
        // Optimize images
        const images = slideshow.querySelectorAll('img');
        images.forEach((img, index) => {
          img.style.willChange = 'transform, opacity';
          img.style.imageRendering = 'crisp-edges';
          
          // Add loading states
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          }, { once: true });
          
          if (img.complete) {
            img.classList.add('loaded');
          }
        });
      });
    }
  }

  // Initialize when DOM is ready
  function initialize() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
      return;
    }
    
    // Initialize optimizers
    const galleryOptimizer = new GalleryOptimizer();
    const cardOptimizer = new ActivityCardOptimizer();
    
    // Add to global scope for debugging
    window.GalleryOptimizer = {
      gallery: galleryOptimizer,
      cards: cardOptimizer
    };
    
    console.log('🚀 Gallery optimization complete');
  }
  
  initialize();
})();
