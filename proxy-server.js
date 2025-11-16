// Simple proxy server to bypass CORS restrictions
// Run this with: node proxy-server.js

const http = require('http');
const https = require('https');

const API_KEY = process.env.HF_TOKEN || "YOUR_HUGGINGFACE_TOKEN_HERE";
const PORT = 3000;

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const { model, inputs, type } = requestData;

                console.log(`\n[${new Date().toISOString()}] ${type} request for model: ${model}`);
                console.log(`Input: ${inputs.substring(0, 50)}...`);

                // Make request to HuggingFace
                const options = {
                    hostname: 'api-inference.huggingface.co',
                    path: `/models/${model}`,
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                    }
                };

                const hfReq = https.request(options, (hfRes) => {
                    console.log(`HuggingFace response status: ${hfRes.statusCode}`);

                    // Set appropriate content type
                    if (type === 'image') {
                        res.setHeader('Content-Type', 'image/png');
                    } else if (type === 'audio') {
                        res.setHeader('Content-Type', 'audio/wav');
                    } else {
                        res.setHeader('Content-Type', hfRes.headers['content-type'] || 'application/octet-stream');
                    }

                    res.writeHead(hfRes.statusCode);

                    // Stream the response
                    hfRes.on('data', chunk => {
                        res.write(chunk);
                    });

                    hfRes.on('end', () => {
                        res.end();
                        console.log(`Request completed successfully`);
                    });
                });

                hfReq.on('error', (error) => {
                    console.error('HuggingFace API error:', error);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: error.message }));
                });

                // Send the request body
                hfReq.write(JSON.stringify({
                    inputs: inputs,
                    options: {
                        wait_for_model: true,
                        use_cache: false
                    }
                }));
                hfReq.end();

            } catch (error) {
                console.error('Parse error:', error);
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
    } else {
        res.writeHead(405);
        res.end('Method not allowed');
    }
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║   🚀 Proxy Server Running on http://localhost:${PORT}   ║
║                                                        ║
║   This server bypasses CORS restrictions for          ║
║   HuggingFace API calls (Image & TTS)                 ║
║                                                        ║
║   Keep this terminal window open while using the app  ║
╚════════════════════════════════════════════════════════╝
`);
});
