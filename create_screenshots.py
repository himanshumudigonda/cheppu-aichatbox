from PIL import Image, ImageDraw, ImageFont
import os

def create_screenshot(width, height, filename, title):
    """Create a simple screenshot placeholder"""
    # Create image with gradient background
    img = Image.new('RGB', (width, height), '#0f0f1e')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple mockup
    # Header bar
    draw.rectangle([(0, 0), (width, 70)], fill='#16213e')
    
    # Add text
    try:
        # Try to use a larger font
        font_large = ImageFont.truetype("arial.ttf", 60)
        font_small = ImageFont.truetype("arial.ttf", 30)
    except:
        # Fallback to default font
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Title
    text = "Cheppu AI"
    bbox = draw.textbbox((0, 0), text, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    draw.text((x, y), text, fill='#667eea', font=font_large)
    
    # Subtitle
    subtitle = "Chat AI Bharatiya Style"
    bbox2 = draw.textbbox((0, 0), subtitle, font=font_small)
    text_width2 = bbox2[2] - bbox2[0]
    x2 = (width - text_width2) // 2
    y2 = y + text_height + 20
    draw.text((x2, y2), subtitle, fill='#f0932b', font=font_small)
    
    # Save
    img.save(filename, 'PNG', optimize=True)
    print(f'✅ Created {filename} ({width}x{height})')

def main():
    # Create screenshots
    create_screenshot(1280, 720, 'screenshot-desktop.png', 'Desktop View')
    create_screenshot(750, 1334, 'screenshot-mobile.png', 'Mobile View')
    
    print('\n🎉 All screenshots created!')

if __name__ == '__main__':
    main()
