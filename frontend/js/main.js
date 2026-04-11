/* ============================================
SOCIETY MANAGEMENT SYSTEM - MAIN JS
Vanilla JavaScript - Beginner to Intermediate
============================================ */

/* ============================================
NAVBAR - Scroll Effect & Mobile Menu
============================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.navbar-links');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
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
FADE-IN ANIMATION (on scroll)
============================================ */
function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
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
COUNTER ANIMATION (home page stats)
============================================ */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ============================================
MODAL SYSTEM (shared across pages)
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
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

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
CALENDAR (events.html)
============================================ */
const eventsData = {
  '2026-04-05': { title: 'Annual General Meeting', icon: '\uD83C\uDFDB', time: '10:00 AM', location: 'Community Hall', type: 'Meeting', desc: 'Yearly gathering for all society members to discuss updates, budgets, and upcoming plans.' },
  '2026-04-12': { title: 'Spring Garden Festival', icon: '\uD83C\uDF38', time: '9:00 AM', location: 'Society Garden', type: 'Festival', desc: 'Celebrate spring with flowers, music, and food stalls. Fun for all ages!' },
  // FIX 2: Apostrophe in "Children's" replaced with escaped version to avoid string break
  '2026-04-18': { title: "Children's Sports Day", icon: '\u26BD', time: '8:00 AM', location: 'Playground', type: 'Sports', desc: 'A fun-filled sports event for children aged 5-15 with prizes and refreshments.' },
  '2026-04-22': { title: 'Yoga & Wellness Session', icon: '\uD83E\uDDD8', time: '6:30 AM', location: 'Terrace Garden', type: 'Wellness', desc: 'Join our certified yoga instructor for a morning wellness session. Free for all residents.' },
  '2026-04-28': { title: 'Cultural Night', icon: '\uD83C\uDFAD', time: '6:00 PM', location: 'Main Hall', type: 'Culture', desc: 'A beautiful evening of performances, traditional food, and cultural displays from all communities.' },
  '2026-05-01': { title: 'Labour Day Celebration', icon: '\uD83C\uDF89', time: '5:00 PM', location: 'Courtyard', type: 'Festival', desc: 'Join us to celebrate the spirit of community and hard work!' },
  '2026-05-10': { title: 'Fire Safety Workshop', icon: '\uD83D\uDD25', time: '11:00 AM', location: 'Conference Room', type: 'Workshop', desc: 'Learn essential fire safety tips and emergency procedures for your home.' },
  '2026-05-15': { title: 'Society Cleaning Drive', icon: '\uD83E\uDDF9', time: '7:00 AM', location: 'All Areas', type: 'Community', desc: 'Volunteer to help keep our society clean and beautiful!' },
};

let currentCalendarDate = new Date(2026, 3, 1);

function buildCalendar(date) {
  const calDates = document.getElementById('cal-dates');
  const calTitle = document.getElementById('cal-title');
  if (!calDates || !calTitle) return;

  const year = date.getFullYear();
  const month = date.getMonth();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  calTitle.textContent = monthNames[month] + ' ' + year;

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();

  calDates.innerHTML = '';

  // FIX 1: Was `i–` (en dash) — must be `i--` (two hyphens) for decrement
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-date other-month';
    dayEl.textContent = prevMonthDays - i;
    calDates.appendChild(dayEl);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-date';
    dayEl.textContent = d;

    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');

    if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayEl.classList.add('today');
    }

    if (eventsData[dateStr]) {
      dayEl.classList.add('has-event');
      dayEl.addEventListener('click', () => {
        dayEl.parentNode.querySelectorAll('.cal-date').forEach(el => el.classList.remove('selected'));
        dayEl.classList.add('selected');
        showEventModal(eventsData[dateStr], dateStr);
      });
    }

    calDates.appendChild(dayEl);
  }

  const totalCells = firstDay + totalDays;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-date other-month';
    dayEl.textContent = i;
    calDates.appendChild(dayEl);
  }
}

function showEventModal(event, dateStr) {
  const modal = document.getElementById('event-modal');
  if (!modal) return;

  modal.querySelector('.modal-icon').textContent = event.icon;
  modal.querySelector('.modal h3').textContent = event.title;
  modal.querySelector('.modal p').textContent = event.desc;

  const metas = modal.querySelectorAll('.modal-meta-item');
  if (metas[0]) metas[0].innerHTML = '\uD83D\uDCC5 ' + dateStr;
  if (metas[1]) metas[1].innerHTML = '\u23F0 ' + event.time;
  if (metas[2]) metas[2].innerHTML = '\uD83D\uDCCD ' + event.location;
  if (metas[3]) metas[3].innerHTML = '\uD83C\uDFF7\uFE0F ' + event.type;

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
EVENT SEARCH (events.html)
============================================ */
function initEventSearch() {
  const searchInput = document.getElementById('event-search-input');
  const searchBtn = document.getElementById('event-search-btn');
  const cards = document.querySelectorAll('.event-card[data-title]');
  if (!searchInput) return;

  function doSearch() {
    const query = searchInput.value.toLowerCase().trim();
    cards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const type = (card.getAttribute('data-type') || '').toLowerCase();
      card.style.display = (!query || title.includes(query) || type.includes(query)) ? '' : 'none';
    });
  }

  searchBtn?.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}

/* ============================================
EVENT CARD CLICKS (events.html)
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
BOOKING FORM (events.html)
============================================ */
function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  document.querySelectorAll('.pay-method').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = '#e53e3e';
        valid = false;
      } else {
        input.style.borderColor = '';
      }
    });

    if (valid) {
      openModal('booking-success-modal');
      form.reset();
    }
  });
}

/* ============================================
NEWS / STORIES TOGGLE (news.html)
============================================ */
function initNewsToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const newsSection = document.getElementById('news-section');
  const storiesSection = document.getElementById('stories-section');
  if (!toggleBtns.length) return;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-target');
      if (target === 'news') {
        if (newsSection) { newsSection.style.display = ''; newsSection.style.animation = 'fadeSlide 0.4s ease'; }
        if (storiesSection) storiesSection.style.display = 'none';
      } else {
        if (storiesSection) { storiesSection.style.display = ''; storiesSection.style.animation = 'fadeSlide 0.4s ease'; }
        if (newsSection) newsSection.style.display = 'none';
      }
    });
  });
}

// FIX 3: Use plain straight quotes in the injected style string
const style = document.createElement('style');
style.textContent = '@keyframes fadeSlide { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }';
document.head.appendChild(style);

/* ============================================
NEWS CARD POPUPS (news.html)
============================================ */
function initNewsCards() {
  document.querySelectorAll('.news-card[data-news-id]').forEach(card => {
    card.addEventListener('click', () => {
      const modal = document.getElementById('news-modal');
      if (!modal) return;

      modal.querySelector('.modal-icon').textContent = card.getAttribute('data-icon') || '\uD83D\uDCF0';
      modal.querySelector('#news-modal-title').textContent = card.getAttribute('data-title') || '';
      modal.querySelector('#news-modal-date').textContent = card.getAttribute('data-date') || '';
      // FIX 4: Null-safe fallback so missing data-body doesn't crash the modal
      modal.querySelector('#news-modal-body').textContent = card.getAttribute('data-body') || '';

      openModal('news-modal');
    });
  });
}

/* ============================================
CONTACT FORM VALIDATION (contact.html)
============================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function showError(inputId, msg) {
    const errEl = document.getElementById(inputId + '-error');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
  }
  function clearError(inputId) {
    const errEl = document.getElementById(inputId + '-error');
    if (errEl) errEl.classList.remove('show');
  }

  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => clearError(input.id));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = document.getElementById('contact-name');
    const email = document.getElementById('contact-email');
    const message = document.getElementById('contact-message');

    if (!name?.value.trim()) { showError('contact-name', 'Please enter your name.'); valid = false; }
    if (!email?.value.trim()) { showError('contact-email', 'Please enter your email.'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { showError('contact-email', 'Please enter a valid email address.'); valid = false; }
    if (!message?.value.trim()) { showError('contact-message', 'Please write your message.'); valid = false; }
    else if (message.value.trim().length < 10) { showError('contact-message', 'Message must be at least 10 characters.'); valid = false; }

    if (valid) {
      const formEl = form.parentElement;
      const successEl = document.getElementById('form-success');
      if (formEl && successEl) {
        form.style.display = 'none';
        successEl.classList.add('show');
      }
    }
  });
}

/* ============================================
LOGIN FORM VALIDATION (login.html)
============================================ */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input && input.type === 'password') {
        input.type = 'text';
        btn.textContent = '\uD83D\uDE48';
      } else if (input) {
        input.type = 'password';
        btn.textContent = '\uD83D\uDC41\uFE0F';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    const emailErr = document.getElementById('login-email-error');
    const passErr = document.getElementById('login-password-error');

    let valid = true;
    if (emailErr) emailErr.classList.remove('show');
    if (passErr) passErr.classList.remove('show');

    if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      if (emailErr) { emailErr.textContent = 'Please enter a valid email.'; emailErr.classList.add('show'); }
      valid = false;
    }
    if (!password?.value || password.value.length < 6) {
      if (passErr) { passErr.textContent = 'Password must be at least 6 characters.'; passErr.classList.add('show'); }
      valid = false;
    }

    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'Signing in...'; btn.disabled = true; }
      setTimeout(() => {
        if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
        openModal('login-success-modal');
      }, 1400);
    }
  });
}

/* ============================================
SMOOTH SCROLL for anchor links
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
INIT — runs on every page
============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFadeIn();
  initCounters();
  initModals();
  initSmoothScroll();

  initCalendar();
  initEventSearch();
  initEventCards();
  initBookingForm();
  initNewsToggle();
  initNewsCards();
  initContactForm();
  initLoginForm();
});