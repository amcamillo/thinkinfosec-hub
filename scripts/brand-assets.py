"""Build web-size brand assets from the tracked sources.

Run from the repo root:  python scripts/brand-assets.py
Sources: assets/thinkinfosec-logo.png, assets/your-photo.png. Output: assets/brand/.
"""
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "brand"


def circle(im):
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0) + im.size, fill=255)
    out.paste(im, (0, 0), mask)
    return out


def logo():
    im = Image.open(ROOT / "assets" / "thinkinfosec-logo.png").convert("RGBA")
    w, h = im.size  # 1024 x 1032
    top = (h - (w - 24)) // 2
    badge = circle(im.crop((12, top, w - 12, top + w - 24)))  # square, trims the pale corners
    for px in (96, 192):
        badge.resize((px, px), Image.LANCZOS).save(OUT / f"logo-{px}.webp", quality=90)
    for px in (32, 180):
        badge.resize((px, px), Image.LANCZOS).save(OUT / f"favicon-{px}.png", optimize=True)


def photo():
    im = Image.open(ROOT / "assets" / "your-photo.png").convert("RGB")
    w, h = im.size
    px = im.load()
    # Background = pure black outside the oval + the white halo. A looser black
    # threshold eats the dark shirt and the neck shadow, so keep max < 10.
    is_bg = lambda c: min(c) > 185 or max(c) < 10
    seen = bytearray(w * h)
    queue = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x] or not is_bg(px[x, y]):
            continue
        seen[y * w + x] = 1
        queue.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    mask = Image.new("L", im.size, 255)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            if seen[y * w + x]:
                mp[x, y] = 0
    mask = mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    bg = Image.new("RGB", im.size)
    draw = ImageDraw.Draw(bg)
    top, bottom = (250, 228, 240), (222, 240, 248)  # #FAE4F0 -> #DEF0F8
    for y in range(h):
        t = y / (h - 1)
        draw.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    im = Image.composite(im, bg, mask)
    cx, cy, r = 196, 240, 178  # neck and shirt run to the bottom edge
    disc = circle(im.crop((cx - r, cy - r, cx + r, cy + r)))
    for size in (160, 320):
        disc.resize((size, size), Image.LANCZOS).save(OUT / f"photo-{size}.webp", quality=88)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    logo()
    photo()
    for f in sorted(OUT.iterdir()):
        print(f.name, f.stat().st_size)
