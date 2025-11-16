// Production-ready Express server for HuggingFace API proxy
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.HF_TOKEN || "YOUR_HUGGINGFACE_TOKEN_HERE";
const OPENROUTER_API_KEY = "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";

// Log startup info (token masked for security)
console.log('Server starting...');
console.log('PORT:', PORT);
console.log('HF_TOKEN present:', !!process.env.HF_TOKEN);
console.log('API_KEY starts with:', API_KEY ? API_KEY.substring(0, 6) + '...' : 'NOT SET');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'Cheppu AI Chatbot Proxy Server',
        endpoints: {
            proxy: 'POST /',
            health: 'GET /health'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main proxy endpoint
app.post('/', async (req, res) => {
    try {
        const { model, inputs, type, messages } = req.body;

        // Handle chat requests
        if (type === 'chat' || messages) {
            // Route to OpenRouter for specific models
            const isOpenRouterModel = model.includes(':free') || model.startsWith('qwen/');
            const chatUrl = isOpenRouterModel 
                ? 'https://openrouter.ai/api/v1/chat/completions'
                : 'https://router.huggingface.co/v1/chat/completions';
            
            const apiKey = isOpenRouterModel ? OPENROUTER_API_KEY : API_KEY;
            
            console.log(`[${new Date().toISOString()}] Chat request for model: ${model} (${isOpenRouterModel ? 'OpenRouter' : 'HuggingFace'})`);
            
            const headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            };
            
            if (isOpenRouterModel) {
                headers['HTTP-Referer'] = 'https://cheppuai.netlify.app';
                headers['X-Title'] = 'Cheppu AI Chatbot';
            }
            
            const response = await fetch(chatUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: model,
                    messages: messages
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Chat API error: ${response.status}`, errorText);
                return res.status(response.status).json({
                    error: `Chat API error: ${response.status}`,
                    details: errorText
                });
            }

            const result = await response.json();
            return res.json(result);
        }

        // Handle image and TTS requests
        if (!model || !inputs) {
            return res.status(400).json({ error: 'Missing required fields: model and inputs' });
        }

        console.log(`[${new Date().toISOString()}] ${type || 'unknown'} request for model: ${model}`);
        console.log(`Input length: ${inputs.length} characters`);

        // Make request to HuggingFace - NEW API ENDPOINT
        const hfUrl = `https://router.huggingface.co/hf-inference/models/${model}`;
        
        const response = await fetch(hfUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: inputs,
                options: {
                    wait_for_model: true,
                    use_cache: false
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HuggingFace API error: ${response.status}`, errorText);
            
            // Return the error with status code
            return res.status(response.status).json({
                error: `HuggingFace API error: ${response.status}`,
                details: errorText
            });
        }

        // Get content type from response
        const contentType = response.headers.get('content-type');
        
        // Stream the binary response
        const buffer = await response.buffer();
        
        // Set appropriate content type
        if (type === 'image') {
            res.setHeader('Content-Type', 'image/png');
        } else if (type === 'audio') {
            res.setHeader('Content-Type', 'audio/wav');
        } else {
            res.setHeader('Content-Type', contentType || 'application/octet-stream');
        }

        res.send(buffer);
        console.log(`Request completed successfully (${buffer.length} bytes)`);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║   🚀 Cheppu AI Proxy Server                           ║
║                                                        ║
║   Running on: http://localhost:${PORT}                    ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                        ║
║   API Key: ${API_KEY.substring(0, 10)}...                        ║
║                                                        ║
║   Ready to handle Image & TTS requests!               ║
╚════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
