# Cheppu - AI Chat Assistant

A powerful AI chatbot with Chat, Image Generation, and Text-to-Speech capabilities.

![Cheppu AI](https://img.shields.io/badge/AI-Chatbot-blue)
![HuggingFace](https://img.shields.io/badge/HuggingFace-API-yellow)

## 🌟 Features

- 💬 **AI Chat** - Multiple advanced models (DeepSeek V3.1, Llama 3.3 70B, etc.)
- 🎨 **Image Generation** - FLUX.1 Dev, Stable Diffusion XL
- 🔊 **Text-to-Speech** - Meta MMS TTS, Bark, SpeechT5
- 🎯 **Modern UI/UX** - Microsoft Copilot-inspired dark theme
- 📱 **Responsive Design** - Works on all devices

## 🚀 Quick Deployment to GitHub + Hosting

### Step 1: Upload to GitHub

1. Create a new repository on GitHub
2. In your folder, run:
```bash
git init
git add .
git commit -m "Initial commit - Cheppu AI Chatbot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cheppu-ai-chatbot.git
git push -u origin main
```

### Step 2: Deploy Backend (Required for Image & TTS)

#### **Option A: Render.com** (Recommended - Free)
1. Go to [render.com](https://render.com) → Sign up
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select your repo
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variable**: 
     - Key: `HF_TOKEN`
     - Value: Your HuggingFace token
5. Click **"Create Web Service"**
6. Copy your URL: `https://your-app.onrender.com`

#### **Option B: Vercel.com**
1. Go to [vercel.com](https://vercel.com) → Import repo
2. Add environment variable: `HF_TOKEN`
3. Deploy → Copy URL

#### **Option C: Railway.app**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add `HF_TOKEN` variable
4. Copy deployment URL

### Step 3: Update Frontend

In `script.js`, change:
```javascript
const useProxyServer = true;
const proxyUrl = "https://your-backend-url.onrender.com"; // Your backend URL
```

### Step 4: Deploy Frontend (Optional)

- **GitHub Pages**: Settings → Pages → Deploy from main
- **Netlify**: Drag folder or connect GitHub  
- **Vercel**: Import repository

## 🔑 Get Your API Key

Free HuggingFace token: https://huggingface.co/settings/tokens

## 📦 Local Development

```bash
npm install
npm start  # Starts backend on localhost:3000
```

Then open `index.html` in browser

## 📁 Project Files

- `index.html` - Main interface
- `script.js` - Frontend logic
- `styles.css` - Styling
- `server.js` - Backend proxy (Express)
- `package.json` - Dependencies
- `vercel.json` - Vercel config
- `render.yaml` - Render config
- `DEPLOYMENT.md` - Detailed deployment guide

## 🖼️ Branding & Icons

To use the Cheppu AI brand icon across the PWA:

1. Place your source logo PNG (transparent background) in the project root as `cheppu-logo.png`.
2. Generate the icon set:
  ```bash
  pip install pillow  # if not already installed
  python generate_icons.py
  ```
3. This creates multiple sizes under `icons/` (16→512) plus maskable variants used by Android installers.
4. Manifest (`manifest.json`) already references these files; redeploy after generation.
5. Re-run PWABuilder to confirm the correct logo appears.

If PWABuilder still shows an old icon, clear its cache or append a cache-busting query (e.g. `https://your-site.netlify.app/manifest.json?rev=1`).

## 🎯 How to Use

1. **Chat Mode**: Talk with AI models
2. **Image Mode**: Generate images from text
3. **TTS Mode**: Convert text to speech

## 🛠️ Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- APIs: HuggingFace Inference API

## 📝 License

MIT License - Free for personal and commercial use

---

⭐ **Star this repo if you find it helpful!**

📖 See `DEPLOYMENT.md` for detailed deployment instructions
