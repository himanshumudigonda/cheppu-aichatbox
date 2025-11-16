# Security Notice

## API Key Configuration

⚠️ **IMPORTANT**: This project requires a HuggingFace API token to function.

### For Local Development:

1. Get a free token from: https://huggingface.co/settings/tokens
2. Create a `.env` file in the project root:
   ```
   HF_TOKEN=paste_your_token_here
   ```
3. Update `script.js` line 3 with your token (for local testing only)

### For Production Deployment:

**Never commit your API token to GitHub!**

Instead, set it as an environment variable on your hosting platform:

#### Render.com:
- Go to Environment → Add Environment Variable
- Key: `HF_TOKEN`
- Value: Your HuggingFace token

#### Vercel:
- Project Settings → Environment Variables
- Add `HF_TOKEN` with your token

#### Railway:
- Variables tab → Add Variable
- `HF_TOKEN` = your token

### Why This Matters:

✅ Keeps your token secure
✅ Prevents unauthorized API usage
✅ Protects your account from abuse
✅ Follows security best practices

### Getting Your Token:

1. Sign up at https://huggingface.co
2. Go to Settings → Access Tokens
3. Click "New token"
4. Select "Read" permissions
5. Copy and use in your environment variables

---

🔒 Never share your API token publicly or commit it to version control!
