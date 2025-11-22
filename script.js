// Global state
let sessions = JSON.parse(localStorage.getItem('sessions')) || {};
let currentSessionId = localStorage.getItem('currentSessionId') || null;
let currentMode = 'chat'; // 'chat' or 'image'
let currentUser = null;

// API Configuration
const apiUrl = "https://router.huggingface.co/v1/chat/completions";
const useProxyServer = true;
const proxyUrl = "https://cheppu-aichatbox.onrender.com";
const API_TIMEOUT = 15000;

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB0Fe-54kBPtVPgvQxU5T7wgRyjRzMrIY0",
    authDomain: "cheppu-ai.firebaseapp.com",
    projectId: "cheppu-ai",
    storageBucket: "cheppu-ai.firebasestorage.app",
    messagingSenderId: "877736040132",
    appId: "1:877736040132:web:9d463454a156ef5ed69b91",
    measurementId: "G-K8BC7BG0HN"
};

// DOM Elements
const loginOverlay = document.getElementById('loginOverlay');
const loginBtn = document.getElementById('loginBtn');
const appLayout = document.getElementById('appLayout');
const welcomeScreen = document.getElementById('welcomeScreen');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const aiModelSelect = document.getElementById('aiModel');
const chatHistoryList = document.getElementById('chatHistoryList');
const modelTypeSelect = document.getElementById('modelType');
const userProfile = document.getElementById('userProfile');
const profileDropdown = document.getElementById('profileDropdown');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for PWA launch
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Running in standalone mode');
    }

    initTheme();
    setupEventListeners();
    autoResizeTextarea();
    registerServiceWorker();

    // Initialize Firebase & Auth Flow
    initFirebaseAuth();

    // Load sessions (will be hidden until login)
    loadSessions();
    toggleMode();
});

// Firebase Auth Logic
function initFirebaseAuth() {
    if (typeof firebase === 'undefined') {
        console.error("Firebase SDK not loaded");
        return;
    }

    try {
        firebase.initializeApp(firebaseConfig);

        // Auth State Listener
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                handleUserLogin(user);
            } else {
                handleUserLogout();
            }
        });

        // Login Button Handler
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const provider = new firebase.auth.GoogleAuthProvider();
                firebase.auth().signInWithPopup(provider)
                    .catch((error) => {
                        console.error("Login Error:", error);
                        showToast(`Login failed: ${error.message}`);
                    });
            });
        }

    } catch (e) {
        console.error("Firebase Initialization Error:", e);
    }
}

function handleUserLogin(user) {
    currentUser = user;

    // UI Transition: Hide Login, Show App
    if (loginOverlay) loginOverlay.classList.add('hidden');
    if (appLayout) {
        appLayout.style.display = 'flex';
        // Small delay to allow display:flex to apply before opacity transition
        setTimeout(() => appLayout.classList.add('visible'), 50);
    }

    // Update User Profile
    const userNameEl = document.getElementById('userName');
    const userStatusEl = document.getElementById('userStatus');
    const avatarEl = document.getElementById('userAvatar');

    if (userNameEl) userNameEl.textContent = user.displayName;
    if (userStatusEl) userStatusEl.textContent = 'Pro Plan';

    if (avatarEl) {
        avatarEl.innerHTML = `<img src="${user.photoURL || getRandomAvatar(user.displayName)}" alt="User">`;
    }

    // Restore last session or start new
    if (currentSessionId && sessions[currentSessionId]) {
        loadChat(currentSessionId);
    } else {
        startNewChat();
    }

    showToast(`Welcome back, ${user.displayName.split(' ')[0]}!`);
}

function handleUserLogout() {
    currentUser = null;

    // UI Transition: Show Login, Hide App
    if (loginOverlay) loginOverlay.classList.remove('hidden');
    if (appLayout) {
        appLayout.classList.remove('visible');
        setTimeout(() => appLayout.style.display = 'none', 500);
    }

    if (profileDropdown) profileDropdown.classList.remove('active');
}

function signOut() {
    if (typeof firebase !== 'undefined') {
        firebase.auth().signOut();
    }
}

function toggleProfileDropdown() {
    if (profileDropdown) profileDropdown.classList.toggle('active');
}

function getRandomAvatar(seed) {
    return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed || Math.random()}`;
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    updateMetaThemeColor(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    updateMetaThemeColor(newTheme);
}

function updateMetaThemeColor(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f1117' : '#ffffff');
    }
}

function updateThemeIcon(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (theme === 'dark') {
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
    } else {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
    }
}

// Session Management
function saveSession() {
    if (!currentSessionId) return;

    sessions[currentSessionId].lastModified = Date.now();

    if (sessions[currentSessionId].messages.length > 0 && sessions[currentSessionId].title === 'New Chat') {
        const firstMsg = sessions[currentSessionId].messages.find(m => m.role === 'user');
        if (firstMsg) {
            sessions[currentSessionId].title = firstMsg.content.substring(0, 30) + (firstMsg.content.length > 30 ? '...' : '');
        }
    }

    localStorage.setItem('sessions', JSON.stringify(sessions));
    localStorage.setItem('currentSessionId', currentSessionId);
    renderHistoryList();
}

function loadSessions() {
    renderHistoryList();
}

function renderHistoryList() {
    if (!chatHistoryList) return;
    chatHistoryList.innerHTML = '';

    const sortedSessions = Object.values(sessions).sort((a, b) => b.lastModified - a.lastModified);

    sortedSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = `history-item ${session.id === currentSessionId ? 'active' : ''}`;
        item.textContent = session.title;
        item.onclick = () => loadChat(session.id);
        chatHistoryList.appendChild(item);
    });
}

function loadChat(sessionId) {
    currentSessionId = sessionId;
    const session = sessions[sessionId];

    if (messagesContainer) messagesContainer.innerHTML = '';

    if (session.messages.length === 0) {
        if (welcomeScreen) welcomeScreen.style.display = 'flex';
        if (messagesContainer) messagesContainer.classList.remove('active');
    } else {
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (messagesContainer) messagesContainer.classList.add('active');

        session.messages.forEach(msg => {
            if (msg.role !== 'system') {
                if (msg.isImage) {
                    addImageMessageToUI(msg.content, msg.prompt);
                } else {
                    addMessageToUI(msg.role, msg.content);
                }
            }
        });
    }

    localStorage.setItem('currentSessionId', currentSessionId);
    renderHistoryList();

    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }
}

function startNewChat() {
    const newId = Date.now().toString();
    sessions[newId] = {
        id: newId,
        title: 'New Chat',
        messages: [
            { role: "system", content: "You are a helpful assistant." }
        ],
        lastModified: Date.now()
    };

    loadChat(newId);
}

// Event Listeners
function setupEventListeners() {
    if (messageInput && sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    if (newChatBtn) newChatBtn.addEventListener('click', startNewChat);

    if (modelTypeSelect) {
        modelTypeSelect.addEventListener('change', (e) => {
            currentMode = e.target.value;
            toggleMode();
        });
    }

    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            if (messageInput) {
                messageInput.value = prompt;
                handleSendMessage();
            }
        });
    });

    if (messageInput) messageInput.addEventListener('input', autoResizeTextarea);

    document.addEventListener('click', (e) => {
        if (userProfile && profileDropdown && !userProfile.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });
}

function toggleMode() {
    const chatControls = document.getElementById('chatControls');
    const imageControls = document.getElementById('imageControls');
    const chatSuggestions = document.getElementById('chatSuggestions');
    const imageSuggestions = document.getElementById('imageSuggestions');

    if (currentMode === 'chat') {
        if (chatControls) chatControls.style.display = 'block';
        if (imageControls) imageControls.style.display = 'none';
        if (chatSuggestions) chatSuggestions.style.display = 'grid';
        if (imageSuggestions) imageSuggestions.style.display = 'none';
        if (messageInput) messageInput.placeholder = 'Message Cheppu...';
    } else if (currentMode === 'image') {
        if (chatControls) chatControls.style.display = 'none';
        if (imageControls) imageControls.style.display = 'block';
        if (chatSuggestions) chatSuggestions.style.display = 'none';
        if (imageSuggestions) imageSuggestions.style.display = 'grid';
        if (messageInput) messageInput.placeholder = 'Describe an image...';
    }
}

function autoResizeTextarea() {
    if (messageInput) {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    }
}

// Handle sending message
async function handleSendMessage() {
    if (!messageInput) return;
    const message = messageInput.value.trim();
    if (!message) return;

    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (messagesContainer) messagesContainer.classList.add('active');
    const inputContainer = document.querySelector('.input-container');
    if (inputContainer) inputContainer.style.display = 'flex';

    addMessageToUI('user', message);
    sessions[currentSessionId].messages.push({ role: "user", content: message });
    saveSession();

    messageInput.value = '';
    autoResizeTextarea();
    if (sendBtn) sendBtn.disabled = true;

    const typingId = addTypingIndicator();

    if (currentMode === 'chat') {
        try {
            const response = await callHuggingFaceApiWithFallback(message);
            removeTypingIndicator(typingId);
            addMessageToUI('ai', response);
            sessions[currentSessionId].messages.push({ role: "assistant", content: response });
            saveSession();
        } catch (error) {
            removeTypingIndicator(typingId);
            const errorMsg = `Sorry, something went wrong. (${error.message})`;
            addMessageToUI('ai', errorMsg);
        }
    } else if (currentMode === 'image') {
        try {
            await generateImage(message);
            removeTypingIndicator(typingId);
        } catch (error) {
            removeTypingIndicator(typingId);
            addMessageToUI('ai', `Image generation failed: ${error.message}`);
        }
    }

    if (sendBtn) sendBtn.disabled = false;
    messageInput.focus();
}

// API Logic
async function callHuggingFaceApiWithFallback(userMessage) {
    const selectedModel = aiModelSelect && aiModelSelect.value === 'auto' ? 'llama-3.1-8b-instant' : (aiModelSelect ? aiModelSelect.value : 'llama-3.1-8b-instant');

    const payload = {
        model: selectedModel,
        messages: sessions[currentSessionId].messages,
        type: 'chat'
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// UI Functions
function addMessageToUI(role, content) {
    if (!messagesContainer) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatarHtml = role === 'ai' ? `
        <div class="ai-avatar">
            <svg class="ai-sparkle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
        </div>
    ` : `<div class="avatar ${role}">
            ${currentUser ? `<img src="${currentUser.photoURL}" alt="U">` : 'U'}
         </div>`;

    const roleName = role === 'user' ? (currentUser ? currentUser.displayName.split(' ')[0] : 'You') : 'AI Assistant';

    let formattedContent = role === 'ai' && typeof marked !== 'undefined' ? marked.parse(content) : content.replace(/\n/g, '<br>');

    messageDiv.innerHTML = `
        <div class="message-header">
            ${avatarHtml}
            <span class="message-role">${roleName}</span>
            ${role === 'ai' ? createActionButtons() : ''}
        </div>
        <div class="message-content">${formattedContent}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (role === 'ai' && typeof hljs !== 'undefined') {
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
            enhanceCodeBlock(block);
        });
    }
}

function createActionButtons() {
    return `
        <button class="copy-btn" onclick="copyMessage(this)" title="Copy message">
            <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
        </button>
    `;
}

function enhanceCodeBlock(codeBlock) {
    const pre = codeBlock.parentElement;
    let lang = 'Code';
    codeBlock.classList.forEach(cls => {
        if (cls.startsWith('language-')) lang = cls.replace('language-', '');
    });

    const header = document.createElement('div');
    header.className = 'code-header';

    let previewBtn = '';
    if (lang === 'html' || lang === 'xml') {
        previewBtn = `
            <button class="preview-btn" onclick="previewCode(this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                Preview
            </button>
        `;
    }

    header.innerHTML = `
        <span class="code-lang">${lang}</span>
        <div style="display:flex; align-items:center;">
            ${previewBtn}
            <button class="copy-code-btn" onclick="copyCode(this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
            </button>
        </div>
    `;
    pre.insertBefore(header, codeBlock);
}

window.previewCode = function (btn) {
    const pre = btn.closest('.code-header').nextElementSibling;
    const code = pre.querySelector('code').innerText;

    let previewContainer = pre.nextElementSibling;
    if (previewContainer && previewContainer.classList.contains('preview-container')) {
        previewContainer.remove();
        return;
    }

    previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';

    const iframe = document.createElement('iframe');
    iframe.className = 'preview-frame';
    previewContainer.appendChild(iframe);

    pre.parentNode.insertBefore(previewContainer, pre.nextSibling);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
}

window.copyCode = function (btn) {
    const pre = btn.closest('.code-header').nextElementSibling;
    const code = pre.querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = 'Copied!';
        setTimeout(() => btn.innerHTML = originalHtml, 2000);
    });
}

window.copyMessage = function (btn) {
    const content = btn.closest('.message').querySelector('.message-content').innerText;
    navigator.clipboard.writeText(content).then(() => {
        showToast('Copied to clipboard!');
    });
}

function addTypingIndicator() {
    if (!messagesContainer) return;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message';
    const typingId = 'typing-' + Date.now();
    typingDiv.id = typingId;
    typingDiv.innerHTML = `
        <div class="message-header">
            <div class="ai-avatar"><svg class="ai-sparkle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg></div>
            <span class="message-role">AI Assistant</span>
        </div>
        <div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingId;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

async function generateImage(prompt) {
    const api = document.getElementById('apiSelect') ? document.getElementById('apiSelect').value : 'pollinations-flux';
    const model = document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : 'flux';
    const width = 1024;
    const height = 1024;
    const seed = Math.floor(Math.random() * 1000000);

    let imageUrl;
    if (api === 'pollinations-turbo') {
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=turbo&nologo=true&seed=${seed}`;
    } else {
        let enhancedPrompt = prompt;
        if (model === '3d') enhancedPrompt += ", 3d render, unreal engine 5";
        if (model === 'anime') enhancedPrompt += ", anime style, vibrant";
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;
    }

    addImageMessageToUI(imageUrl, prompt);
    sessions[currentSessionId].messages.push({ role: "assistant", content: imageUrl, isImage: true, prompt: prompt });
    saveSession();
}

function addImageMessageToUI(imageUrl, prompt) {
    if (!messagesContainer) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ai';
    msgDiv.innerHTML = `
        <div class="ai-avatar"><svg class="ai-sparkle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg></div>
        <div class="message-content">
            <img src="${imageUrl}" alt="Generated Image" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            <p style="margin-top: 8px; font-size: 0.85rem; color: #888;">${prompt}</p>
            <button class="download-btn" onclick="downloadImage('${imageUrl}', '${prompt.replace(/'/g, "\\'")}')" style="margin-top: 8px; padding: 6px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: inherit; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.8rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Download
            </button>
        </div>
    `;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

window.downloadImage = async function (imageUrl, prompt) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        window.open(imageUrl, '_blank');
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.error('Service Worker registration failed', err));
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
