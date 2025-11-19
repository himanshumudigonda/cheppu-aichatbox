// Simple HTTPS test server for PWA development
// Run with: node test-pwa-server.js

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const USE_HTTPS = false; // Set to true if you have SSL certificates

// MIME types for proper content serving
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json'
};

const requestHandler = (req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Parse URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Security: prevent directory traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const extname = String(path.extname(safePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read and serve file
    fs.readFile(safePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            // Success
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
};

// Create server
const server = USE_HTTPS ? https.createServer({
    // Add your SSL certificate here if using HTTPS
    // key: fs.readFileSync('key.pem'),
    // cert: fs.readFileSync('cert.pem')
}, requestHandler) : http.createServer(requestHandler);

server.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 PWA Test Server Running');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://YOUR_IP:${PORT}`);
    console.log('');
    console.log('📱 To test PWA features:');
    console.log('   1. Open Chrome/Edge DevTools (F12)');
    console.log('   2. Go to Application tab');
    console.log('   3. Check Manifest and Service Workers');
    console.log('');
    console.log('🔒 For HTTPS (required for full PWA):');
    console.log('   - Use: npx ngrok http ' + PORT);
    console.log('   - Or deploy to: Vercel, Netlify, or Render');
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('═══════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
