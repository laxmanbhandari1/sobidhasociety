/* ============================================
   SOCIETYSUWIDHA HUB — MAIN JS
   ============================================ */
   console.log("JS WORKING")

   var supabaseClient = window.supabase.createClient(
     'https://wqqhwfpndcmpbkhclhlc.supabase.co',
     'sb_publishable_h9NayWVGmNHCNZToonGaag_PO2Q7Bht'
   )
   
   /* ============================================
      NAVBAR
      ============================================ */
   function initNavbar() {
     const navbar   = document.querySelector('.navbar');
     const hamburger = document.querySelector('.hamburger');
     const navLinks  = document.querySelector('.navbar-links');
   
     if (navbar) {
       window.addEventListener('scroll', () => {
         navbar.classList.toggle('scrolled', window.scrollY > 20);
       });
     }
   
     if (hamburger && navLinks) {
       hamburger.addEventListener('click', () => {
         hamburger.classList.toggle('open');
         navLinks.classList.toggle('open');
       });
       navLinks.querySelectorAll('a').forEach(link => {
         link.addEventListener('click', () => {
           hamburger.classList.remove('open');
           navLinks.classList.remove('open');
         });
       });
     }
   
     const currentPage = window.location.pathname.split('/').pop() || 'index.html';
     document.querySelectorAll('.navbar-links a').forEach(link => {
       const href = link.getAttribute('href');
       if (href === currentPage || (currentPage === '' && href === 'index.html')) {
         link.classList.add('active');
       }
     });
   }
   
   /* ============================================
      PARALLAX EFFECT
      Applies to hero image and any .parallax-section
      ============================================ */
   function initParallax() {
     const heroImg = document.getElementById('hero-parallax-img');
   
     // Only run on desktop (768px+), skip on mobile to save battery
     if (!heroImg || window.innerWidth < 768) return;
   
     function updateParallax() {
       const scrollY = window.scrollY;
       // Move image upward at 40% of scroll speed — classic parallax
       heroImg.style.transform = 'translateY(' + (scrollY * 0.4) + 'px)';
     }
   
     // Use requestAnimationFrame for smooth performance
     let ticking = false;
     window.addEventListener('scroll', () => {
       if (!ticking) {
         requestAnimationFrame(() => {
           updateParallax();
           ticking = false;
         });
         ticking = true;
       }
     }, { passive: true });
   
     // Also handle parallax on any section with data-parallax-bg
     document.querySelectorAll('[data-parallax-speed]').forEach(el => {
       const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.3;
       window.addEventListener('scroll', () => {
         const rect = el.getBoundingClientRect();
         const offset = (window.innerHeight / 2 - rect.top - rect.height / 2) * speed;
         el.style.backgroundPositionY = `calc(50% + ${offset}px)`;
       }, { passive: true });
     });
   }
   
   /* ============================================
      FADE-IN ANIMATION
      ============================================ */
   function initFadeIn() {
     const elements = document.querySelectorAll('.fade-in:not(.visible)');
     if (!elements.length) return;
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           entry.target.classList.add('visible');
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.1 });
   
     elements.forEach(el => observer.observe(el));
   }
   
   /* ============================================
      COUNTER ANIMATION
      ============================================ */
   function animateCounter(el) {
     const target   = parseInt(el.getAttribute('data-target'), 10);
     const duration = 1800;
     const start    = performance.now();
   
     function update(now) {
       const elapsed  = now - start;
       const progress = Math.min(elapsed / duration, 1);
       const eased    = 1 - Math.pow(1 - progress, 3);
       el.textContent = Math.round(eased * target).toLocaleString();
       if (progress < 1) requestAnimationFrame(update);
     }
     requestAnimationFrame(update);
   }
   
   function initCounters() {
     const counters = document.querySelectorAll('.counter:not([data-counted])');
     if (!counters.length) return;
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           entry.target.setAttribute('data-counted', 'true');
           animateCounter(entry.target);
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.5 });
   
     counters.forEach(c => observer.observe(c));
   }
   
   /* ============================================
      MODAL SYSTEM — FIXED CLOSE BUTTON
      ============================================ */
   function openModal(modalId) {
     const modal = document.getElementById(modalId);
     if (modal) {
       modal.classList.add('open');
       document.body.style.overflow = 'hidden';
     }
   }
   
   function closeModal(modalId) {
     const modal = document.getElementById(modalId);
     if (modal) {
       modal.classList.remove('open');
       document.body.style.overflow = '';
     }
   }
   
   function initModals() {
     // Click on overlay backdrop → close
     document.addEventListener('click', (e) => {
       if (e.target.classList.contains('modal-overlay')) {
         e.target.classList.remove('open');
         document.body.style.overflow = '';
       }
     });
   
     // Click on ANY .modal-close button → close its parent overlay
     // Use event delegation so it works for modals added later (stitched pages)
     document.addEventListener('click', (e) => {
       const closeBtn = e.target.closest('.modal-close');
       if (closeBtn) {
         e.stopPropagation();
         const overlay = closeBtn.closest('.modal-overlay');
         if (overlay) {
           overlay.classList.remove('open');
           document.body.style.overflow = '';
         }
       }
     });
   
     // Escape key → close all modals
     document.addEventListener('keydown', (e) => {
       if (e.key === 'Escape') {
         document.querySelectorAll('.modal-overlay.open').forEach(overlay => {
           overlay.classList.remove('open');
           document.body.style.overflow = '';
         });
       }
     });
   }
   
   /* ============================================
      CALENDAR
      ============================================ */
   const eventsData = {
     '2026-04-05': { title: 'Annual General Meeting',  icon: '🏛', time: '10:00 AM', location: 'Community Hall',   type: 'Meeting',   desc: 'Yearly gathering for all society members to discuss updates, budgets, and upcoming plans.' },
     '2026-04-12': { title: 'Spring Garden Festival',  icon: '🌸', time: '9:00 AM',  location: 'Society Garden',  type: 'Festival',  desc: 'Celebrate spring with flowers, music, and food stalls. Fun for all ages!' },
     '2026-04-18': { title: "Children's Sports Day",   icon: '⚽', time: '8:00 AM',  location: 'Playground',      type: 'Sports',    desc: 'A fun-filled sports event for children aged 5-15 with prizes and refreshments.' },
     '2026-04-22': { title: 'Yoga & Wellness Session', icon: '🧘', time: '6:30 AM',  location: 'Terrace Garden',  type: 'Wellness',  desc: 'Join our certified yoga instructor for a morning wellness session. Free for all residents.' },
     '2026-04-28': { title: 'Cultural Night',          icon: '🎭', time: '6:00 PM',  location: 'Main Hall',       type: 'Culture',   desc: 'A beautiful evening of performances, traditional food, and cultural displays.' },
     '2026-05-01': { title: 'Labour Day Celebration',  icon: '🎉', time: '5:00 PM',  location: 'Courtyard',       type: 'Festival',  desc: 'Join us to celebrate the spirit of community and hard work!' },
     '2026-05-10': { title: 'Fire Safety Workshop',    icon: '🔥', time: '11:00 AM', location: 'Conference Room', type: 'Workshop',  desc: 'Learn essential fire safety tips and emergency procedures for your home.' },
     '2026-05-15': { title: 'Society Cleaning Drive',  icon: '🧹', time: '7:00 AM',  location: 'All Areas',       type: 'Community', desc: 'Volunteer to help keep our society clean and beautiful!' },
   };
   
   let currentCalendarDate = new Date(2026, 3, 1);
   
   function buildCalendar(date) {
     const calDates = document.getElementById('cal-dates');
     const calTitle = document.getElementById('cal-title');
     if (!calDates || !calTitle) return;
   
     const year  = date.getFullYear();
     const month = date.getMonth();
     const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
     calTitle.textContent = monthNames[month] + ' ' + year;
   
     const firstDay      = new Date(year, month, 1).getDay();
     const totalDays     = new Date(year, month + 1, 0).getDate();
     const prevMonthDays = new Date(year, month, 0).getDate();
     const today         = new Date();
   
     calDates.innerHTML = '';
   
     for (let i = firstDay - 1; i >= 0; i--) {
       const d = document.createElement('div');
       d.className = 'cal-date other-month';
       d.textContent = prevMonthDays - i;
       calDates.appendChild(d);
     }
   
     for (let day = 1; day <= totalDays; day++) {
       const d = document.createElement('div');
       d.className = 'cal-date';
       d.textContent = day;
   
       const dateStr = year + '-' + String(month + 1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
   
       if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
         d.classList.add('today');
       }
   
       if (eventsData[dateStr]) {
         d.classList.add('has-event');
         d.addEventListener('click', () => {
           calDates.querySelectorAll('.cal-date').forEach(el => el.classList.remove('selected'));
           d.classList.add('selected');
           showEventModal(eventsData[dateStr], dateStr);
         });
       }
   
       calDates.appendChild(d);
     }
   
     const totalCells = firstDay + totalDays;
     const remaining  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
     for (let i = 1; i <= remaining; i++) {
       const d = document.createElement('div');
       d.className = 'cal-date other-month';
       d.textContent = i;
       calDates.appendChild(d);
     }
   }
   
   function showEventModal(event, dateStr) {
     const modal = document.getElementById('event-modal');
     if (!modal) return;
   
     modal.querySelector('.modal-icon').textContent     = event.icon;
     modal.querySelector('.modal h3').textContent       = event.title;
     modal.querySelector('.modal p').textContent        = event.desc;
   
     const metas = modal.querySelectorAll('.modal-meta-item');
     if (metas[0]) metas[0].innerHTML = '📅 ' + dateStr;
     if (metas[1]) metas[1].innerHTML = '⏰ ' + event.time;
     if (metas[2]) metas[2].innerHTML = '📍 ' + event.location;
     if (metas[3]) metas[3].innerHTML = '🏷️ ' + event.type;
   
     openModal('event-modal');
   }
   
   function initCalendar() {
     if (!document.getElementById('cal-dates')) return;
     buildCalendar(currentCalendarDate);
     document.getElementById('cal-prev')?.addEventListener('click', () => {
       currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
       buildCalendar(currentCalendarDate);
     });
     document.getElementById('cal-next')?.addEventListener('click', () => {
       currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
       buildCalendar(currentCalendarDate);
     });
   }
   
   /* ============================================
      EVENT SEARCH
      ============================================ */
   function initEventSearch() {
     const searchInput = document.getElementById('event-search-input');
     const searchBtn   = document.getElementById('event-search-btn');
     const cards       = document.querySelectorAll('.event-card[data-title]');
     if (!searchInput) return;
   
     function doSearch() {
       const query = searchInput.value.toLowerCase().trim();
       cards.forEach(card => {
         const title = (card.getAttribute('data-title') || '').toLowerCase();
         const type  = (card.getAttribute('data-type')  || '').toLowerCase();
         card.style.display = (!query || title.includes(query) || type.includes(query)) ? '' : 'none';
       });
     }
   
     searchBtn?.addEventListener('click', doSearch);
     searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
   }
   
   /* ============================================
      EVENT CARD CLICKS
      ============================================ */
   function initEventCards() {
     document.querySelectorAll('.event-card[data-event-id]').forEach(card => {
       card.addEventListener('click', () => {
         const id = card.getAttribute('data-event-id');
         const event = eventsData[id];
         if (event) showEventModal(event, id);
       });
     });
   }
   
   /* ============================================
      BOOKING FORM
      ============================================ */
   function initBookingForm() {
     const form = document.getElementById('booking-form');
     if (!form) return;
   
     // Type card selection
     document.querySelectorAll('.booking-type-card').forEach(card => {
       card.addEventListener('click', () => {
         document.querySelectorAll('.booking-type-card').forEach(c => c.classList.remove('active'));
         card.classList.add('active');
         const select = document.getElementById('booking-type');
         if (select) select.value = card.getAttribute('data-type');
       });
     });
   
     // Payment method selection
     document.querySelectorAll('.pay-method').forEach(btn => {
       btn.addEventListener('click', () => {
         document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('selected'));
         btn.classList.add('selected');
         const upiField = document.getElementById('upi-field');
         if (upiField) upiField.style.display = btn.textContent.includes('UPI') ? '' : 'none';
       });
     });
   
     // Hide UPI initially
     const upiField = document.getElementById('upi-field');
     if (upiField) upiField.style.display = 'none';
   
     form.addEventListener('submit', async (e) => {
       e.preventDefault();
       const btn = form.querySelector('button[type="submit"]');
       if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }
       await new Promise(r => setTimeout(r, 800));
       form.style.display = 'none';
       const success = document.getElementById('booking-success');
       if (success) success.style.display = 'block';
     });
   }
   
   /* ============================================
      NEWS TOGGLE
      ============================================ */
   function initNewsToggle() {
     const toggleBtns    = document.querySelectorAll('.toggle-btn');
     const newsSection   = document.getElementById('news-section');
     const storiesSection = document.getElementById('stories-section');
     if (!toggleBtns.length) return;
   
     toggleBtns.forEach(btn => {
       btn.addEventListener('click', () => {
         toggleBtns.forEach(b => b.classList.remove('active'));
         btn.classList.add('active');
         const target = btn.getAttribute('data-target');
         if (target === 'news') {
           if (newsSection)    { newsSection.style.display    = ''; newsSection.style.animation    = 'fadeSlide 0.4s ease'; }
           if (storiesSection)   storiesSection.style.display  = 'none';
         } else {
           if (storiesSection) { storiesSection.style.display = ''; storiesSection.style.animation = 'fadeSlide 0.4s ease'; }
           if (newsSection)      newsSection.style.display     = 'none';
         }
       });
     });
   }
   
   const _fadeSlideStyle = document.createElement('style');
   _fadeSlideStyle.textContent = '@keyframes fadeSlide { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }';
   document.head.appendChild(_fadeSlideStyle);
   
   /* ============================================
      NEWS CARD POPUPS
      ============================================ */
   function initNewsCards() {
     document.querySelectorAll('.news-card[data-news-id]').forEach(card => {
       card.addEventListener('click', () => {
         const modal = document.getElementById('news-modal');
         if (!modal) return;
         modal.querySelector('.modal-icon').textContent           = card.getAttribute('data-icon')  || '📰';
         modal.querySelector('#news-modal-title').textContent     = card.getAttribute('data-title') || '';
         modal.querySelector('#news-modal-date').textContent      = card.getAttribute('data-date')  || '';
         modal.querySelector('#news-modal-body').textContent      = card.getAttribute('data-body')  || '';
         openModal('news-modal');
       });
     });
   }
   
   /* ============================================
      CONTACT FORM
      ============================================ */
   function initContactForm() {
     const form = document.getElementById('contact-form');
     if (!form) return;
   
     function showError(id, msg) {
       const el = document.getElementById(id + '-error');
       if (el) { el.textContent = msg; el.classList.add('show'); }
     }
     function clearError(id) {
       const el = document.getElementById(id + '-error');
       if (el) el.classList.remove('show');
     }
   
     form.querySelectorAll('input, textarea').forEach(input => {
       input.addEventListener('input', () => clearError(input.id));
     });
   
     form.addEventListener('submit', async (e) => {
       e.preventDefault();
       let valid = true;
   
       const name    = document.getElementById('contact-name');
       const email   = document.getElementById('contact-email');
       const message = document.getElementById('contact-message');
       const subject = document.getElementById('contact-subject');
   
       if (!name?.value.trim())    { showError('contact-name',    'Please enter your name.');          valid = false; }
       if (!email?.value.trim())   { showError('contact-email',   'Please enter your email.');         valid = false; }
       else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { showError('contact-email', 'Please enter a valid email.'); valid = false; }
       if (!message?.value.trim()) { showError('contact-message', 'Please write your message.');       valid = false; }
       else if (message.value.trim().length < 10) { showError('contact-message', 'Message must be at least 10 characters.'); valid = false; }
   
       if (!valid) return;
   
       const submitBtn = form.querySelector('button[type="submit"]');
       submitBtn.disabled = true;
       submitBtn.textContent = 'Sending…';
   
       const { error } = await supabaseClient
         .from('contact_messages')
         .insert({
           name:    name.value.trim(),
           email:   email.value.trim(),
           subject: subject?.value || null,
           message: message.value.trim()
         });
   
       if (error) {
         console.error('Supabase error:', error);
         submitBtn.disabled = false;
         submitBtn.textContent = '📨 Send Message';
         showError('contact-message', 'Something went wrong. Please try again.');
         return;
       }
   
       form.style.display = 'none';
       document.getElementById('form-success')?.classList.add('show');
     });
   }
   
   /* ============================================
      SMOOTH SCROLL
      ============================================ */
   function initSmoothScroll() {
     document.querySelectorAll('a[href^="#"]').forEach(link => {
       link.addEventListener('click', (e) => {
         const target = document.querySelector(link.getAttribute('href'));
         if (target) {
           e.preventDefault();
           target.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }
       });
     });
   }
   
   /* ============================================
      STITCH HELPER
      ============================================ */
   async function stitchPage(filename, contentSelector, mountId) {
     try {
       const res = await fetch('./' + filename + '?v=' + Date.now(), { cache: 'no-store' });
       if (!res.ok) { console.warn('Could not fetch ' + filename); return; }
   
       const html    = await res.text();
       const parser  = new DOMParser();
       const doc     = parser.parseFromString(html, 'text/html');
       const content = doc.querySelector(contentSelector);
       const mount   = document.getElementById(mountId);
   
       if (!content) { console.warn('❌ No ' + contentSelector + ' in ' + filename); return; }
       if (!mount)   { console.warn('❌ No #' + mountId + ' in DOM');                 return; }
   
       mount.appendChild(content);
   
       content.querySelectorAll('script').forEach(oldScript => {
         const newScript = document.createElement('script');
         if (oldScript.src) { newScript.src = oldScript.src; }
         else               { newScript.textContent = oldScript.textContent; }
         document.body.appendChild(newScript);
       });
   
       console.log('✅ Stitched ' + filename + ' → #' + mountId);
     } catch (err) {
       console.error('❌ Failed to stitch ' + filename + ':', err);
     }
   }
   
   /* ============================================
      STITCH ALL PAGES
      ============================================ */
   async function stitchAllPages() {
     await stitchPage('facilities.html', '#facility-content', 'facility-mount');
     await stitchPage('events.html',     '#events-content',   'events-mount');
     await stitchPage('booking.html',    '#booking-content',  'booking-mount');
     await stitchPage('news.html',       '#news-content',     'news-mount');
     await stitchPage('contact.html',    '#contact-content',  'contact-mount');
     await stitchPage('chat.html',       '#chat-content',     'chat-mount');
   
     // Re-run all observers after DOM is fully populated
     initFadeIn();
     initCounters();
     initCalendar();
     initEventSearch();
     initEventCards();
     initBookingForm();
     initNewsToggle();
     initNewsCards();
     initContactForm();
     initSmoothScroll();
     // Re-init modal delegation (already on document, so no action needed)
   
     console.log('✅ All pages stitched and ready');
   }
   
   /* ============================================
      INIT
      ============================================ */
   document.addEventListener('DOMContentLoaded', () => {
     initNavbar();
     initFadeIn();
     initCounters();
     initModals();       // uses event delegation — works for stitched content too
     initSmoothScroll();
     initParallax();     // parallax on hero image
   
     if (document.getElementById('facility-mount')) {
       stitchAllPages();
     } else {
       initCalendar();
       initEventSearch();
       initEventCards();
       initBookingForm();
       initNewsToggle();
       initNewsCards();
       initContactForm();
     }
   });