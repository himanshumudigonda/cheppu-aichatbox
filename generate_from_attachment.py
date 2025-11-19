"""Generate icons from the actual Cheppu AI brand image provided by user."""
from pathlib import Path
from PIL import Image
import io
import base64

# Your actual Cheppu AI logo (base64 encoded from attachment)
LOGO_BASE64 = """
iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSogMAhKFS==
"""  # Truncated for brevity - will use attachment file directly

OUT_DIR = Path('icons')
SIZES = [16, 32, 64, 128, 192, 256, 384, 512]
MASKABLE_SIZES = [192, 512]
PADDING_RATIO = 0.15


def load_from_file():
    """Load the actual attachment image."""
    # In practice, save the attachment as cheppu-logo.png first
    return Image.open('cheppu-logo.png').convert('RGBA')


def save_scaled(img: Image.Image, size: int, name: str):
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    square = img.crop((left, top, left + side, top + side))
    resized = square.resize((size, size), Image.LANCZOS)
    outfile = OUT_DIR / name
    resized.save(outfile, format='PNG', optimize=True)
    print(f"✓ {outfile}")


def make_maskable(img: Image.Image, size: int, name: str):
    w, h = img.size
    side = min(w, h)
    square = img.crop(((w-side)//2, (h-side)//2, (w+side)//2, (h+side)//2))
    square = square.resize((size, size), Image.LANCZOS)
    
    pad = int(size * PADDING_RATIO)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    inner_size = size - pad * 2
    square = square.resize((inner_size, inner_size), Image.LANCZOS)
    canvas.paste(square, (pad, pad), square)
    
    outfile = OUT_DIR / name
    canvas.save(outfile, format='PNG', optimize=True)
    print(f"✓ {outfile} (maskable)")


def main():
    OUT_DIR.mkdir(exist_ok=True)
    
    print("Loading your Cheppu AI brand logo...")
    src = load_from_file()
    print(f"Source: {src.size[0]}x{src.size[1]}px\n")
    
    print("Generating standard icons:")
    for s in SIZES:
        save_scaled(src, s, f"cheppu-icon-{s}.png")
    
    print("\nGenerating maskable icons:")
    for s in MASKABLE_SIZES:
        make_maskable(src, s, f"cheppu-icon-maskable-{s}.png")
    
    print("\n✅ All icons generated from your brand logo!")


if __name__ == '__main__':
    main()
