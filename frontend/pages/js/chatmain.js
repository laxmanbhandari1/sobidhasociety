/*
  GreenVale Society — Chat JS
  Handles: messaging, voice, quick links, event cards, timestamps
*/

const chatMessages   = document.getElementById('chatMessages');
const messageInput   = document.getElementById('messageInput');
const sendBtn        = document.getElementById('sendBtn');
const voiceBtn       = document.getElementById('voiceBtn');
const typingIndicator = document.getElementById('typingIndicator');

const API_URL = "https://sobidhasociety.onrender.com/chat";
const BOOK_URL = "https://sobidhasociety.onrender.com/book";

let isWaitingForResponse = false;
let chatHistory = [];

// ── Voice Recognition ────────────────────────────
let recognition = null;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
}

// ── Init ─────────────────────────────────────────
function init() {
  setupEventListeners();
  setupVoiceRecognition();
  setupQuickLinks();
}

function setupEventListeners() {
  sendBtn.addEventListener('click', handleSendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });
  voiceBtn.addEventListener('click', toggleVoice);
}

function setupQuickLinks() {
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-msg');
      if (msg && !isWaitingForResponse) {
        messageInput.value = msg;
        handleSendMessage();
      }
    });
  });
}

function setupVoiceRecognition() {
  if (!recognition) { voiceBtn.style.display = 'none'; return; }

  recognition.onresult = (e) => {
    messageInput.value = e.results[0][0].transcript;
    voiceBtn.classList.remove('listening');
    setTimeout(() => handleSendMessage(), 500);
  };
  recognition.onerror = () => voiceBtn.classList.remove('listening');
  recognition.onend   = () => voiceBtn.classList.remove('listening');
}

function toggleVoice() {
  if (!recognition) return;
  if (voiceBtn.classList.contains('listening')) {
    recognition.stop();
    voiceBtn.classList.remove('listening');
  } else {
    recognition.start();
    voiceBtn.classList.add('listening');
  }
}

// ── Send message ─────────────────────────────────
async function handleSendMessage() {
  const message = messageInput.value.trim();
  if (!message || isWaitingForResponse) return;

  addMessage(message, 'user');
  chatHistory.push({ role: 'user', content: message });

  messageInput.value = '';
  showTyping();
  setInputState(false);

  try {
    const data = await sendToAPI(message);
    hideTyping();

    if (data.action === 'show_events' && data.events?.length) {
      addMessage(data.reply, 'ai');
      showEventCards(data.events);
    } else {
      addMessage(data.reply, 'ai');
    }

    chatHistory.push({ role: 'assistant', content: data.reply });

  } catch (err) {
    hideTyping();
    addMessage('Sorry, I had trouble connecting. Please try again.', 'ai');
    console.error('Chat error:', err);
  } finally {
    setInputState(true);
  }
}

async function sendToAPI(message) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: chatHistory.slice(-10) })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Add message bubble ───────────────────────────
function addMessage(text, sender) {
  const wrap = document.createElement('div');
  wrap.className = `message ${sender}-message`;

  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  if (sender === 'ai') {
    wrap.innerHTML = `
      <div class="msg-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" stroke-width="1.6"/>
          <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
        </svg>
      </div>
      <div class="msg-body">
        <div class="msg-bubble">${formatText(text)}</div>
        <span class="msg-time">${now}</span>
      </div>
    `;
  } else {
    wrap.innerHTML = `
      <div class="msg-body">
        <div class="msg-bubble">${escapeHtml(text)}</div>
        <span class="msg-time">${now}</span>
      </div>
    `;
  }

  chatMessages.appendChild(wrap);
  scrollDown();
}

// ── Event cards ──────────────────────────────────
function showEventCards(events) {
  const wrap = document.createElement('div');
  wrap.className = 'message ai-message';
  wrap.innerHTML = `
    <div class="msg-avatar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    </div>
    <div class="msg-body" style="max-width:85%">
      <div class="event-cards">
        ${events.map(e => `
          <div class="event-card">
            <div class="event-card-top">
              <span class="event-name">${e.name}</span>
              <span class="event-spots">${e.spots} spots</span>
            </div>
            <div class="event-meta">
              <span>📅 ${e.date}</span>
              <span>🕐 ${e.time}</span>
              <span>📍 ${e.location}</span>
            </div>
            <button class="book-btn" onclick="promptBooking(${e.id}, '${escapeHtml(e.name)}')">
              Book Now →
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  chatMessages.appendChild(wrap);
  scrollDown();
}

// ── Booking prompt ───────────────────────────────
window.promptBooking = function(eventId, eventName) {
  addMessage(`I'd like to book: ${eventName}`, 'user');

  const wrap = document.createElement('div');
  wrap.className = 'message ai-message';
  wrap.innerHTML = `
    <div class="msg-avatar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    </div>
    <div class="msg-body" style="max-width:80%">
      <div class="msg-bubble">
        <p style="margin-bottom:10px">Please enter your details to confirm your booking for <strong>${eventName}</strong>:</p>
        <div class="booking-form">
          <input type="text" id="book-name-${eventId}" placeholder="Your full name" class="book-input"/>
          <input type="email" id="book-email-${eventId}" placeholder="Your email address" class="book-input"/>
          <button class="confirm-btn" onclick="confirmBooking(${eventId}, '${escapeHtml(eventName)}')">
            Confirm Booking ✓
          </button>
        </div>
      </div>
    </div>
  `;
  chatMessages.appendChild(wrap);
  scrollDown();
}

window.confirmBooking = async function(eventId, eventName) {
  const name  = document.getElementById(`book-name-${eventId}`).value.trim();
  const email = document.getElementById(`book-email-${eventId}`).value.trim();

  if (!name || !email) {
    alert('Please enter both your name and email.');
    return;
  }

  try {
    const res = await fetch(BOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, email, name })
    });
    const data = await res.json();
    addMessage(data.message + (data.email_sent ? ' A confirmation email has been sent! 📧' : ''), 'ai');
  } catch {
    addMessage('Booking failed. Please try again or contact management.', 'ai');
  }
}

// ── Helpers ──────────────────────────────────────
function formatText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showTyping() {
  typingIndicator.style.display = 'flex';
  scrollDown();
}

function hideTyping() {
  typingIndicator.style.display = 'none';
}

function scrollDown() {
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 80);
}

function setInputState(enabled) {
  isWaitingForResponse = !enabled;
  messageInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
  if (enabled) messageInput.focus();
}

document.addEventListener('DOMContentLoaded', init);