"""Generate Cheppu AI icon set from source PNG.

Usage:
1. Place source logo image as 'cheppu-logo.png' in project root (transparent background preferred, larger than 512x512 for best quality).
2. Activate virtual environment (if not already) and install Pillow if missing:
   pip install pillow
3. Run:
   python generate_icons.py
4. Generated icons appear in ./icons/

Creates sizes: 16, 32, 64, 128, 192, 256, 384, 512 and maskable variants (192, 512) with safe padding.
"""
from pathlib import Path
from PIL import Image

SOURCE = Path('cheppu-logo.png')
OUT_DIR = Path('icons')
SIZES = [16, 32, 64, 128, 192, 256, 384, 512]
MASKABLE_SIZES = [192, 512]
PADDING_RATIO = 0.15  # 15% transparent padding for maskable icons


def ensure_source():
    if not SOURCE.exists():
        raise FileNotFoundError(f"Source image '{SOURCE}' not found. Place your logo PNG at project root.")


def load_source_rgba():
    img = Image.open(SOURCE).convert('RGBA')
    # Upscale if smaller than largest target to reduce quality loss
    max_size = max(SIZES)
    if min(img.size) < max_size:
        scale = max_size / min(img.size)
        new_size = (int(img.width * scale), int(img.height * scale))
        img = img.resize(new_size, Image.LANCZOS)
    return img


def save_scaled(img: Image.Image, size: int, name: str):
    # Center-crop to square before scaling for consistency
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    square = img.crop((left, top, left + side, top + side))
    resized = square.resize((size, size), Image.LANCZOS)
    outfile = OUT_DIR / name
    resized.save(outfile, format='PNG')
    print(f"Saved {outfile}")


def make_maskable(img: Image.Image, size: int, name: str):
    # Create square with padding
    w, h = img.size
    side = min(w, h)
    square = img.crop(((w - side)//2, (h - side)//2, (w + side)//2, (h + side)//2)).resize((size, size), Image.LANCZOS)
    pad = int(size * PADDING_RATIO)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    inner_size = size - pad * 2
    square = square.resize((inner_size, inner_size), Image.LANCZOS)
    canvas.paste(square, (pad, pad), square)
    outfile = OUT_DIR / name
    canvas.save(outfile, format='PNG')
    print(f"Saved maskable {outfile}")


def main():
    OUT_DIR.mkdir(exist_ok=True)
    ensure_source()
    src = load_source_rgba()

    for s in SIZES:
        save_scaled(src, s, f"cheppu-icon-{s}.png")

    for s in MASKABLE_SIZES:
        make_maskable(src, s, f"cheppu-icon-maskable-{s}.png")

    print("All icons generated. Update deployed site and re-run PWABuilder if needed.")


if __name__ == '__main__':
    main()
