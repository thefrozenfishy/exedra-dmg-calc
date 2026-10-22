#!/usr/bin/env python3
"""Compose kioku thumbnails with a count badge ("1", "2", "4", "5", ...) in the bottom-left corner.

The Magia Exedra data sheet links images with =IMAGE(url), which takes a single URL, so a
thumbnail + badge has to exist as one file. This writes, for every combo in badges.json:

    public/sheet/kioku/<kioku>_b<badge>.png  =  public/kioku_images/<kioku>_thumbnail.png
                                                + public/sheet/badges/<badge>.png at badgePos

Badge templates were cut from the sheet's own images (same size/position as in the game UI)
at the 256 px thumbnail scale. Usage:  python3 scripts/sheet/compose_badges.py
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
cfg = json.loads((Path(__file__).with_name("badges.json")).read_text())
out_dir = PUBLIC / "sheet" / "kioku"
out_dir.mkdir(parents=True, exist_ok=True)

x, y = cfg["badgePos"]
for combo in cfg["combos"]:
    kioku, badge = combo["kioku"], combo["badge"]
    base = Image.open(PUBLIC / "kioku_images" / f"{kioku}_thumbnail.png").convert("RGBA")
    if base.size != (256, 256):
        base = base.resize((256, 256), Image.LANCZOS)
    mark = Image.open(PUBLIC / "sheet" / "badges" / f"{badge}.png").convert("RGBA")
    base.alpha_composite(mark, (x, y))
    dest = out_dir / f"{kioku}_b{badge}.png"
    base.save(dest, optimize=True)
    print(dest.relative_to(ROOT))
