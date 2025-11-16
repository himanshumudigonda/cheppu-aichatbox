# 🚀 Quick Deployment Guide

## Deploy Backend to Render (Easiest - Free Tier Available)

### Step 1: Create a GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `cheppu-ai-chatbot`)
3. Upload all files from your folder

### Step 2: Deploy to Render
1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your `cheppu-ai-chatbot` repository
5. Configure:
   - **Name**: `cheppu-ai-proxy`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
6. Add Environment Variable:
   - **Key**: `HF_TOKEN`
   - **Value**: Your HuggingFace API token
7. Click **"Create Web Service"**
8. Wait 2-3 minutes for deployment
9. Copy your URL (e.g., `https://cheppu-ai-proxy.onrender.com`)

### Step 3: Update Frontend
1. Open `script.js`
2. Change these lines:
   ```javascript
   const useProxyServer = true;
   const proxyUrl = "https://cheppu-ai-proxy.onrender.com"; // Your Render URL
   ```
3. Save and push to GitHub

### Step 4: Deploy Frontend (Optional)
**GitHub Pages** (Free):
1. Go to your repo → Settings → Pages
2. Source: Deploy from branch → `main`
3. Save
4. Your site: `https://YOUR_USERNAME.github.io/cheppu-ai-chatbot/`

**Netlify** (Free):
1. Go to https://app.netlify.com
2. Drag and drop your folder (or connect GitHub)
3. Done! Get your URL

---

## Alternative: Deploy to Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variable:
   - **Key**: `HF_TOKEN`
   - **Value**: Your HuggingFace token
4. Deploy
5. Copy your URL
6. Update `script.js` with your Vercel URL

---

## Alternative: Deploy to Railway

1. Go to https://railway.app
2. **"New Project"** → **"Deploy from GitHub"**
3. Select your repository
4. Add environment variable `HF_TOKEN`
5. Copy your deployment URL
6. Update `script.js`

---

## 🎯 Final Checklist

✅ Backend deployed to Render/Vercel/Railway
✅ Got backend URL (e.g., `https://your-app.onrender.com`)
✅ Updated `script.js`:
   - `useProxyServer = true`
   - `proxyUrl = "your-backend-url"`
✅ Frontend deployed or opened locally
✅ All three modes working (Chat, Image, TTS)

---

## 🆘 Troubleshooting

**Backend not working?**
- Check environment variable `HF_TOKEN` is set
- Check deployment logs on Render/Vercel
- Verify your HuggingFace token is valid

**CORS errors?**
- Make sure `useProxyServer = true` in `script.js`
- Verify `proxyUrl` matches your deployed backend URL

**"Failed to fetch" errors?**
- Wait a few seconds for models to load (especially on first request)
- Check your internet connection
- Verify backend is running (visit backend URL in browser)

---

## 📦 Complete File List to Upload to GitHub

```
cheppu-ai-chatbot/
├── index.html
├── styles.css
├── script.js
├── server.js
├── package.json
├── vercel.json
├── render.yaml
├── .gitignore
├── .env.example
├── README.md
└── DEPLOYMENT.md (this file)
```

---

🎉 **That's it! Your AI chatbot is now live!**
