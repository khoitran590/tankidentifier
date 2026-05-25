#!/usr/bin/env python3
"""Download Kaggle tank images and build tanks.json for the Next.js app."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def ensure_dependencies() -> None:
    try:
        import kagglehub  # noqa: F401
    except ImportError:
        req = ROOT / "requirements.txt"
        print(f"Installing Python packages for {sys.executable} …")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "-r", str(req)],
            cwd=ROOT,
        )


ensure_dependencies()
import kagglehub  # noqa: E402

PUBLIC_TANKS = ROOT / "public" / "tanks"
DATA_FILE = ROOT / "src" / "data" / "tanks.json"

# Approximate reference specs (public-domain military encyclopedia aggregates).
# Used as overrides or family defaults; not classified data.
SPEC_OVERRIDES: dict[str, dict] = {
    "m1_abrams": {
        "country": "United States",
        "era": "Cold War",
        "type": "Main Battle Tank",
        "weight_t": 57.3,
        "length_m": 9.83,
        "width_m": 3.66,
        "height_m": 2.44,
        "crew": 4,
        "main_gun": "105 mm M68 rifled",
        "secondary": "7.62 mm coaxial, 12.7 mm M2",
        "engine": "Honeywell AGT1500 gas turbine",
        "power_hp": 1500,
        "power_to_weight_hp_t": 26.2,
        "max_speed_kmh": 67,
        "range_km": 465,
        "armor": "Chobham composite",
    },
    "m1a2_abrams": {
        "country": "United States",
        "era": "Modern",
        "type": "Main Battle Tank",
        "weight_t": 62.5,
        "length_m": 9.83,
        "width_m": 3.66,
        "height_m": 2.44,
        "crew": 4,
        "main_gun": "120 mm M256 smoothbore",
        "secondary": "7.62 mm coaxial, 12.7 mm M2",
        "engine": "Honeywell AGT1500C gas turbine",
        "power_hp": 1500,
        "power_to_weight_hp_t": 24.0,
        "max_speed_kmh": 67,
        "range_km": 426,
        "armor": "Depleted uranium + composite",
    },
    "leopard_2a6": {
        "country": "Germany",
        "era": "Modern",
        "type": "Main Battle Tank",
        "weight_t": 62.3,
        "length_m": 9.97,
        "width_m": 3.75,
        "height_m": 3.0,
        "crew": 4,
        "main_gun": "120 mm L55 smoothbore",
        "secondary": "7.62 mm MG3 coaxial",
        "engine": "MTU MB 873 Ka-501 diesel",
        "power_hp": 1500,
        "power_to_weight_hp_t": 24.1,
        "max_speed_kmh": 72,
        "range_km": 550,
        "armor": "Composite + modular armor",
    },
    "t90": {
        "country": "Russia",
        "era": "Modern",
        "type": "Main Battle Tank",
        "weight_t": 46.5,
        "length_m": 9.53,
        "width_m": 3.78,
        "height_m": 2.22,
        "crew": 3,
        "main_gun": "125 mm 2A46M smoothbore",
        "secondary": "7.62 mm PKT, 12.7 mm Kord",
        "engine": "V-84MS diesel",
        "power_hp": 1000,
        "power_to_weight_hp_t": 21.5,
        "max_speed_kmh": 60,
        "range_km": 550,
        "armor": "Composite + Kontakt-5 ERA",
    },
    "challenger_2": {
        "country": "United Kingdom",
        "era": "Modern",
        "type": "Main Battle Tank",
        "weight_t": 62.5,
        "length_m": 11.55,
        "width_m": 3.5,
        "height_m": 2.49,
        "crew": 4,
        "main_gun": "120 mm L30A1 rifled",
        "secondary": "7.62 mm L94A1 coaxial",
        "engine": "Perkins CV12 diesel",
        "power_hp": 1200,
        "power_to_weight_hp_t": 19.2,
        "max_speed_kmh": 59,
        "range_km": 550,
        "armor": "Chobham derivative Dorchester",
    },
    "leclerc": {
        "country": "France",
        "era": "Modern",
        "type": "Main Battle Tank",
        "weight_t": 56.0,
        "length_m": 9.87,
        "width_m": 3.71,
        "height_m": 2.53,
        "crew": 3,
        "main_gun": "120 mm CN120-26 smoothbore",
        "secondary": "12.7 mm coaxial",
        "engine": "SEMI V8X1500 diesel",
        "power_hp": 1500,
        "power_to_weight_hp_t": 26.8,
        "max_speed_kmh": 71,
        "range_km": 550,
        "armor": "Composite modular",
    },
    "type_99": {
        "country": "China",
        "era": "Modern",
        "type": "Main Battle Tank",
        "weight_t": 54.0,
        "length_m": 11.0,
        "width_m": 3.5,
        "height_m": 2.37,
        "crew": 3,
        "main_gun": "125 mm ZPT98 smoothbore",
        "secondary": "7.62 mm coaxial, 12.7 mm AA",
        "engine": "150HB diesel",
        "power_hp": 1500,
        "power_to_weight_hp_t": 27.8,
        "max_speed_kmh": 80,
        "range_km": 500,
        "armor": "Composite + ERA",
    },
    "k2_black_panther_mbt": {
        "country": "South Korea",
        "era": "Modern",
        "type": "Main Battle Tank",
        "weight_t": 55.0,
        "length_m": 10.8,
        "width_m": 3.6,
        "height_m": 2.4,
        "crew": 3,
        "main_gun": "120 mm L55 smoothbore",
        "secondary": "7.62 mm coaxial, 12.7 mm K6",
        "engine": "Doosan DV27K diesel",
        "power_hp": 1500,
        "power_to_weight_hp_t": 27.3,
        "max_speed_kmh": 70,
        "range_km": 450,
        "armor": "Composite + ERA",
    },
    "merkava_mk4": {
        "country": "Israel",
        "era": "Modern",
        "type": "Main Battle Tank",
        "weight_t": 65.0,
        "length_m": 9.04,
        "width_m": 3.72,
        "height_m": 2.66,
        "crew": 4,
        "main_gun": "120 mm MG253 smoothbore",
        "secondary": "60 mm mortar, 7.62 mm coaxial",
        "engine": "General Dynamics GD883 diesel",
        "power_hp": 1500,
        "power_to_weight_hp_t": 23.1,
        "max_speed_kmh": 64,
        "range_km": 500,
        "armor": "Modular composite + Trophy APS",
    },
    "armata": {
        "country": "Russia",
        "era": "Modern",
        "type": "Main Battle Tank",
        "weight_t": 55.0,
        "length_m": 10.8,
        "width_m": 3.6,
        "height_m": 2.0,
        "crew": 3,
        "main_gun": "125 mm 2A82-1M smoothbore",
        "secondary": "Remote weapon station 12.7 mm",
        "engine": "12N360 diesel A-85-3A",
        "power_hp": 1500,
        "power_to_weight_hp_t": 27.3,
        "max_speed_kmh": 80,
        "range_km": 500,
        "armor": "Composite + Malachit ERA",
    },
}

FAMILY_DEFAULTS: list[tuple[str, dict]] = [
    (r"^leopard_2", {"country": "Germany", "era": "Modern", "type": "Main Battle Tank", "weight_t": 62.0, "crew": 4, "main_gun": "120 mm smoothbore", "power_hp": 1500, "max_speed_kmh": 72, "range_km": 500}),
    (r"^leopard", {"country": "Germany", "era": "Cold War", "type": "Main Battle Tank", "weight_t": 42.0, "crew": 4, "main_gun": "105 mm rifled", "power_hp": 830, "max_speed_kmh": 65, "range_km": 600}),
    (r"^m1a|^m1_", {"country": "United States", "era": "Modern", "type": "Main Battle Tank", "weight_t": 62.0, "crew": 4, "main_gun": "120 mm smoothbore", "power_hp": 1500, "max_speed_kmh": 67, "range_km": 425}),
    (r"^m60|^m48|^m551", {"country": "United States", "era": "Cold War", "type": "Main Battle Tank", "weight_t": 52.0, "crew": 4, "main_gun": "105 mm rifled", "power_hp": 750, "max_speed_kmh": 48, "range_km": 480}),
    (r"^t72|^t90|^t80|^t64|^t62|^t55|^armata|^oplot|^bmpt", {"country": "Russia", "era": "Modern", "type": "Main Battle Tank", "weight_t": 46.0, "crew": 3, "main_gun": "125 mm smoothbore", "power_hp": 1000, "max_speed_kmh": 60, "range_km": 500}),
    (r"^challenger|^chieftain", {"country": "United Kingdom", "era": "Modern", "type": "Main Battle Tank", "weight_t": 62.0, "crew": 4, "main_gun": "120 mm rifled", "power_hp": 1200, "max_speed_kmh": 59, "range_km": 550}),
    (r"^leclerc|^amx_", {"country": "France", "era": "Modern", "type": "Main Battle Tank", "weight_t": 40.0, "crew": 4, "main_gun": "105–120 mm", "power_hp": 720, "max_speed_kmh": 65, "range_km": 600}),
    (r"^type_9|^type_96|^type_98|^ztq|^vt", {"country": "China", "era": "Modern", "type": "Main Battle Tank", "weight_t": 54.0, "crew": 3, "main_gun": "125 mm smoothbore", "power_hp": 1500, "max_speed_kmh": 75, "range_km": 500}),
    (r"^type_8|^type_74|^type_90|^type_62|^type_63", {"country": "Japan", "era": "Cold War", "type": "Main Battle Tank", "weight_t": 40.0, "crew": 4, "main_gun": "105 mm rifled", "power_hp": 750, "max_speed_kmh": 53, "range_km": 300}),
    (r"^k1|^k2", {"country": "South Korea", "era": "Modern", "type": "Main Battle Tank", "weight_t": 55.0, "crew": 3, "main_gun": "120 mm smoothbore", "power_hp": 1500, "max_speed_kmh": 70, "range_km": 450}),
    (r"^merkava|^magach|^sabra", {"country": "Israel", "era": "Modern", "type": "Main Battle Tank", "weight_t": 63.0, "crew": 4, "main_gun": "105–120 mm", "power_hp": 1200, "max_speed_kmh": 64, "range_km": 500}),
    (r"^arjun|^al_khalid|^vt4|^mbt_3000", {"country": "India", "era": "Modern", "type": "Main Battle Tank", "weight_t": 58.0, "crew": 4, "main_gun": "120 mm smoothbore", "power_hp": 1400, "max_speed_kmh": 70, "range_km": 450}),
    (r"^altay|^kaplan", {"country": "Turkey", "era": "Modern", "type": "Main Battle Tank", "weight_t": 65.0, "crew": 4, "main_gun": "120 mm smoothbore", "power_hp": 1500, "max_speed_kmh": 65, "range_km": 450}),
    (r"^ariete|^of_40|^c1", {"country": "Italy", "era": "Modern", "type": "Main Battle Tank", "weight_t": 54.0, "crew": 4, "main_gun": "120 mm smoothbore", "power_hp": 1250, "max_speed_kmh": 65, "range_km": 550}),
    (r"^pt91|^pt76|^pl_", {"country": "Poland", "era": "Modern", "type": "Main Battle Tank", "weight_t": 45.0, "crew": 3, "main_gun": "125 mm smoothbore", "power_hp": 850, "max_speed_kmh": 60, "range_km": 500}),
    (r"^cv90|^ikv|^fv101|^sk105|^pt76|^m8_buford|^sprut|^tam$|^zulfiqar|^karrar|^tosan", {"country": "Various", "era": "Modern", "type": "Light Tank / IFV", "weight_t": 18.0, "crew": 3, "main_gun": "105 mm or autocannon", "power_hp": 550, "max_speed_kmh": 70, "range_km": 500}),
]

GENERIC_DEFAULT = {
    "country": "Various",
    "era": "Modern",
    "type": "Main Battle Tank",
    "weight_t": 45.0,
    "length_m": 9.5,
    "width_m": 3.6,
    "height_m": 2.4,
    "crew": 4,
    "main_gun": "105–125 mm",
    "secondary": "Coaxial machine gun",
    "engine": "Multi-fuel diesel",
    "power_hp": 900,
    "power_to_weight_hp_t": 20.0,
    "max_speed_kmh": 60,
    "range_km": 450,
    "armor": "Steel / composite",
}


def slug_to_name(slug: str) -> str:
    name = slug.replace("_", " ")
    return re.sub(r"\b\w", lambda m: m.group(0).upper(), name)


def infer_specs(slug: str) -> dict:
    if slug in SPEC_OVERRIDES:
        base = {**GENERIC_DEFAULT, **SPEC_OVERRIDES[slug]}
    else:
        base = {**GENERIC_DEFAULT}
        for pattern, defaults in FAMILY_DEFAULTS:
            if re.search(pattern, slug):
                base.update(defaults)
                break
    if "power_to_weight_hp_t" not in base or base.get("power_to_weight_hp_t") == GENERIC_DEFAULT["power_to_weight_hp_t"]:
        wt = base.get("weight_t", 45)
        hp = base.get("power_hp", 900)
        base["power_to_weight_hp_t"] = round(hp / wt, 1) if wt else 20.0
    return base


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare tank images and tanks.json")
    parser.add_argument(
        "--max-images",
        type=int,
        default=None,
        metavar="N",
        help="Copy at most N images per tank (default: all). Use 2 for deploy (~60MB).",
    )
    parser.add_argument(
        "--thumbnails-only",
        action="store_true",
        help="Deprecated alias for --max-images 1.",
    )
    args = parser.parse_args()
    max_images = 1 if args.thumbnails_only else args.max_images

    print("Downloading dataset via kagglehub...")
    dataset_path = Path(kagglehub.dataset_download("antoreepjana/military-tanks-dataset-images"))
    images_root = dataset_path / "images"
    if not images_root.is_dir():
        raise SystemExit(f"Expected images/ under {dataset_path}")

    if PUBLIC_TANKS.exists():
        shutil.rmtree(PUBLIC_TANKS)
    PUBLIC_TANKS.mkdir(parents=True)

    tanks: list[dict] = []
    for slug_dir in sorted(images_root.iterdir()):
        if not slug_dir.is_dir():
            continue
        slug = slug_dir.name
        dest_dir = PUBLIC_TANKS / slug
        dest_dir.mkdir(parents=True)

        image_files: list[str] = []
        sources = sorted(
            p
            for p in slug_dir.iterdir()
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif"}
        )
        if max_images is not None and sources:
            sources = sources[:max_images]

        for src in sources:
            dest_name = src.name
            shutil.copy2(src, dest_dir / dest_name)
            image_files.append(f"/tanks/{slug}/{dest_name}")

        if not image_files:
            continue

        specs = infer_specs(slug)
        tanks.append(
            {
                "id": slug,
                "slug": slug,
                "name": slug_to_name(slug),
                "images": image_files,
                "thumbnail": image_files[0],
                "specs": specs,
            }
        )

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump({"tanks": tanks, "generatedFrom": "antoreepjana/military-tanks-dataset-images"}, f, indent=2)

    if max_images == 1:
        mode = "1 image per tank"
    elif max_images == 2:
        mode = "2 images per tank"
    elif max_images is not None:
        mode = f"up to {max_images} images per tank"
    else:
        mode = "all images"
    print(f"Prepared {len(tanks)} tanks ({mode}) -> {DATA_FILE}")
    print(f"Images copied to {PUBLIC_TANKS}")


if __name__ == "__main__":
    main()
