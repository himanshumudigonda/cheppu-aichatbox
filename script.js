// Global state
let chatHistory = [
    {
        role: "system",
        content: "You are a helpful assistant."
    },
    {
        role: "user",
        content: "Hello"
    },
    {
        role: "assistant",
        content: "Hello! How can I help you today!"
    }
];
let currentChatId = null;
let currentMode = 'chat'; // 'chat' or 'image'
let currentModelIndex = 0; // Track current model in fallback chain

// API Configuration
// API Configuration
const apiUrl = "https://router.huggingface.co/v1/chat/completions";

// Use proxy server to bypass CORS
const useProxyServer = true;
const proxyUrl = "https://cheppu-aichatbox.onrender.com";

// API Timeout (15 seconds for faster response)
const API_TIMEOUT = 15000;

// Fast model fallback chain (ordered by speed)
const FALLBACK_MODELS = [
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
    'groq/compound-mini',
    'llama-3.3-70b-versatile',
    'mixtral-8x7b-32768'
];

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const aiModelSelect = document.getElementById('aiModel');
const apiSelector = document.getElementById('apiSelector');
const modelSelector = document.getElementById('modelSelector');
const aspectRatioSelector = document.getElementById('aspectRatioSelector');
const widthSelector = document.getElementById('widthSelector');
const apiSelect = document.getElementById('apiSelect');
const modelSelect = document.getElementById('modelSelect');
const ratioSelect = document.getElementById('ratioSelect');
const widthInput = document.getElementById('widthInput');
const modelTypeSelect = document.getElementById('modelType');
const chatModelSelector = document.getElementById('chatModelSelector');
const chatSuggestions = document.getElementById('chatSuggestions');
const imageSuggestions = document.getElementById('imageSuggestions');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme(); // Initialize theme
    setupEventListeners();
    autoResizeTextarea();
    registerServiceWorker();
    toggleMode(); // Ensure correct mode state
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
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
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered successfully:', registration.scope);

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60000); // Check every minute

                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'activated') {
                                console.log('🔄 Service Worker updated');
                                // Optionally show notification to user
                                showToast('App updated! Refresh for new features.', 'success');
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('❌ Service Worker registration failed:', error);
                });
        });
    } else {
        console.log('⚠️ Service Workers not supported in this browser');
    }
}

// Event Listeners
function setupEventListeners() {
    // Ensure the input bar is functional
    if (messageInput && sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    } else {
        console.error('Input bar elements not found. Ensure #messageInput and #sendBtn exist in the DOM.');
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    newChatBtn.addEventListener('click', startNewChat);
    aiModelSelect.addEventListener('change', startNewChat);

    // Mode switching
    modelTypeSelect.addEventListener('change', (e) => {
        currentMode = e.target.value;
        toggleMode();
    });

    // Suggestion cards
    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            messageInput.value = prompt;
            handleSendMessage();
        });
    });

    messageInput.addEventListener('input', autoResizeTextarea);
}

// Toggle between chat and image mode
// Ensure input-container visibility during mode switching and message sending
function toggleMode() {
    // Debugging logs added to trace visibility changes
    console.log(`Switching to mode: ${currentMode}`);
    console.log('Hiding all selectors and suggestions');
    chatModelSelector.style.display = 'none';
    apiSelector.style.display = 'none';
    modelSelector.style.display = 'none';
    aspectRatioSelector.style.display = 'none';
    widthSelector.style.display = 'none';
    chatSuggestions.style.display = 'none';
    imageSuggestions.style.display = 'none';

    if (currentMode === 'chat') {
        console.log('Activating chat mode');
        chatModelSelector.style.display = 'flex';
        chatSuggestions.style.display = 'grid';
        messageInput.placeholder = 'Type your message...';
        document.querySelector('.input-container').style.display = 'flex';
    } else if (currentMode === 'image') {
        console.log('Activating image generation mode');
        apiSelector.style.display = 'flex';
        modelSelector.style.display = 'flex';
        aspectRatioSelector.style.display = 'flex';
        widthSelector.style.display = 'flex';
        imageSuggestions.style.display = 'grid';
        messageInput.placeholder = 'Describe the image you want to generate...';
        document.querySelector('.input-container').style.display = 'flex';
    }
    startNewChat();
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
}

// Smart model selection based on query - prioritizes SPEED
function selectBestModel(message) {
    const lowerMsg = message.toLowerCase();

    // Web search indicators - use fast compound mini
    if (lowerMsg.match(/latest|news|current|today|recent|what's happening|search|find information|weather|stock|price/)) {
        return 'groq/compound-mini'; // Faster than compound
    }

    // Code execution indicators
    if (lowerMsg.match(/run|execute|calculate|compute|python|code|program|script/)) {
        return 'groq/compound-mini'; // Fast with tools
    }

    // Very complex reasoning - only then use slower models
    if (lowerMsg.length > 800 || lowerMsg.match(/analyze in detail|comprehensive analysis|detailed research|write a long/)) {
        return 'llama-3.3-70b-versatile'; // Balanced
    }

    // Short/Medium queries - FASTEST model
    if (lowerMsg.length < 200) {
        return 'llama-3.1-8b-instant'; // Fastest!
    }

    // Creative writing - use fast model
    if (lowerMsg.match(/write.*story|poem|creative|fiction|imagine/)) {
        return 'gemma2-9b-it'; // Fast and creative
    }

    // Default: FASTEST model for best UX
    return 'llama-3.1-8b-instant';
}

// Handle sending message
async function handleSendMessage() {
    const message = messageInput.value.trim();
    console.log(`Sending message: ${message}`);
    if (!message) return;

    console.log('Hiding welcome screen and activating messages container');
    welcomeScreen.style.display = 'none';
    messagesContainer.classList.add('active');
    document.querySelector('.input-container').style.display = 'flex';

    // Add user message
    addMessage('user', message);
    messageInput.value = '';
    autoResizeTextarea();

    // Disable send button
    sendBtn.disabled = true;

    // Show typing indicator
    const typingId = addTypingIndicator();

    if (currentMode === 'chat') {
        // Add to chat history
        chatHistory.push({ role: "user", content: message });

        // Get AI response with automatic fallback
        try {
            const response = await callHuggingFaceApiWithFallback(message);

            // Remove typing indicator
            removeTypingIndicator(typingId);

            // Add AI response
            addMessage('ai', response);

            // Add to chat history
            chatHistory.push({ role: "assistant", content: response });
        } catch (error) {
            removeTypingIndicator(typingId);

            let errorMessage = `Sorry, all models are currently unavailable. Please try again in a moment. (${error.message})`;

            if (error.message.includes('timeout')) {
                errorMessage = "⏱️ Request timed out. The service might be slow. Please try again or select a faster model.";
            } else if (error.status === 429) {
                errorMessage = "⚠️ Rate limit reached. Please wait a moment and try again.";
            } else if (error.status === 503) {
                errorMessage = "🔄 Service temporarily unavailable. Trying alternative models...";
            }

            addMessage('ai', errorMessage);
            console.error('Error:', error);
        }
    } else if (currentMode === 'image') {
        // Image generation mode
        try {
            const imageUrl = await generateImage(message);

            // Remove typing indicator
            removeTypingIndicator(typingId);

            // Add image message
            addImageMessage(imageUrl, message);
        } catch (error) {
            removeTypingIndicator(typingId);

            let errorMessage = `Sorry, I couldn't generate the image. (${error.message})`;

            if (error.name === 'AbortError') {
                errorMessage = "⏱️ Request timed out. The model might be busy. Please try again.";
            } else if (error.message.includes('402')) {
                errorMessage = "💳 HuggingFace requires payment for image generation. Your free tier has expired or needs credits added at https://huggingface.co/settings/billing";
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = `🌐 CORS/Network Error: Unable to reach the image generation service.`;
            } else if (error.message.includes('503')) {
                errorMessage = "⏳ Model is loading. Please wait 30 seconds and try again.";
            } else if (error.message.includes('401')) {
                errorMessage = "🔑 Invalid API key. Please check the token configuration.";
            }

            addMessage('ai', errorMessage);
            console.error('Image Error:', error);
        }
    }

    // Enable send button
    sendBtn.disabled = false;
    messageInput.focus();
}

// Call HuggingFace API with timeout
async function callHuggingFaceApi(userMessage, modelOverride = null) {
    let selectedModel = modelOverride || aiModelSelect.value;

    // Auto model selection - prioritize speed
    if (selectedModel === 'auto') {
        selectedModel = selectBestModel(userMessage);
        console.log(`🤖 Auto-selected model: ${selectedModel}`);
    }

    const payload = {
        model: selectedModel,
        messages: chatHistory,
        type: 'chat'
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        // Use proxy server with timeout
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const err = new Error(`API Error: ${response.status}`);
            err.status = response.status;
            throw err;
        }

        const result = await response.json();

        if (result.choices && result.choices[0].message.content) {
            // Silently handle model fallback (logging for debug only)
            if (result.used_model && result.used_model !== selectedModel) {
                console.log(`Server fell back to model: ${result.used_model}`);
            }
            return { content: result.choices[0].message.content, model: result.used_model || selectedModel };
        } else {
            throw new Error("Invalid API response structure.");
        }

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            const timeoutError = new Error(`Timeout after ${API_TIMEOUT / 1000}s`);
            timeoutError.name = 'TimeoutError';
            timeoutError.model = selectedModel;
            throw timeoutError;
        }
        error.model = selectedModel;
        throw error;
    }
}

// Call API with automatic fallback to faster models
async function callHuggingFaceApiWithFallback(userMessage) {
    // The server now handles fallback logic for better reliability
    // We just make one call and let the server try multiple models

    try {
        const result = await callHuggingFaceApi(userMessage);
        return result.content;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Get friendly model name for display
function getModelDisplayName(model) {
    const names = {
        'llama-3.1-8b-instant': 'Ultra Fast',
        'gemma2-9b-it': 'Creative Fast',
        'groq/compound-mini': 'Ultra Fast Compound',
        'llama-3.3-70b-versatile': 'High Intelligence',
        'mixtral-8x7b-32768': 'Complex Reasoning'
    };
    return names[model] || model;
}

// Add message to chat
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    const avatar = role === 'user' ? 'U' : 'AI';
    const roleName = role === 'user' ? 'You' : 'AI Assistant';

    // Add copy button for AI messages
    const copyButton = role === 'ai' ? `
        <button class="copy-btn" onclick="copyMessage(this)" title="Copy message">
            <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        </button>
    ` : '';

    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="avatar ${role}">${avatar}</div>
            <span class="message-role">${roleName}</span>
            ${copyButton}
        </div>
        <div class="message-content">${formatMessage(content)}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Format message (handle code blocks, etc.)
function formatMessage(content) {
    // Simple markdown-like formatting
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    content = content.replace(/\n/g, '<br>');
    return content;
}

// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message';
    const typingId = 'typing-' + Date.now();
    typingDiv.id = typingId;

    typingDiv.innerHTML = `
        <div class="message-header">
            <div class="avatar ai">AI</div>
            <span class="message-role">AI Assistant</span>
        </div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return typingId;
}

// Remove typing indicator
function removeTypingIndicator(typingId) {
    const typingDiv = document.getElementById(typingId);
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Generate image using HuggingFace API
// Generate image using Fast APIs
async function generateImage(prompt) {
    const api = apiSelect.value;
    const model = modelSelect.value;
    const ratio = ratioSelect.value;
    const width = parseInt(widthInput.value);

    // Calculate height based on aspect ratio
    const ratios = {
        '1:1': 1,
        '16:9': 9 / 16,
        '9:16': 16 / 9,
        '4:3': 3 / 4,
        '3:4': 4 / 3
    };
    const height = Math.round(width * ratios[ratio]);
    const seed = Math.floor(Math.random() * 1000000);

    let imageUrl;

    // Ultra-fast optimized endpoints prioritized
    if (api === 'pollinations-turbo') {
        // Pollinations TURBO mode - fastest option (2-3 seconds)
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=turbo&nologo=true&enhance=false&seed=${seed}`;

    } else if (api === 'fal-schnell') {
        // Fal.ai FLUX Schnell - super fast (3-4 seconds)
        imageUrl = `https://fal.run/fal-ai/fast-turbo-diffusion/image?prompt=${encodeURIComponent(prompt)}&image_size=${width}x${height}&seed=${seed}`;

    } else if (api === 'together') {
        // Together.ai - free and fast (3-5 seconds)
        imageUrl = `https://api.together.xyz/v1/images/generations?prompt=${encodeURIComponent(prompt)}&width=${width}&height=${height}&model=black-forest-labs/FLUX.1-schnell-Free&seed=${seed}`;

    } else if (api === 'pollinations') {
        // Pollinations FLUX mode - balanced speed/quality (5-7 seconds)
        const pollinationsModel = model === 'turbo' ? 'turbo' : 'flux';
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=${pollinationsModel}&nologo=true&seed=${seed}`;

    } else if (api === 'prodia') {
        // Prodia AI - Fast generation
        imageUrl = `https://api.prodia.com/generate?prompt=${encodeURIComponent(prompt)}&model=flux-schnell&width=${width}&height=${height}&seed=${seed}`;
    }

    // Preload image to ensure it's ready before showing
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject(new Error('Failed to load generated image'));
        img.src = imageUrl;

        // Timeout after 15 seconds
        setTimeout(() => reject(new Error('Image load timed out')), 15000);
    });
}

// Add image message to chat
function addImageMessage(imageUrl, prompt) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="avatar ai">AI</div>
            <span class="message-role">AI Assistant</span>
        </div>
        <div class="message-content">
            <p style="margin-bottom: 12px; color: var(--text-secondary);">Generated image: "${prompt}"</p>
            <div class="image-container">
                <img src="${imageUrl}" alt="Generated image" loading="lazy">
                <button class="download-btn" onclick="downloadImage('${imageUrl}', '${prompt}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                    Download
                </button>
            </div>
        </div>
    `;


    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Download image function
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
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback to opening in new tab
        window.open(imageUrl, '_blank');
    }
}

// Start new chat
function startNewChat() {
    // Reset chat history
    chatHistory = [
        {
            role: "system",
            content: "You are a helpful assistant."
        },
        {
            role: "user",
            content: "Hello"
        },
        {
            role: "assistant",
            content: "Hello! How can I help you today?"
        }
    ];

    messagesContainer.innerHTML = '';
    messagesContainer.classList.remove('active');
    welcomeScreen.style.display = 'flex';
    currentChatId = null;
}

// Mobile menu toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Close sidebar when clicking outside on mobile (handled by overlay now)
// Kept for safety if overlay fails
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');

    if (window.innerWidth <= 768 &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target) &&
        !e.target.classList.contains('sidebar-overlay')) {
        // sidebar.classList.remove('open'); // Let overlay handle it
    }
});

// Copy message function
window.copyMessage = function (button) {
    const messageContent = button.closest('.message').querySelector('.message-content');
    const textToCopy = messageContent.innerText || messageContent.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Show check icon
        const copyIcon = button.querySelector('.copy-icon');
        const checkIcon = button.querySelector('.check-icon');

        copyIcon.style.display = 'none';
        checkIcon.style.display = 'block';
        button.classList.add('copied');

        // Show toast notification
        showToast('Copied to clipboard!');

        // Reset after 2 seconds
        setTimeout(() => {
            copyIcon.style.display = 'block';
            checkIcon.style.display = 'none';
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy', 'error');
    });
}

// Toast notification function
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
