#!/usr/bin/env python3
"""Compose kioku thumbnails with a badge, for =IMAGE() links in the Magia Exedra data sheet.

=IMAGE(url) takes a single URL, so thumbnail + badge has to exist as one file. For every combo in
badges.json this writes public/sheet/kioku/<kioku>_b<badge>.png from
public/kioku_images/<kioku>_thumbnail.png plus:

- a number badge ("1", "2", ...): the ascension badge drawn the same way as TierList.vue's
  .ascension-overlay (public/ascension_background.png with the number in bold black on top),
  scaled from its 60 px thumbnail to the 256 px one and kept inside the image;
- "new": public/sheet/badges/new.png (the game's NEW tag) in the top-left corner.

Usage:  python3 scripts/sheet/compose_badges.py
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
SIZE = 256
SCALE = SIZE / 60  # TierList.vue: .character-img is 60 px, .ascension-overlay 30 px, number 15 px bold
BADGE = round(30 * SCALE)
FONT_PX = round(15 * SCALE)
FONTS = ["arialbd.ttf", "Arial Bold.ttf", "LiberationSans-Bold.ttf", "DejaVuSans-Bold.ttf"]


def bold_font(px):
    for name in FONTS:
        try:
            return ImageFont.truetype(name, px)
        except OSError:
            continue
    return ImageFont.load_default(size=px)


cfg = json.loads(Path(__file__).with_name("badges.json").read_text())
out_dir = PUBLIC / "sheet" / "kioku"
out_dir.mkdir(parents=True, exist_ok=True)
asc_bg = Image.open(PUBLIC / "ascension_background.png").convert("RGBA").resize((BADGE, BADGE), Image.LANCZOS)
new_tag = Image.open(PUBLIC / "sheet" / "badges" / "new.png").convert("RGBA")
font = bold_font(FONT_PX)

for combo in cfg["combos"]:
    kioku, badge = combo["kioku"], combo["badge"]
    img = Image.open(PUBLIC / "kioku_images" / f"{kioku}_thumbnail.png").convert("RGBA")
    if img.size != (SIZE, SIZE):
        img = img.resize((SIZE, SIZE), Image.LANCZOS)
    if badge == "new":
        img.alpha_composite(new_tag, (0, 0))
    else:
        x, y = 0, SIZE - BADGE  # bottom-left corner
        img.alpha_composite(asc_bg, (x, y))
        ImageDraw.Draw(img).text((x + BADGE / 2, y + BADGE / 2), badge, font=font, fill="black", anchor="mm")
    dest = out_dir / f"{kioku}_b{badge}.png"
    img.save(dest, optimize=True)
    print(dest.relative_to(ROOT))
