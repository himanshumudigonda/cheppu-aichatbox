from PIL import Image
import os

def resize_icon(input_path, output_path, size):
    """Resize image to specified size maintaining aspect ratio with padding"""
    try:
        # Open the original image
        img = Image.open(input_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Create a new image with white/transparent background
        new_img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
        
        # Calculate resize dimensions (maintain aspect ratio)
        img.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Paste the resized image in the center
        offset_x = (size - img.width) // 2
        offset_y = (size - img.height) // 2
        new_img.paste(img, (offset_x, offset_y), img)
        
        # Save the result
        new_img.save(output_path, 'PNG', optimize=True)
        print(f'✅ Created {output_path} ({size}x{size})')
        
    except Exception as e:
        print(f'❌ Error creating {output_path}: {e}')

def main():
    input_file = 'icon-original.png'
    
    if not os.path.exists(input_file):
        print(f'❌ Error: {input_file} not found!')
        print('Please ensure the Cheppu AI logo is saved as icon-original.png')
        return
    
    # Create required icon sizes
    resize_icon(input_file, 'icon-192.png', 192)
    resize_icon(input_file, 'icon-512.png', 512)
    
    print('\n🎉 All icons created successfully!')
    print('📝 Next steps:')
    print('   1. git add icon-192.png icon-512.png')
    print('   2. git commit -m "Add Cheppu AI brand icons"')
    print('   3. git push origin master')

if __name__ == '__main__':
    main()
