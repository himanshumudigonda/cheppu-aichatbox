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

// API Configuration
const apiKey = ""; // Token removed for security - backend handles auth
const apiUrl = "https://router.huggingface.co/v1/chat/completions";
const imageApiUrl = "https://api-inference.huggingface.co/models/";

// Use proxy server to bypass CORS
const useProxyServer = true;
const proxyUrl = "https://cheppu-aichatbox.onrender.com";

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const aiModelSelect = document.getElementById('aiModel');
const imageModelSelect = document.getElementById('imageModel');
const modelTypeSelect = document.getElementById('modelType');
const chatModelSelector = document.getElementById('chatModelSelector');
const imageModelSelector = document.getElementById('imageModelSelector');
const chatSuggestions = document.getElementById('chatSuggestions');
const imageSuggestions = document.getElementById('imageSuggestions');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    autoResizeTextarea();
});

// Event Listeners
function setupEventListeners() {
    sendBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

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
function toggleMode() {
    // Hide all selectors and suggestions
    chatModelSelector.style.display = 'none';
    imageModelSelector.style.display = 'none';
    chatSuggestions.style.display = 'none';
    imageSuggestions.style.display = 'none';
    
    if (currentMode === 'chat') {
        chatModelSelector.style.display = 'flex';
        chatSuggestions.style.display = 'grid';
        messageInput.placeholder = 'Type your message...';
    } else if (currentMode === 'image') {
        imageModelSelector.style.display = 'flex';
        imageSuggestions.style.display = 'grid';
        messageInput.placeholder = 'Describe the image you want to generate...';
    }
    startNewChat();
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
}

// Smart model selection based on query
function selectBestModel(message) {
    const lowerMsg = message.toLowerCase();
    
    // Web search indicators
    if (lowerMsg.match(/latest|news|current|today|recent|what's happening|search|find information|weather|stock|price/)) {
        return 'groq/compound'; // Has web search
    }
    
    // Code execution indicators
    if (lowerMsg.match(/run|execute|calculate|compute|python|code|program|script/)) {
        return 'groq/compound'; // Has code interpreter
    }
    
    // Complex reasoning
    if (lowerMsg.length > 500 || lowerMsg.match(/analyze|detailed|comprehensive|explain in depth|research/)) {
        return 'openai/gpt-oss-120b'; // Larger model
    }
    
    // Quick simple queries
    if (lowerMsg.length < 50 && !lowerMsg.includes('?')) {
        return 'llama-3.1-8b-instant'; // Fast for simple tasks
    }
    
    // Creative writing
    if (lowerMsg.match(/write.*story|poem|creative|fiction|imagine/)) {
        return 'qwen/qwen3-32b';
    }
    
    // Default: balanced speed and quality
    return 'llama-3.3-70b-versatile';
}

// Handle sending message
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Hide welcome screen and show messages
    welcomeScreen.style.display = 'none';
    messagesContainer.classList.add('active');

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

        // Get AI response
        try {
            const response = await callHuggingFaceApi(message);
            
            // Remove typing indicator
            removeTypingIndicator(typingId);
            
            // Add AI response
            addMessage('ai', response);
            
            // Add to chat history
            chatHistory.push({ role: "assistant", content: response });
        } catch (error) {
            removeTypingIndicator(typingId);
            
            let errorMessage = `Sorry, I ran into an error. Please try again. (Error: ${error.message})`;
            const selectedModel = aiModelSelect.options[aiModelSelect.selectedIndex].text;

            if (error.status === 400) {
                errorMessage = `Bad Request (400) for model "${selectedModel}". This model might not be compatible with the chat API. Please try a different model.`;
            } else if (error.status === 401) {
                errorMessage = "Authentication Error (401). Please verify the API key.";
            } else if (error.status === 402) {
                errorMessage = "Payment Required (402). Your account may not have funds or you've hit a quota.";
            } else if (error.status === 404) {
                errorMessage = "Not Found (404). The API endpoint or model doesn't exist.";
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

// Call HuggingFace API
async function callHuggingFaceApi(userMessage) {
    let selectedModel = aiModelSelect.value;
    
    // Auto model selection
    if (selectedModel === 'auto') {
        selectedModel = selectBestModel(userMessage);
        console.log(`🤖 Auto-selected model: ${selectedModel}`);
    }
    
    const payload = {
        model: selectedModel,
        messages: chatHistory,
        type: 'chat'
    };

    let retries = 3;
    let delay = 1000;

    for (let i = 0; i < retries; i++) {
        try {
            // Use proxy server for all requests
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = new Error(`API Error: ${response.status}`);
                err.status = response.status;
                throw err;
            }

            const result = await response.json();
            
            if (result.choices && result.choices[0].message.content) {
                return result.choices[0].message.content;
            } else {
                throw new Error("Invalid API response structure.");
            }

        } catch (error) {
            console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
            if (i === retries - 1) {
                throw error;
            }
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
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
async function generateImage(prompt) {
    const selectedModel = imageModelSelect.value;
    
    // Use proxy server if enabled
    if (useProxyServer) {
        try {
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: selectedModel,
                    inputs: prompt,
                    type: 'image'
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Proxy server error:', error);
            throw error;
        }
    }
    
    throw new Error('Direct API access not supported - proxy required');
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
window.downloadImage = function(imageUrl, prompt) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    sidebar.classList.toggle('open');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

// Copy message function
window.copyMessage = function(button) {
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
