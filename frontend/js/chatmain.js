const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const typingIndicator = document.getElementById('typingIndicator');

const API_URL = "http://127.0.0.1:8000/chat";
let isWaitingForResponse = false;
let chatHistory = []; // ✅ conversation memory

// Voice Recognition Setup
let recognition = null;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
}

function init() {
    setupEventListeners();
    setupVoiceRecognition();
}

function setupEventListeners() {
    sendBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    voiceBtn.addEventListener('click', toggleVoiceRecognition);
}

function setupVoiceRecognition() {
    if (!recognition) {
        voiceBtn.style.display = 'none';
        return;
    }
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
        voiceBtn.classList.remove('listening');
        setTimeout(() => handleSendMessage(), 500);
    };
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceBtn.classList.remove('listening');
    };
    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
    };
}

function toggleVoiceRecognition() {
    if (!recognition) return;
    if (voiceBtn.classList.contains('listening')) {
        recognition.stop();
        voiceBtn.classList.remove('listening');
    } else {
        recognition.start();
        voiceBtn.classList.add('listening');
    }
}

async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message || isWaitingForResponse) return;

    addMessageToChat(message, 'user');
    chatHistory.push({ role: 'user', content: message }); // ✅ track history

    messageInput.value = '';
    showTypingIndicator();
    setInputState(false);

    try {
        const response = await sendMessageToAI(message);
        hideTypingIndicator();
        addMessageToChat(response, 'ai');
        chatHistory.push({ role: 'assistant', content: response }); // ✅ track history

    } catch (error) {
        hideTypingIndicator();
        addMessageToChat('Sorry, I encountered an error. Please try again later.', 'ai');
        console.error('🔥 Error:', error);
    } finally {
        setInputState(true);
    }
}

async function sendMessageToAI(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                history: chatHistory.slice(-10) // ✅ send last 10 messages
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.reply;

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function addMessageToChat(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (sender === 'ai') {
        const aiIcon = document.createElement('div');
        aiIcon.className = 'ai-icon';
        aiIcon.textContent = '🤖';
        contentDiv.appendChild(aiIcon);
    }

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = text;

    contentDiv.appendChild(bubbleDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    typingIndicator.style.display = 'block';
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function setInputState(enabled) {
    isWaitingForResponse = !enabled;
    messageInput.disabled = !enabled;
    sendBtn.disabled = !enabled;
    voiceBtn.disabled = !enabled;
    if (enabled) messageInput.focus();
}

document.addEventListener('DOMContentLoaded', init);