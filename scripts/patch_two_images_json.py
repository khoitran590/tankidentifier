#!/usr/bin/env python3
"""Ensure each tank in tanks.json lists two image paths (l1 + l2)."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "src" / "data" / "tanks.json"


def second_image_path(slug: str, images: list[str]) -> str:
    folder = f"/tanks/{slug}/"
    for src in images:
        if src.startswith(folder) and src.endswith("_l2.jpg"):
            return src
    return f"{folder}{slug}_l2.jpg"


def main() -> None:
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    tanks = data.get("tanks", [])
    updated = 0
    for tank in tanks:
        slug = tank["slug"]
        images: list[str] = list(tank.get("images") or [])
        if not images:
            l1 = f"/tanks/{slug}/{slug}_l1.jpg"
            images = [l1]
        l1 = images[0]
        l2 = second_image_path(slug, images)
        new_images = [l1, l2] if l1 != l2 else [l1, l2]
        if tank.get("images") != new_images:
            updated += 1
        tank["images"] = new_images
        tank["thumbnail"] = l1

    data["imagesPerTank"] = 2
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

    print(f"Updated {updated} of {len(tanks)} tanks -> 2 images each in {DATA_FILE}")


if __name__ == "__main__":
    main()
