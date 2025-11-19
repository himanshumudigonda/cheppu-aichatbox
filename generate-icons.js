const fs = require('fs');

// Simple PNG generator using canvas (if available) or creating a data URL
function createPNGIcon(size, filename) {
    // Create SVG with embedded design
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="#0f0f1e"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.36}" fill="url(#grad${size})"/>
  <path d="M${size/2} ${size * 0.26} L${size * 0.37} ${size * 0.42} H${size * 0.63} Z" fill="white" opacity="0.9"/>
  <path d="M${size/2} ${size * 0.74} L${size * 0.63} ${size * 0.58} H${size * 0.37} Z" fill="white" opacity="0.9"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.09}" fill="white" opacity="0.3"/>
</svg>`;

    fs.writeFileSync(filename, svg);
    console.log(`✅ Created ${filename}`);
}

// Create icons
createPNGIcon(192, 'icon-192.svg');
createPNGIcon(512, 'icon-512.svg');

console.log('\n📝 Note: These are SVG files. To create PNG files:');
console.log('1. Open the create-png-icons.html file in your browser');
console.log('2. Click the download buttons to save PNG icons');
console.log('3. Or use an online converter: https://cloudconvert.com/svg-to-png\n');
