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
from PIL import Image, ImageDraw, ImageFont

SOURCE = Path('cheppu-logo.png')
OUT_DIR = Path('icons')
SIZES = [16, 32, 64, 128, 192, 256, 384, 512]
MASKABLE_SIZES = [192, 512]
PADDING_RATIO = 0.15  # 15% transparent padding for maskable icons


def ensure_or_create_source():
    """Ensure a source logo exists; if missing, auto-generate a branded base image.

    The generated image is a 1024x1024 PNG with gradient background,
    circular emblem, waving hand placeholder, and CHEPPU AI text.
    This is a fallback so icons can be produced quickly.
    Replace later with a high-resolution transparent logo for best quality.
    """
    if SOURCE.exists():
        return
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    # Gradient background
    bg = Image.new('RGBA', (size, size))
    for y in range(size):
        # vertical gradient from deep navy to muted purple
        r = 15 + int(30 * y/size)
        g = 15 + int(35 * y/size)
        b = 30 + int(60 * y/size)
        for x in range(size):
            bg.putpixel((x, y), (r, g, b, 255))
    img.alpha_composite(bg)

    draw = ImageDraw.Draw(img)
    center = size // 2
    emblem_radius = int(size * 0.32)
    # Emblem circle
    draw.ellipse((center - emblem_radius, center - emblem_radius - 80,
                  center + emblem_radius, center + emblem_radius - 80),
                 fill=(255, 255, 255, 25), outline=(102, 126, 234, 255), width=12)

    # Simple stylized face rectangle placeholder
    face_w = emblem_radius * 1.2
    face_h = emblem_radius * 0.9
    face_x0 = center - face_w/2
    face_y0 = center - face_h/2 - 80
    draw.rounded_rectangle((face_x0, face_y0, face_x0 + face_w, face_y0 + face_h),
                           radius=face_h*0.2, fill=(240, 180, 80, 255))

    # Waving hand (simplified)
    hand_r = int(emblem_radius * 0.35)
    hand_center_x = face_x0 + face_w + hand_r//2 - 20
    hand_center_y = face_y0 + hand_r
    draw.ellipse((hand_center_x-hand_r, hand_center_y-hand_r,
                  hand_center_x+hand_r, hand_center_y+hand_r), fill=(255, 211, 140, 255))
    # Fingers (lines)
    for i in range(5):
        angle_x = hand_center_x - hand_r//2 + i * (hand_r//4)
        draw.line((angle_x, hand_center_y-hand_r-10, angle_x, hand_center_y+hand_r//2), fill=(230, 180, 110, 255), width=6)

    # Text: CHEPPU AI
    try:
        font_main = ImageFont.truetype("arial.ttf", size//8)
        font_sub = ImageFont.truetype("arial.ttf", size//18)
    except Exception:
        font_main = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    text_main = "CHEPPU AI"
    text_sub = "Chat AI Bharatiya Style"
    # Measure text using textbbox for compatibility
    tm_box = draw.textbbox((0, 0), text_main, font=font_main)
    tm_w, tm_h = tm_box[2] - tm_box[0], tm_box[3] - tm_box[1]
    ts_box = draw.textbbox((0, 0), text_sub, font=font_sub)
    ts_w, ts_h = ts_box[2] - ts_box[0], ts_box[3] - ts_box[1]
    draw.text((center - tm_w/2, center + emblem_radius - 40), text_main, font=font_main, fill=(220, 230, 255, 255))
    draw.text((center - ts_w/2, center + emblem_radius + tm_h - 40), text_sub, font=font_sub, fill=(255, 200, 0, 255))

    img.save(SOURCE)
    print(f"Fallback source logo generated -> {SOURCE}")


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
    ensure_or_create_source()
    src = load_source_rgba()

    for s in SIZES:
        save_scaled(src, s, f"cheppu-icon-{s}.png")

    for s in MASKABLE_SIZES:
        make_maskable(src, s, f"cheppu-icon-maskable-{s}.png")

    print("All icons generated. Update deployed site and re-run PWABuilder if needed.")


if __name__ == '__main__':
    main()
