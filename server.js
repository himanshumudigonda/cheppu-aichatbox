// Production-ready Express server for HuggingFace API proxy
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.HF_TOKEN || "YOUR_HUGGINGFACE_TOKEN_HERE";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";

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
            // Priority list of models for fallback - comprehensive list from user requirements
            const modelPriority = [
                model, // Try requested model first
                "llama-3.1-8b-instant",
                "llama-3.3-70b-versatile",
                "qwen/qwen3-32b",
                "groq/compound",
                "groq/compound-mini",
                "meta-llama/llama-4-maverick-17b-128e-instruct",
                "meta-llama/llama-4-scout-17b-16e-instruct",
                "moonshotai/kimi-k2-instruct",
                "moonshotai/kimi-k2-instruct-0905",
                "openai/gpt-oss-120b",
                "openai/gpt-oss-20b",
                "openai/gpt-oss-safeguard-20b",
                // Additional reliable fallbacks
                "gemma2-9b-it",
                "mixtral-8x7b-32768"
            ].filter(Boolean); // Remove null/undefined

            // Remove duplicates
            const uniqueModels = [...new Set(modelPriority)];
            
            console.log(`[${new Date().toISOString()}] Chat request. Attempting models: ${uniqueModels.join(', ')}`);

            let lastError = null;
            const chatUrl = 'https://api.groq.com/openai/v1/chat/completions';

            for (const currentModel of uniqueModels) {
                try {
                    console.log(`Trying model: ${currentModel}...`);
                    
                    const response = await fetch(chatUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${GROQ_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: currentModel,
                            messages: messages,
                            temperature: 0.7,
                            max_tokens: 4096
                        })
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.warn(`Model ${currentModel} failed: ${response.status} - ${errorText}`);
                        
                        // If it's an auth error, don't retry other models (key is invalid)
                        if (response.status === 401) {
                            throw new Error('Invalid API Key');
                        }
                        
                        lastError = new Error(`Model ${currentModel} failed: ${response.status}`);
                        continue; // Try next model
                    }

                    const result = await response.json();
                    console.log(`Success with model: ${currentModel}`);
                    
                    // Add metadata about which model was actually used
                    result.used_model = currentModel;
                    return res.json(result);

                } catch (err) {
                    console.error(`Error with model ${currentModel}:`, err.message);
                    lastError = err;
                    // Continue to next model
                }
            }

            // If we get here, all models failed
            console.error('All models failed');
            return res.status(500).json({
                error: 'All AI models are currently unavailable. Please try again later.',
                details: lastError ? lastError.message : 'Unknown error'
            });
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
