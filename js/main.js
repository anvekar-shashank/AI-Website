// GM University – ECE Department interactions (vanilla JS)
(function(){
  'use strict';

  const buildGmailComposeUrl = (email, params = new URLSearchParams()) => {
    if (!email) return '';
    const normalizedParams = params instanceof URLSearchParams
      ? params
      : new URLSearchParams(params);
    let url = `https://mail.google.com/mail/?fs=1&tf=cm&to=${encodeURIComponent(email)}`;
    const subject = normalizedParams.get('subject') || normalizedParams.get('su');
    const body = normalizedParams.get('body');
    const cc = normalizedParams.get('cc');
    const bcc = normalizedParams.get('bcc');

    if (subject) url += `&su=${encodeURIComponent(subject)}`;
    if (body) url += `&body=${encodeURIComponent(body)}`;
    if (cc) url += `&cc=${encodeURIComponent(cc)}`;
    if (bcc) url += `&bcc=${encodeURIComponent(bcc)}`;

    return url;
  };

  window.buildGmailComposeUrl = buildGmailComposeUrl;

  // Check if we should scroll to footer (when coming back from other pages)
  if (sessionStorage.getItem('scrollToFooter') === 'true') {
    // Clear the flag
    sessionStorage.removeItem('scrollToFooter');

    // Scroll to footer after page loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        const footer = document.querySelector('.site-footer');
        if (footer) {
          footer.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    });
  }

  // Nav active state handling
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(l => l.addEventListener('click', function(){
    navLinks.forEach(n => n.classList.remove('nav__link--active'));
    this.classList.add('nav__link--active');
  }));

  const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
  if (mailtoLinks.length) {
    mailtoLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const cleaned = href.replace(/^mailto:/i, '');
      const [email, query] = cleaned.split('?');
      if (!email) return;

      const gmailUrl = buildGmailComposeUrl(email.trim(), new URLSearchParams(query || ''));
      if (!gmailUrl) return;

      link.setAttribute('href', gmailUrl);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    });
  }

  const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;

  const linkifyTextEmails = (root = document.body) => {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = (node.nodeValue || '').trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        if (!EMAIL_REGEX.test(text)) return NodeFilter.FILTER_REJECT;
        EMAIL_REGEX.lastIndex = 0;
        if (node.parentElement && node.parentElement.closest('a, script, style')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((textNode) => {
      const text = textNode.nodeValue || '';
      let match;
      let lastIndex = 0;
      EMAIL_REGEX.lastIndex = 0;

      const frag = document.createDocumentFragment();
      while ((match = EMAIL_REGEX.exec(text)) !== null) {
        const email = match[0];
        const start = match.index;
        const end = start + email.length;

        if (start > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
        }

        const link = document.createElement('a');
        link.href = buildGmailComposeUrl(email);
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = email;
        frag.appendChild(link);

        lastIndex = end;
      }

      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      if (textNode.parentNode) {
        textNode.parentNode.replaceChild(frag, textNode);
      }
    });
  };

  linkifyTextEmails();

  // Modal handling for project media
  const modal = document.querySelector('.modal--media');
  const openers = document.querySelectorAll('.project__thumb');
  const closers = document.querySelectorAll('[data-modal-close]');
  const setModal = (open) => {
    if(!modal) return;
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    if(open) modal.querySelector('.modal__close')?.focus();
  };
  openers.forEach(o => {
    o.addEventListener('click', () => setModal(true));
    o.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModal(true); } });
  });
  closers.forEach(c => c.addEventListener('click', () => setModal(false)));

  // Simple placeholder chart painting (no external libs)
  const canvas = document.querySelector('.chart--placements__canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;
    const data = [60, 72, 80, 90, 95];
    const barW = Math.min(60, (w / data.length) - 20);
    const maxV = Math.max(...data);
    ctx.clearRect(0,0,w,h);
    data.forEach((v, i) => {
      const x = 20 + i * (barW + 20);
      const y = h - (v / maxV) * (h - 30);
      const height = h - y - 10;
      // Bar background
      ctx.fillStyle = '#EEF4FB';
      ctx.fillRect(x, 10, barW, h - 20);
      // Bar value (brand gradient simulated by two rects)
      const half = height * 0.55;
      ctx.fillStyle = '#0A4D8C';
      ctx.fillRect(x, y + (height - half), barW, half);
      ctx.fillStyle = '#06345B';
      ctx.fillRect(x, y, barW, height - half);
    });
    // Axis line
    ctx.strokeStyle = '#A9B8CE';
    ctx.beginPath(); ctx.moveTo(10, h-10); ctx.lineTo(w-10, h-10); ctx.stroke();
  }

  // Filters placeholder (faculty)
  const filterSelect = document.getElementById('filter-designation');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      // In real usage, filter faculty tiles by data attributes
      console.log('Filter designation:', filterSelect.value);
    });
  }

  // Optimized sticky header with throttled scroll handling
  const header = document.querySelector('.site-header');
  if (header) {
    header.classList.add('site-header--sticky');
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = (window.scrollY || document.documentElement.scrollTop) > 6;
          header.style.boxShadow = scrolled ? 'var(--shadow-light)' : 'none';
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveal micro-interaction using IntersectionObserver
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reveals.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      // Fallback: show all immediately
      reveals.forEach(el => el.classList.add('reveal--visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
      reveals.forEach(el => io.observe(el));
    }
  }

  // Enhanced Slider System for all slideshows
  function initSlider(slider) {
    // Robust detection for both hero slider and gallery sliders
    const track = slider.querySelector('.gallery-slideshow__track') || slider.querySelector('.slider__track');
    let slides = Array.from(slider.querySelectorAll('.gallery-slideshow__slide'));
    if (!slides.length) slides = Array.from(slider.querySelectorAll('.slider__slide'));
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    // Build indicators dynamically to match slide count
    const indicatorsContainer = slider.querySelector('.gallery-slideshow__indicators') || slider.querySelector('.slider__indicators');
    let indicators = [];
    if (indicatorsContainer) {
      indicatorsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = (indicatorsContainer.classList.contains('slider__indicators') ? 'slider__indicator' : 'gallery-slideshow__indicator') + (i === 0 ? ' active' : '');
        btn.setAttribute('data-slide', String(i));
        indicatorsContainer.appendChild(btn);
      });
      indicators = Array.from(indicatorsContainer.querySelectorAll('button'));
    }
    
    if (!slides.length) return;
    
    let index = 0;
    let timerId = null;
    const duration = 3000; // Optimized: slower autoplay reduces CPU usage and improves performance
    
    const updateIndicators = () => {
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
    };
    
    // On-demand image loader
    const loadImg = (img) => {
      if (!img) return;
      if (img.dataset && img.dataset.src && !img.__loaded) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.__loaded = true;
      }
    };
    const getSlideImg = (idx) => {
      const slide = slides[(idx + slides.length) % slides.length];
      return slide ? slide.querySelector('img') : null;
    };
    const setIndex = (i) => { 
      index = (i + slides.length) % slides.length; 
      // Lazy-load only current, previous, next
      loadImg(getSlideImg(index));
      loadImg(getSlideImg(index - 1));
      loadImg(getSlideImg(index + 1));
      track.style.transform = `translateX(-${index * 100}%)`;
      updateIndicators();
    };
    
    const start = () => { 
      if (timerId) return; 
      timerId = setInterval(() => setIndex(index + 1), duration); 
    };
    
    const stop = () => { 
      clearInterval(timerId); 
      timerId = null; 
    };
    
    // Control buttons
    prev?.addEventListener('click', () => { stop(); setIndex(index - 1); start(); });
    next?.addEventListener('click', () => { stop(); setIndex(index + 1); start(); });
    
    // Indicators
    indicators.forEach((indicator, i) => {
      indicator.addEventListener('click', () => { stop(); setIndex(i); start(); });
    });
    
    // Hover pause
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    
    // Keyboard support
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { stop(); setIndex(index - 1); start(); }
      if (e.key === 'ArrowRight') { stop(); setIndex(index + 1); start(); }
    });
    
    // Touch support
    let startX = null;
    slider.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; stop(); }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      if (startX == null) return; 
      const dx = e.changedTouches[0].clientX - startX; 
      startX = null;
      if (Math.abs(dx) > 40) { setIndex(index + (dx < 0 ? 1 : -1)); }
      start();
    });
    
    // Prepare initial lazy state: keep only first three images sourced
    const isHeroSlider = slider.getAttribute('data-slider') === 'main';
    
    slides.forEach((slide, i) => {
      const img = slide.querySelector('img');
      if (!img) return;
      
      // For hero slider, load all images eagerly; for other sliders, use lazy loading
      if (isHeroSlider) {
        // Hero slider: all images load immediately
        img.setAttribute('loading', 'eager');
        img.setAttribute('decoding', 'async');
        img.setAttribute('fetchpriority', i === 0 ? 'high' : 'auto');
      } else {
        // Gallery sliders: use lazy loading optimization
        if (!img.hasAttribute('loading')) img.setAttribute('loading', i === 0 ? 'eager' : 'lazy');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
        if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', i === 0 ? 'high' : 'low');
        
        // Defer far images by removing src
        const isNear = (i === 0 || i === 1 || i === slides.length - 1);
        if (!isNear && img.getAttribute('src')) {
          img.setAttribute('data-src', img.getAttribute('src'));
          img.removeAttribute('src');
        }
      }
    });

    // Initialize
    setIndex(0); 
    updateIndicators();
    start();

    // Pause autoplay when page/tab is hidden; resume when visible
    const onVisibility = () => {
      if (document.hidden) { stop(); } else { start(); }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Pause when this slider is not visible in viewport; resume when visible
    const viewObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      });
    }, { threshold: 0.2 });
    viewObserver.observe(slider);
    // Clean up on slider removal
    const observer = new MutationObserver((muts) => {
      muts.forEach(m => {
        if (m.type === 'childList') {
          if (!document.body.contains(slider)) {
            document.removeEventListener('visibilitychange', onVisibility);
            viewObserver.disconnect();
            observer.disconnect();
            stop();
          }
        }
      })
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Lazily initialize sliders when they enter the viewport
  const sliders = document.querySelectorAll('[data-slider]');
  if (sliders.length) {
    const initIfNeeded = (entry) => {
      const el = entry.target;
      if (entry.isIntersecting && !el.__sliderInitialized) {
        el.__sliderInitialized = true;
        initSlider(el);
      }
    };
    const sliderObserver = new IntersectionObserver((entries) => {
      entries.forEach(initIfNeeded);
    }, { threshold: 0.1 });

    sliders.forEach(slider => {
      // Initialize hero slider immediately for better performance
      if (slider.getAttribute('data-slider') === 'main') {
        slider.__sliderInitialized = true;
        initSlider(slider);
      } else {
        sliderObserver.observe(slider);
      }
    });
  }

  // Autoplay/pause department videos on scroll
  const autoVideos = Array.from(document.querySelectorAll('video[data-autoplay-video]'));
  if (autoVideos.length) {
    const playVisible = (entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          // Attempt play (muted required for autoplay policies)
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    };
    const io = new IntersectionObserver(playVisible, { threshold: [0, 0.25, 0.6, 1] });
    autoVideos.forEach(v => io.observe(v));
    // Pause on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) autoVideos.forEach(v => v.pause());
    });
  }
  // Photo upload functionality
  function uploadPhoto(category) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const galleryTile = document.querySelector(`[data-category="${category}"]`);
          const img = galleryTile.querySelector('.gallery-tile__image img');
          img.src = e.target.result;
          img.alt = `${category} uploaded photo`;
          
          // Show success message
          showUploadSuccess(category);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  // Show upload success message
  function showUploadSuccess(category) {
    const message = document.createElement('div');
    message.className = 'upload-success-message';
    message.innerHTML = `✅ Photo uploaded successfully for ${category}!`;
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--gmu-success);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      font-weight: 600;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  // Make uploadPhoto function globally available
  window.uploadPhoto = uploadPhoto;

  // Gallery Modal functionality
  const galleryModal = document.getElementById('galleryModal');
  const modalBackdrop = galleryModal?.querySelector('.gallery-modal__backdrop');
  const modalClose = galleryModal?.querySelector('.gallery-modal__close');
  const modalTitle = galleryModal?.querySelector('.gallery-modal__title');
  const modalTrack = galleryModal?.querySelector('.gallery-modal__track');
  let modalSliderInterval = null;
  let modalCurrentIndex = 0;
  let modalImages = [];

  function openGalleryModal(title, images) {
    if (!galleryModal) return;
    
    modalTitle.textContent = title;
    modalImages = images;
    modalCurrentIndex = 0;
    
    // Build modal slideshow
    modalTrack.innerHTML = '';
    images.forEach(imgSrc => {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = title;
      modalTrack.appendChild(img);
    });
    
    // Show modal
    galleryModal.removeAttribute('inert');
    document.body.style.overflow = 'hidden';
    
    // Start auto slideshow
    startModalSlideshow();
  }

  function closeGalleryModal() {
    if (!galleryModal) return;
    galleryModal.setAttribute('inert', '');
    document.body.style.overflow = '';
    stopModalSlideshow();
  }

  function startModalSlideshow() {
    stopModalSlideshow();
    if (modalImages.length <= 1) return;
    
    modalSliderInterval = setInterval(() => {
      modalCurrentIndex = (modalCurrentIndex + 1) % modalImages.length;
      modalTrack.style.transform = `translateX(-${modalCurrentIndex * 100}%)`;
    }, 2000);
  }

  function stopModalSlideshow() {
    if (modalSliderInterval) {
      clearInterval(modalSliderInterval);
      modalSliderInterval = null;
    }
  }

  // Gallery click handlers for modal pop-up
  const galleryItems = document.querySelectorAll('.gallery-grid-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const title = this.querySelector('.gallery-item__title')?.textContent || 'Gallery';
      const slides = this.querySelectorAll('.gallery-slideshow__slide img');
      const images = Array.from(slides).map(img => img.src);
      
      if (images.length > 0) {
        openGalleryModal(title, images);
      }
    });
  });

  // Activity card click handlers for modal pop-up
  const activityCards = document.querySelectorAll('.activity-card');
  activityCards.forEach(card => {
    card.addEventListener('click', function(e) {
      const title = this.querySelector('.activity-card__title')?.textContent || 'Activity';
      const slides = this.querySelectorAll('.gallery-slideshow__slide img');
      const images = Array.from(slides).map(img => img.src);
      
      if (images.length > 0) {
        openGalleryModal(title, images);
      }
    });
  });

  // Close modal handlers
  modalClose?.addEventListener('click', closeGalleryModal);
  modalBackdrop?.addEventListener('click', closeGalleryModal);

  // Chatbox functionality
  // WhatsApp contact number (format: country code + number without + or spaces)
  const contactNumber = '918884767555'; // India +91 8884767555

  const chatbox = document.getElementById('chatbox');
  const chatboxToggle = document.getElementById('chatboxToggle');
  const chatboxPanel = document.getElementById('chatboxPanel');
  const chatboxClose = document.getElementById('chatboxClose');
  const chatboxForm = document.getElementById('chatboxForm');
  const chatboxMessage = document.getElementById('chatboxMessage');

  // Back to Home buttons - scroll to footer section
  const backToHomeButtons = document.querySelectorAll('.back-button, a[href*="index.html"]');
  backToHomeButtons.forEach(button => {
    const textContent = button.textContent.toLowerCase();
    const href = button.href || '';

    // Check if this is a "Back to Home" button
    if (textContent.includes('back to home') ||
        textContent.includes('← back to home') ||
        href.includes('index.html')) {

      button.addEventListener('click', function(e) {
        e.preventDefault();

        // Set a flag in sessionStorage to indicate footer scroll is needed
        sessionStorage.setItem('scrollToFooter', 'true');

        // Navigate to home page
        window.location.href = '../index.html';
      });
    }
  });

  // Toggle chatbox
  chatboxToggle?.addEventListener('click', () => {
    chatboxPanel.classList.toggle('chatbox__panel--open');
    if (chatboxPanel.classList.contains('chatbox__panel--open')) {
      chatboxMessage.focus();
    } else {
      chatboxMessage.blur();
    }
  });

  // Close chatbox
  chatboxClose?.addEventListener('click', () => {
    chatboxPanel.classList.remove('chatbox__panel--open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (chatbox && chatboxPanel && !chatbox.contains(e.target) && chatboxPanel.classList.contains('chatbox__panel--open')) {
      chatboxPanel.classList.remove('chatbox__panel--open');
    }
  });

  // Handle form submission
  chatboxForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = chatboxMessage.value.trim();
    if (message) {
      const encodedMessage = encodeURIComponent(
        `Hello! I have a question about ECE at GM University:\n\n${message}`
      );

      // Try to open WhatsApp app first, fallback to web
      const whatsappAppURL = `whatsapp://send?phone=${contactNumber}&text=${encodedMessage}`;
      const whatsappWebURL = `https://wa.me/${contactNumber}?text=${encodedMessage}`;

      // Attempt to open the app
      const appWindow = window.open(whatsappAppURL, '_blank');

      // Fallback to web after a short delay if app doesn't open
      setTimeout(() => {
        // If app didn't open (appWindow is null or closed), open web version
        if (!appWindow || appWindow.closed || appWindow.closed === undefined) {
          window.open(whatsappWebURL, '_blank');
        }
      }, 500);

      // Close chatbox and reset form
      chatboxPanel.classList.remove('chatbox__panel--open');
      chatboxMessage.value = '';

      // Show success message
      showChatSuccess();
    }
  });

  // Success message function
  function showChatSuccess() {
    const message = document.createElement('div');
    message.className = 'chat-success-message';
    message.innerHTML = '✅ Message sent to WhatsApp!';
    message.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: var(--gmu-success, #10B981);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1001;
      font-weight: 600;
    `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  // ========================================
  // OPTIMIZED LAZY IMAGE LOADING
  // ========================================
  
  // Intersection Observer for lazy-loaded images
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window && lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Add loaded class when image finishes loading
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
          
          // If already cached, mark as loaded immediately
          if (img.complete) {
            img.classList.add('loaded');
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback: mark all lazy images as loaded immediately
    lazyImages.forEach(img => img.classList.add('loaded'));
  }

  // ========================================
  // GALLERY PERFORMANCE OPTIMIZATION
  // ========================================
  
  // Pause all slideshows that are not visible to save CPU
  const allSlideshows = document.querySelectorAll('[data-slider]');
  const slideshowStates = new Map();
  
  if (allSlideshows.length > 0 && 'IntersectionObserver' in window) {
    const slideshowVisibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const slider = entry.target;
        const wasVisible = slideshowStates.get(slider);
        
        if (entry.isIntersecting && !wasVisible) {
          // Slideshow entered viewport - it will be initialized by existing lazy init system
          slideshowStates.set(slider, true);
        } else if (!entry.isIntersecting && wasVisible) {
          // Slideshow left viewport - pause it if running
          slideshowStates.set(slider, false);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px 0px'
    });
    
    allSlideshows.forEach(slideshow => {
      slideshowStates.set(slideshow, false);
      slideshowVisibilityObserver.observe(slideshow);
    });
  }

  // ========================================
  // FACULTY PROFILE MODAL FUNCTIONALITY
  // ========================================
  
  // Only run on faculty page
  if (window.location.pathname.includes('faculty.html') && typeof facultyProfiles !== 'undefined') {
    const modal = document.getElementById('facultyModal');
    const modalClose = modal?.querySelector('.faculty-modal__close');
    const modalBackdrop = modal?.querySelector('.faculty-modal__backdrop');
    
    // Function to open modal with faculty data
    function openFacultyModal(facultyName) {
      const profile = facultyProfiles[facultyName];
      
      if (!profile || !modal) return;
      
      // Populate header information
      document.getElementById('modalPhoto').src = profile.photo || '';
      document.getElementById('modalName').textContent = profile.name;
      document.getElementById('modalDesignation').textContent = profile.designation;
      
      // Populate contact information
      const emailEl = document.getElementById('modalEmail');
      const phoneEl = document.getElementById('modalPhone');
      
      if (profile.email) {
        const gmailUrl = buildGmailComposeUrl(profile.email);
        emailEl.innerHTML = `<a href="${gmailUrl}" target="_blank" rel="noopener">${profile.email}</a>`;
      } else {
        emailEl.innerHTML = '';
      }
      phoneEl.innerHTML = profile.phone ? `<a href="tel:${profile.phone}">${profile.phone}</a>` : '';
      
      // Populate LinkedIn
      const linkedInEl = document.getElementById('modalLinkedIn');
      if (profile.linkedin) {
        linkedInEl.innerHTML = `<a href="${profile.linkedin}" target="_blank" rel="noopener">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          LinkedIn Profile
        </a>`;
      } else {
        linkedInEl.innerHTML = '';
      }
      
      // Populate Education
      const educationSection = document.getElementById('modalEducationSection');
      const educationContent = document.getElementById('modalEducation');
      if (profile.education && profile.education.length > 0) {
        educationContent.innerHTML = '<ul>' + 
          profile.education.map(edu => `<li>${edu}</li>`).join('') + 
          '</ul>';
        educationSection.style.display = 'block';
      } else {
        educationSection.style.display = 'none';
      }
      
      // Populate Experience
      const experienceSection = document.getElementById('modalExperienceSection');
      const experienceContent = document.getElementById('modalExperience');
      if (profile.experience) {
        experienceContent.innerHTML = `<p>${profile.experience}</p>`;
        experienceSection.style.display = 'block';
      } else {
        experienceSection.style.display = 'none';
      }
      
      // Populate Specialization
      const specializationSection = document.getElementById('modalSpecializationSection');
      const specializationContent = document.getElementById('modalSpecialization');
      if (profile.specialization && profile.specialization.length > 0) {
        specializationContent.innerHTML = '<ul>' + 
          profile.specialization.map(spec => `<li>${spec}</li>`).join('') + 
          '</ul>';
        specializationSection.style.display = 'block';
      } else {
        specializationSection.style.display = 'none';
      }
      
      // Populate Publications
      const publicationsSection = document.getElementById('modalPublicationsSection');
      const publicationsContent = document.getElementById('modalPublications');
      if (profile.publications && profile.publications.length > 0) {
        publicationsContent.innerHTML = '<ul>' + 
          profile.publications.map(pub => `<li>${pub}</li>`).join('') + 
          '</ul>';
        publicationsSection.style.display = 'block';
      } else {
        publicationsSection.style.display = 'none';
      }
      
      // Populate Certifications
      const certificationsSection = document.getElementById('modalCertificationsSection');
      const certificationsContent = document.getElementById('modalCertifications');
      if (profile.certifications && profile.certifications.length > 0) {
        certificationsContent.innerHTML = '<ul>' + 
          profile.certifications.map(cert => `<li>${cert}</li>`).join('') + 
          '</ul>';
        certificationsSection.style.display = 'block';
      } else {
        certificationsSection.style.display = 'none';
      }
      
      // Populate Awards
      const awardsSection = document.getElementById('modalAwardsSection');
      const awardsContent = document.getElementById('modalAwards');
      if (profile.awards && profile.awards.length > 0) {
        awardsContent.innerHTML = '<ul>' + 
          profile.awards.map(award => `<li>${award}</li>`).join('') + 
          '</ul>';
        awardsSection.style.display = 'block';
      } else {
        awardsSection.style.display = 'none';
      }
      
      // Show modal
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    
    // Function to close modal
    function closeFacultyModal() {
      if (!modal) return;
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    
    // Add click event listeners to all faculty cards
    const facultyCards = document.querySelectorAll('.faculty-card');
    facultyCards.forEach(card => {
      card.addEventListener('click', function(e) {
        // Don't trigger if clicking on LinkedIn link
        if (e.target.closest('.faculty-linkedin')) return;
        
        const facultyName = this.querySelector('.faculty-name')?.textContent.trim();
        if (facultyName) {
          openFacultyModal(facultyName);
        }
      });
    });
    
    // Close modal on close button click
    modalClose?.addEventListener('click', closeFacultyModal);
    
    // Close modal on backdrop click
    modalBackdrop?.addEventListener('click', closeFacultyModal);
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') {
        closeFacultyModal();
      }
    });
  }

})();
