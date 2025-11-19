from PIL import Image
import os

# Check if logo file exists
if not os.path.exists('cheppu-logo.png'):
    print("ERROR: Please save your Cheppu AI logo as 'cheppu-logo.png' in this folder first!")
    print("Right-click the logo image and save it as cheppu-logo.png")
    exit(1)

# Open the source logo
print("Opening cheppu-logo.png...")
img = Image.open('cheppu-logo.png')
print(f"Original size: {img.size}")

# Ensure image has transparency (RGBA mode)
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Generate standard icons
print("\nGenerating standard icons...")
sizes = {
    'icon-192.png': (192, 192),
    'icon-512.png': (512, 512),
    'apple-icon-180.png': (180, 180)
}

for filename, size in sizes.items():
    resized = img.resize(size, Image.Resampling.LANCZOS)
    resized.save(filename, 'PNG')
    print(f"✓ Created {filename} ({size[0]}x{size[1]})")

# Generate maskable icons (with padding for safe area)
print("\nGenerating maskable icons (with padding)...")
maskable_sizes = {
    'manifest-icon-192.maskable.png': 192,
    'manifest-icon-512.maskable.png': 512
}

for filename, size in maskable_sizes.items():
    # Create a new transparent image with the target size
    maskable = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Calculate padding (20% on each side for safe area)
    padding = int(size * 0.2)
    inner_size = size - (2 * padding)
    
    # Resize logo to fit in the safe area
    resized_logo = img.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
    
    # Paste logo in the center
    maskable.paste(resized_logo, (padding, padding), resized_logo)
    
    # Save maskable icon
    maskable.save(filename, 'PNG')
    print(f"✓ Created {filename} ({size}x{size} with padding)")

print("\n✅ All icons generated successfully!")
print("\nNext steps:")
print("1. Check the generated icon files")
print("2. Commit and push: git add *.png && git commit -m 'Update icons with Cheppu AI branding' && git push")
