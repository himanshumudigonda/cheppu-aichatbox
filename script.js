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
        content: "Hello! How can I help you today?"
    }
];
let currentChatId = null;
let currentMode = 'chat'; // 'chat', 'image', or 'tts'

// API Configuration
// IMPORTANT: Replace this with your own HuggingFace API token
// Get free token from: https://huggingface.co/settings/tokens
const apiKey = ""; // Token removed for security - backend handles auth
const apiUrl = "https://router.huggingface.co/v1/chat/completions";
const imageApiUrl = "https://api-inference.huggingface.co/models/";
const ttsApiUrl = "https://api-inference.huggingface.co/models/";

// Use proxy server to bypass CORS (set to true if running proxy-server.js)
const useProxyServer = true; // Change to true if using the proxy
const proxyUrl = "https://cheppu-aichatbox.onrender.com";

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const aiModelSelect = document.getElementById('aiModel');
const imageModelSelect = document.getElementById('imageModel');
const ttsModelSelect = document.getElementById('ttsModel');
const modelTypeSelect = document.getElementById('modelType');
const chatModelSelector = document.getElementById('chatModelSelector');
const imageModelSelector = document.getElementById('imageModelSelector');
const ttsModelSelector = document.getElementById('ttsModelSelector');
const chatSuggestions = document.getElementById('chatSuggestions');
const imageSuggestions = document.getElementById('imageSuggestions');
const ttsSuggestions = document.getElementById('ttsSuggestions');
const historyItems = document.getElementById('historyItems');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
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

// Toggle between chat, image, and TTS mode
function toggleMode() {
    // Hide all selectors and suggestions
    chatModelSelector.style.display = 'none';
    imageModelSelector.style.display = 'none';
    ttsModelSelector.style.display = 'none';
    chatSuggestions.style.display = 'none';
    imageSuggestions.style.display = 'none';
    ttsSuggestions.style.display = 'none';
    
    if (currentMode === 'chat') {
        chatModelSelector.style.display = 'flex';
        chatSuggestions.style.display = 'grid';
        messageInput.placeholder = 'Type your message...';
    } else if (currentMode === 'image') {
        imageModelSelector.style.display = 'flex';
        imageSuggestions.style.display = 'grid';
        messageInput.placeholder = 'Describe the image you want to generate...';
    } else if (currentMode === 'tts') {
        ttsModelSelector.style.display = 'flex';
        ttsSuggestions.style.display = 'grid';
        messageInput.placeholder = 'Enter text to convert to speech...';
    }
    startNewChat();
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
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
            const response = await callHuggingFaceApi();
            
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
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = `🌐 CORS/Network Error: The HuggingFace API blocks direct browser requests. 
                
                <br><br><strong>Solutions:</strong>
                <br>1. Use a backend server (Node.js/Python) as a proxy
                <br>2. Try the browser extension: <a href="https://chrome.google.com/webstore/detail/allow-cors/lhobafahddgcelffkeicbaginigeejlf" target="_blank" style="color: #6366F1;">Allow CORS</a>
                <br>3. Deploy to a server (Vercel, Netlify, etc.)
                <br><br>The API works but needs a backend to bypass CORS restrictions.`;
            } else if (error.message.includes('503')) {
                errorMessage = "⏳ Model is loading. Please wait 30 seconds and try again.";
            } else if (error.message.includes('401')) {
                errorMessage = "🔑 Invalid API key. Please check the token in script.js";
            }
            
            addMessage('ai', errorMessage);
            console.error('Image Error:', error);
        }
    } else if (currentMode === 'tts') {
        // Text-to-speech mode
        try {
            const audioUrl = await generateSpeech(message);
            
            // Remove typing indicator
            removeTypingIndicator(typingId);
            
            // Add audio message
            addAudioMessage(audioUrl, message);
        } catch (error) {
            removeTypingIndicator(typingId);
            
            let errorMessage = `Sorry, I couldn't generate the speech. (${error.message})`;
            
            if (error.name === 'AbortError') {
                errorMessage = "⏱️ Request timed out. The model might be busy. Please try again.";
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = `🌐 CORS/Network Error: The HuggingFace API blocks direct browser requests. 
                
                <br><br><strong>Solutions:</strong>
                <br>1. Use a backend server (Node.js/Python) as a proxy
                <br>2. Try the browser extension: <a href="https://chrome.google.com/webstore/detail/allow-cors/lhobafahddgcelffkeicbaginigeejlf" target="_blank" style="color: #6366F1;">Allow CORS</a>
                <br>3. Deploy to a server (Vercel, Netlify, etc.)
                <br><br>The API works but needs a backend to bypass CORS restrictions.`;
            } else if (error.message.includes('503')) {
                errorMessage = "⏳ Model is loading. Please wait 30 seconds and try again.";
            } else if (error.message.includes('401')) {
                errorMessage = "🔑 Invalid API key. Please check the token in script.js";
            }
            
            addMessage('ai', errorMessage);
            console.error('TTS Error:', error);
        }
    }

    // Enable send button
    sendBtn.disabled = false;
    messageInput.focus();

    // Save to history
    saveChatToHistory(message);
}

// Call HuggingFace API
async function callHuggingFaceApi() {
    const selectedModel = aiModelSelect.value;
    
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
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="avatar ${role}">${avatar}</div>
            <span class="message-role">${roleName}</span>
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
            throw new Error('Proxy server error. Make sure proxy-server.js is running with: node proxy-server.js');
        }
    }
    
    // Try different API endpoints (direct - will likely fail due to CORS)
    const endpoints = [
        `https://api-inference.huggingface.co/models/${selectedModel}`,
    ];
    
    let lastError = null;
    
    for (const url of endpoints) {
        let retries = 2;
        let delay = 3000;

        for (let i = 0; i < retries; i++) {
            try {
                console.log(`Trying image generation with ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        options: {
                            wait_for_model: true,
                            use_cache: false
                        }
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    if (response.status === 503) {
                        await new Promise(res => setTimeout(res, 5000));
                        continue;
                    }
                    throw new Error(`HTTP ${response.status}`);
                }

                const blob = await response.blob();
                if (blob.size === 0) throw new Error('Empty response');
                
                return URL.createObjectURL(blob);

            } catch (error) {
                console.warn(`Attempt ${i + 1} failed:`, error.message);
                lastError = error;
                if (i < retries - 1) {
                    await new Promise(res => setTimeout(res, delay));
                }
            }
        }
    }
    
    throw lastError || new Error('Image generation failed');
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

// Generate speech using HuggingFace API
async function generateSpeech(text) {
    const selectedModel = ttsModelSelect.value;
    
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
                    inputs: text,
                    type: 'audio'
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Proxy server error:', error);
            throw new Error('Proxy server error. Make sure proxy-server.js is running with: node proxy-server.js');
        }
    }
    
    // Try different API endpoints (direct - will likely fail due to CORS)
    const endpoints = [
        `https://api-inference.huggingface.co/models/${selectedModel}`,
    ];
    
    let lastError = null;
    
    for (const url of endpoints) {
        let retries = 2;
        let delay = 3000;

        for (let i = 0; i < retries; i++) {
            try {
                console.log(`Trying TTS generation with ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        inputs: text,
                        options: {
                            wait_for_model: true,
                            use_cache: false
                        }
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    if (response.status === 503) {
                        await new Promise(res => setTimeout(res, 5000));
                        continue;
                    }
                    throw new Error(`HTTP ${response.status}`);
                }

                const blob = await response.blob();
                if (blob.size === 0) throw new Error('Empty response');
                
                return URL.createObjectURL(blob);

            } catch (error) {
                console.warn(`Attempt ${i + 1} failed:`, error.message);
                lastError = error;
                if (i < retries - 1) {
                    await new Promise(res => setTimeout(res, delay));
                }
            }
        }
    }
    
    throw lastError || new Error('Speech generation failed');
}

// Add audio message to chat
function addAudioMessage(audioUrl, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const audioId = 'audio-' + Date.now();
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="avatar ai">AI</div>
            <span class="message-role">AI Assistant</span>
        </div>
        <div class="message-content">
            <p style="margin-bottom: 12px; color: var(--text-secondary);">"${text}"</p>
            <div class="audio-player">
                <audio id="${audioId}" controls>
                    <source src="${audioUrl}" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
                <div class="audio-controls">
                    <button class="audio-download-btn" onclick="downloadAudio('${audioUrl}', '${text}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                        Download Audio
                    </button>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Download audio function
window.downloadAudio = function(audioUrl, text) {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${text.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.wav`;
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

// Save chat to history
function saveChatToHistory(message) {
    const chat = {
        id: Date.now(),
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        timestamp: new Date().toISOString(),
    };
    
    // Load existing local storage chat history
    let localChatHistory = [];
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        localChatHistory = JSON.parse(saved);
    }
    
    localChatHistory.unshift(chat);
    
    // Keep only last 20 chats
    if (localChatHistory.length > 20) {
        localChatHistory = localChatHistory.slice(0, 20);
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(localChatHistory));
    renderChatHistory();
}

// Load chat history
function loadChatHistory() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        const localChatHistory = JSON.parse(saved);
        renderChatHistory();
    }
}

// Render chat history
function renderChatHistory() {
    historyItems.innerHTML = '';
    
    const saved = localStorage.getItem('chatHistory');
    if (!saved) return;
    
    const localChatHistory = JSON.parse(saved);
    
    localChatHistory.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = chat.title;
        item.onclick = () => {
            console.log('Load chat:', chat.id);
        };
        historyItems.appendChild(item);
    });
}
