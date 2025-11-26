# 🏗️ Cheppu AI - Technical Architecture Documentation

**Last Updated:** November 24, 2025  
**Version:** 7.0  
**Type:** Production PWA

---

## 📐 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Browser (PWA)                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │ index.html │  │ script.js  │  │ styles.css │         │  │
│  │  │ (244 lines)│  │ (709 lines)│  │ (803 lines)│         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  │         │               │                │               │  │
│  │         └───────────────┼────────────────┘               │  │
│  │                         │                                │  │
│  │  ┌────────────┐  ┌──────────────┐                       │  │
│  │  │ sw.js      │  │ manifest.json│                       │  │
│  │  │ Service    │  │ PWA Config   │                       │  │
│  │  │ Worker     │  │              │                       │  │
│  │  └────────────┘  └──────────────┘                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
    ┌───────────┐  ┌──────────┐  ┌──────────┐
    │  Firebase │  │  Groq    │  │Pollina-  │
    │   Auth    │  │  Proxy   │  │tions API │
    │           │  │ (Render) │  │          │
    └───────────┘  └─────┬────┘  └──────────┘
                         │
                ┌────────┼────────┐
                │        │        │
                ▼        ▼        ▼
          ┌─────────┬─────────┬─────────┐
          │  Groq   │ HuggingF│ Router  │
          │   API   │  ace API│   API   │
          └─────────┴─────────┴─────────┘
```

---

## 🗂️ File Structure & Responsibilities

### **Frontend Files:**

#### **1. index.html (244 lines)**
**Purpose:** Main application interface  
**Key Sections:**
```html
<head>
  - Meta tags (PWA, SEO)
  - Google Fonts (Inter, Space Grotesk)
  - External libraries (marked.js, highlight.js)
  - Firebase SDK
  - styles.css

<body>
  - Login overlay
  - Sidebar (navigation, history, model selector)
  - Main content area
    - Top bar
    - Chat/welcome area
    - Messages container
  - Input wrapper
    - Mode-specific controls
    - Textarea + send button
```

**Technologies:**
- Semantic HTML5
- PWA meta tags
- Firebase integration
- Responsive viewport

---

#### **2. script.js (709 lines)**
**Purpose:** All client-side application logic  

**Module Structure:**
```javascript
// === CONFIGURATION ===
Global State Management (lines 1-13)
- sessions: localStorage chat history
- currentSessionId: active chat
- currentMode: 'chat' or 'image'
- currentUser: Firebase user object

API Configuration (lines 7-13)
- apiUrl: HuggingFace endpoint
- proxyUrl: Render.com proxy
- GOOGLE_API_KEY: Gemini API (optional)

Firebase Config (lines 14-23)
- apiKey, authDomain, projectId, etc.

// === INITIALIZATION ===
DOMContentLoaded (lines 41-83)
- Theme initialization
- Event listener setup
- Firebase auth check
- Session restoration
- Welcome message

// === AUTHENTICATION ===
Firebase Auth (lines 52-110)
- initFirebaseAuth()
- handleUserLogin(user)
- handleUserLogout()
- signOut()
- getRandomAvatar()

// === THEME MANAGEMENT ===
Theme System (lines 112-146)
- initTheme()
- toggleTheme()
- updateThemeIcon()
- updateMetaThemeColor()

// === SESSION MANAGEMENT ===
Chat Sessions (lines 148-246)
- saveSession()
- loadSessions()
- renderHistoryList()
- deleteChat()
- loadChat()
- startNewChat()

// === UI INTERACTIONS ===
Event Handlers (lines 262-352)
- setupEventListeners()
- setMode()
- toggleMode()
- autoResizeTextarea()
- handleSendMessage()

// === API CALLS ===
Chat API (lines 402-476)
- callHuggingFaceApiWithFallback()
- callGeminiApi() (optional)
- Model fallback logic
- Error handling

Image Generation (lines 633-672)
- generateImage()
- addImageMessageToUI()
- downloadImage()

// === UI RENDERING ===
Message Display (lines 479-631)
- addMessageToUI()
- createActionButtons()
- enhanceCodeBlock()
- addTypingIndicator()
- removeTypingIndicator()

// === UTILITIES ===
Helper Functions (lines 690-708)
- registerServiceWorker()
- showToast()
- copyCode()
- copyMessage()
- previewCode()
```

**Key Features:**
- No external framework dependencies
- Event-driven architecture
- Local storage for persistence
- Async/await for API calls
- Error boundaries

---

#### **3. styles.css (803 lines)**
**Purpose:** Complete styling system  

**CSS Architecture:**
```css
/* === ROOT VARIABLES === (lines 2-21) */
:root {
  Color Palette (light theme)
  Shadows
  Typography
}

/* === RESET & BASE === (lines 23-37) */
* { box-sizing, margin, padding }
body { font, background, layout }

/* === LOGIN OVERLAY === (lines 39-111) */
.login-overlay
.login-card
.google-login-btn

/* === APP LAYOUT === (lines 113-124) */
.app-layout
.app-layout.visible

/* === SIDEBAR === (lines 126-350) */
.sidebar
.sidebar-header
.logo
.segmented-control (Chat/Image toggle)
.history-list
.history-item
.sidebar-footer
.user-profile
.profile-dropdown

/* === MAIN CONTENT === (lines 352-458) */
.main-content
.top-bar
.chat-area
.welcome-screen
.suggestions-grid
.suggestion-card

/* === MESSAGES === (lines 460-567) */
.messages-list
.message (user vs ai)
.message-content
.code-header
.copy-code-btn

/* === INPUT AREA === (lines 569-656) */
.input-wrapper
.input-container (pill shape)
textarea
.send-btn
.input-footer

/* === ANIMATIONS === (lines 657-693) */
.typing-indicator
@keyframes typing

/* === TOAST NOTIFICATIONS === (lines 695-714) */
.toast
.toast.show

/* === MOBILE RESPONSIVE === (lines 732-759) */
@media (max-width: 768px)

/* === SCROLLBAR === (lines 761-787) */
::-webkit-scrollbar
custom scrollbar styling
```

**Design System:**
- CSS Custom Properties (CSS Variables)
- Mobile-first responsive design
- Flexbox + Grid layout
- Smooth transitions (0.2s - 0.3s)
- Accessibility-friendly contrast

---

#### **4. sw.js (91 lines)**
**Purpose:** Service Worker for PWA functionality  

**Structure:**
```javascript
// === CONFIGURATION === (lines 1-13)
CACHE_NAME = 'cheppu-ai-v7'
ASSETS_TO_CACHE = [
  '/', '/index.html', '/styles.css', '/script.js',
  CDN libraries, fonts
]

// === LIFECYCLE EVENTS ===
install (lines 16-24)
- Open cache
- Add all assets
- Force immediate activation

activate (lines 27-42)
- Take control of clients
- Delete old caches
- Clean up

fetch (lines 45-90)
- Network-first for HTML
- Cache-first for assets
- Stale-while-revalidate
```

**Caching Strategy:**
1. **Navigation:** Network first, cache fallback
2. **Assets:** Cache first, update in background
3. **Versioning:** Automatic cache cleanup

---

### **Backend Files:**

#### **1. server.js (215 lines)**
**Purpose:** Production Express proxy server  

**Architecture:**
```javascript
// === SETUP === (lines 1-15)
Dependencies: express, cors, node-fetch
Environment: PORT, HF_TOKEN, GROQ_API_KEY

// === MIDDLEWARE === (lines 17-19)
CORS (allow all origins)
JSON body parser (50mb limit)

// === ENDPOINTS ===
GET / (lines 22-31)
- Health check
- API documentation

GET /health (lines 33-35)
- Server status
- Timestamp

POST / (lines 38-187)
- Main proxy endpoint
- Chat requests → Groq API
- Image/TTS → HuggingFace
- Buffer streaming

// === ERROR HANDLING ===
Model Fallback (lines 44-115)
- Try multiple models
- Auth error detection
- Graceful degradation

404 Handler (lines 190-192)

// === SERVER START === (lines 195-214)
Listen on PORT
Graceful shutdown handler
```

**Key Features:**
- Model priority fallback system
- Comprehensive error handling
- Request/response logging
- Buffer streaming for media
- Environment variable config

---

#### **2. proxy-server.js (114 lines)**
**Purpose:** Simple alternative HTTP proxy  

**Use Case:** Local development or lightweight deployment

**Features:**
- Pure Node.js (no Express)
- Simple CORS handling
- Direct HuggingFace API calls
- Minimal dependencies

---

### **Configuration Files:**

#### **1. package.json (30 lines)**
```json
{
  "name": "cheppu-ai-chatbot",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-fetch": "^2.6.7"
  }
}
```

---

#### **2. manifest.json (26 lines)**
**Purpose:** PWA configuration  

```json
{
  "name": "Cheppu AI",
  "short_name": "Cheppu",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0f1117",
  "background_color": "#0f1117",
  "icons": [
    { "src": "logo.png", "sizes": "1024x1024" },
    { "src": "logo.png", "sizes": "512x512" },
    { "src": "logo.png", "sizes": "192x192" }
  ]
}
```

---

#### **3. netlify.toml (41 lines)**
**Purpose:** Netlify deployment config  

**Key Settings:**
```toml
[build]
  publish = "."
  command = "echo 'No build required'"

[[headers]]
  for = "/manifest.json"
  Cache-Control = "must-revalidate"

[[headers]]
  for = "/*"
  X-Frame-Options = "SAMEORIGIN"
  X-Content-Type-Options = "nosniff"
  X-XSS-Protection = "1; mode=block"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```

---

## 🔄 Data Flow Diagrams

### **Chat Message Flow:**
```
User Input
    │
    ▼
messageInput.value
    │
    ▼
handleSendMessage()
    │
    ├─► addMessageToUI('user', message)
    │
    ├─► sessions[id].messages.push()
    │
    ├─► saveSession() → localStorage
    │
    └─► callHuggingFaceApiWithFallback()
            │
            ▼
        fetch(proxyUrl, { model, messages })
            │
            ▼
        server.js (Render)
            │
            ├─► Try requested model
            ├─► Try fallback models
            └─► Return response or error
                    │
                    ▼
            addMessageToUI('ai', response)
                    │
                    ├─► marked.parse() (Markdown)
                    ├─► hljs.highlightElement() (Code)
                    └─► Render in DOM
```

---

### **Image Generation Flow:**
```
User Input (Image Mode)
    │
    ▼
generateImage(prompt)
    │
    ├─► Get API selector value
    ├─► Get model selector value
    ├─► Generate random seed
    │
    └─► Construct Pollinations URL
            │
            ▼
        https://image.pollinations.ai/prompt/{prompt}
        ?width=1024&height=1024
        &model=flux/turbo
        &nologo=true
        &seed={random}
            │
            ▼
        addImageMessageToUI(imageUrl, prompt)
            │
            └─► Display image with download button
```

---

### **Session Management Flow:**
```
App Load
    │
    ▼
localStorage.getItem('sessions')
localStorage.getItem('currentSessionId')
    │
    ▼
sessions = JSON.parse() || {}
    │
    ├─► if (currentSessionId exists)
    │       └─► loadChat(currentSessionId)
    │               └─► Render messages
    │
    └─► else
            └─► startNewChat()
                    └─► Create new session
                    └─► Show welcome screen

Every Message
    │
    ▼
saveSession()
    │
    ├─► Update lastModified timestamp
    ├─► Auto-generate title (from 1st message)
    ├─► localStorage.setItem('sessions')
    └─► renderHistoryList()
```

---

## 🔐 Security Architecture

### **API Key Protection:**
```
API Keys Storage:
├─ Development: .env file (gitignored)
└─ Production: Platform environment variables
       ├─ Render: Server settings
       └─ Netlify: Build environment

Access Control:
├─ Client: No API keys exposed
├─ Proxy: Keys stored in process.env
└─ API: Authorization headers only in server
```

### **Authentication Flow:**
```
Firebase Auth
    │
    ▼
Google OAuth 2.0
    │
    ├─► User clicks login
    ├─► Firebase popup
    ├─► Google consent screen
    ├─► Token received
    │
    └─► onAuthStateChanged()
            │
            ├─► if (user) → handleUserLogin()
            │       └─► Store currentUser
            │       └─► Update UI
            │       └─► Load sessions
            │
            └─► if (!user) → handleUserLogout()
                    └─► Clear currentUser
                    └─► Show login overlay
```

### **CORS Configuration:**
```javascript
// server.js
app.use(cors()); // Allow all origins

// netlify.toml
[[headers]]
  for = "/*"
  X-Frame-Options = "SAMEORIGIN"
  X-Content-Type-Options = "nosniff"
  X-XSS-Protection = "1; mode=block"
```

---

## 🗄️ Data Storage

### **localStorage Schema:**
```javascript
// sessions object
{
  "1732451234567": {
    id: "1732451234567",
    title: "Explain quantum computing",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant."
      },
      {
        role: "user",
        content: "Explain quantum computing"
      },
      {
        role: "assistant",
        content: "Quantum computing is..."
      }
    ],
    lastModified: 1732451234600
  },
  "1732455678910": { ... }
}

// currentSessionId
"1732451234567"

// theme
"dark" | "light"
```

### **Session Size Limits:**
- localStorage max: ~5-10 MB (browser-dependent)
- Average session: ~10-50 KB
- Estimated capacity: 100-500 sessions

---

## 🔧 External Dependencies

### **Frontend CDN:**
```html
<!-- Firebase -->
https://www.gstatic.com/firebasejs/10.8.0/
  - firebase-app-compat.js
  - firebase-auth-compat.js
  - firebase-analytics-compat.js

<!-- Markdown & Syntax -->
https://cdn.jsdelivr.net/npm/marked/marked.min.js
https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/
  - highlight.min.js
  - styles/atom-one-dark.min.css

<!-- Typography -->
https://fonts.googleapis.com/css2
  - Inter: 400, 500, 600
  - Space Grotesk: 700
```

### **Backend NPM:**
```json
{
  "express": "^4.18.2",      // Web server
  "cors": "^2.8.5",          // CORS middleware
  "node-fetch": "^2.6.7"     // HTTP client
}
```

---

## 🚀 Deployment Architecture

### **Frontend (Netlify):**
```
GitHub Repository
    │
    └─► Netlify Auto-Deploy
            │
            ├─► Build: No build step (static)
            ├─► Publish: Root directory
            ├─► CDN: Global edge network
            └─► HTTPS: Automatic SSL
                    │
                    ▼
            https://cheppu-ai.netlify.app
```

### **Backend (Render):**
```
GitHub Repository
    │
    └─► Render Auto-Deploy
            │
            ├─► Build: npm install
            ├─► Start: node server.js
            ├─► Environment: HF_TOKEN, GROQ_API_KEY
            └─► Region: US-West (free tier)
                    │
                    ▼
            https://cheppu-aichatbox.onrender.com
```

---

## 📊 Performance Characteristics

### **Load Performance:**
```
Initial Load (cached):
├─ HTML: ~12 KB
├─ CSS: ~15 KB
├─ JS: ~29 KB
├─ Service Worker: ~3 KB
└─ Total Core: ~59 KB

External Resources:
├─ Firebase SDK: ~200 KB
├─ Marked.js: ~50 KB
├─ Highlight.js: ~80 KB
└─ Google Fonts: ~40 KB
```

### **Runtime Performance:**
```
Chat Response Time:
├─ Model processing: 500ms - 3s
├─ Network latency: 100ms - 500ms
├─ Rendering: <50ms
└─ Total: 650ms - 3.5s

Image Generation:
├─ API processing: 5s - 15s
├─ Network: 500ms - 2s
└─ Total: 5.5s - 17s
```

---

## 🧪 Testing Strategy

### **Current Testing:**
- ✅ Manual browser testing
- ✅ Cross-browser compatibility
- ✅ Responsive design testing
- ✅ PWA installation testing
- ✅ API endpoint testing

### **Missing Coverage:**
- ❌ Automated unit tests
- ❌ Integration tests
- ❌ E2E tests
- ❌ Performance benchmarks
- ❌ Accessibility audits

---

## 🔮 Scalability Considerations

### **Current Limits:**
- **Concurrent Users:** ~50-100 (Render free tier)
- **API Rate Limits:** 30 RPM (Groq)
- **Storage:** 5-10 MB localStorage per user
- **Sessions:** ~100-500 per user

### **Scaling Options:**
1. **Backend:** Upgrade Render instance
2. **Database:** Add MongoDB/Firebase for cloud storage
3. **CDN:** Move assets to dedicated CDN
4. **Caching:** Add Redis for API response caching
5. **Load Balancing:** Multiple Render instances

---

**Document Version:** 1.0  
**Last Updated:** November 24, 2025  
**Maintained By:** Project Team
