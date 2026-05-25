#!/usr/bin/env python3
"""Prepare military aircraft from YOLO-format Kaggle dataset."""

from __future__ import annotations

import argparse
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path

import kagglehub
import yaml

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_AIRCRAFT = ROOT / "public" / "aircraft"
DATA_FILE = ROOT / "src" / "data" / "aircraft.json"
TANKS_FILE = ROOT / "src" / "data" / "tanks.json"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

GENERIC_AIRCRAFT = {
    "country": "Various",
    "era": "Modern",
    "type": "Military aircraft",
    "weight_t": 12.0,
    "length_m": 15.0,
    "width_m": 10.0,
    "height_m": 5.0,
    "crew": 2,
    "main_gun": "Cannon / air-to-air missiles",
    "secondary": "Bombs, guided munitions",
    "engine": "Turbofan / turbojet",
    "power_hp": 18000,
    "power_to_weight_hp_t": 1.5,
    "max_speed_kmh": 900,
    "range_km": 1200,
    "armor": "Minimal — survivability systems",
}

AIRCRAFT_OVERRIDES: dict[str, dict] = {
    "f16": {
        "country": "United States",
        "type": "Multirole fighter",
        "weight_t": 8.6,
        "length_m": 15.1,
        "width_m": 9.8,
        "max_speed_kmh": 2120,
        "range_km": 4220,
        "main_gun": "20 mm M61 Vulcan, AIM-120, AIM-9",
    },
    "f15": {
        "country": "United States",
        "type": "Air superiority fighter",
        "weight_t": 14.7,
        "length_m": 19.4,
        "width_m": 13.1,
        "max_speed_kmh": 2655,
        "range_km": 5600,
    },
    "f18": {
        "country": "United States",
        "type": "Carrier-based multirole fighter",
        "weight_t": 14.5,
        "length_m": 18.3,
        "width_m": 13.6,
        "max_speed_kmh": 1915,
        "range_km": 2340,
    },
    "f35": {
        "country": "United States",
        "type": "Stealth multirole fighter",
        "weight_t": 13.3,
        "length_m": 15.7,
        "width_m": 10.7,
        "max_speed_kmh": 1930,
        "range_km": 2220,
        "main_gun": "25 mm GAU-22/A (A), internal weapons bays",
    },
    "su27": {
        "country": "Russia",
        "type": "Air superiority fighter",
        "weight_t": 16.4,
        "length_m": 21.9,
        "width_m": 14.7,
        "max_speed_kmh": 2500,
        "range_km": 3530,
    },
    "su35": {
        "country": "Russia",
        "type": "Multirole fighter",
        "weight_t": 18.4,
        "length_m": 21.9,
        "width_m": 15.3,
        "max_speed_kmh": 2400,
        "range_km": 3600,
    },
    "mig29": {
        "country": "Russia",
        "type": "Multirole fighter",
        "weight_t": 11.0,
        "length_m": 17.4,
        "width_m": 11.4,
        "max_speed_kmh": 2445,
        "range_km": 2100,
    },
    "rafale": {
        "country": "France",
        "type": "Omnirole fighter",
        "weight_t": 10.3,
        "length_m": 15.3,
        "width_m": 10.9,
        "max_speed_kmh": 1912,
        "range_km": 3700,
    },
    "typhoon": {
        "country": "Multinational",
        "type": "Multirole fighter",
        "weight_t": 11.0,
        "length_m": 15.96,
        "width_m": 10.95,
        "max_speed_kmh": 2495,
        "range_km": 2900,
    },
    "gripen": {
        "country": "Sweden",
        "type": "Light multirole fighter",
        "weight_t": 8.0,
        "length_m": 14.1,
        "width_m": 8.4,
        "max_speed_kmh": 2470,
        "range_km": 3200,
    },
}

AIRCRAFT_FAMILY: list[tuple[str, dict]] = [
    (r"^f16|^f_16", {"country": "United States", "type": "Fighter"}),
    (r"^f15|^f_15", {"country": "United States", "type": "Fighter"}),
    (r"^f18|^f_18|^fa18", {"country": "United States", "type": "Fighter"}),
    (r"^f35|^f_35", {"country": "United States", "type": "Stealth fighter"}),
    (r"^su\d|^su_", {"country": "Russia", "type": "Fighter"}),
    (r"^mig|^mig_", {"country": "Russia", "type": "Fighter"}),
    (r"^rafale", {"country": "France", "type": "Fighter"}),
    (r"^typhoon|eurofighter", {"country": "Multinational", "type": "Fighter"}),
    (r"^gripen", {"country": "Sweden", "type": "Fighter"}),
    (r"^mirage", {"country": "France", "type": "Fighter"}),
    (r"^tornado", {"country": "Multinational", "type": "Strike aircraft"}),
    (r"^b52|^b_52", {"country": "United States", "type": "Strategic bomber"}),
    (r"^b2|^b_2", {"country": "United States", "type": "Stealth bomber"}),
    (r"^tu\d|^tu_", {"country": "Russia", "type": "Bomber"}),
    (r"^a10|^a_10", {"country": "United States", "type": "Attack aircraft"}),
    (r"^c130|^c_130", {"country": "United States", "type": "Transport"}),
    (r"^ah64|apache", {"country": "United States", "type": "Attack helicopter"}),
    (r"^uh60|blackhawk", {"country": "United States", "type": "Utility helicopter"}),
    (r"^helicopter|heli", {"country": "Various", "type": "Helicopter", "max_speed_kmh": 300}),
]


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    return slug or "unknown"


def slug_to_name(slug: str) -> str:
    name = slug.replace("_", " ")
    return re.sub(r"\b\w", lambda m: m.group(0).upper(), name)


def infer_aircraft_specs(slug: str) -> dict:
    key = slug.replace("-", "_")
    if key in AIRCRAFT_OVERRIDES:
        base = {**GENERIC_AIRCRAFT, **AIRCRAFT_OVERRIDES[key]}
    else:
        base = {**GENERIC_AIRCRAFT}
        for pattern, defaults in AIRCRAFT_FAMILY:
            if re.search(pattern, key):
                base.update(defaults)
                break
    wt = base.get("weight_t", 12)
    hp = base.get("power_hp", 18000)
    base["power_to_weight_hp_t"] = round(hp / wt, 2) if wt else 1.5
    return base


def load_class_names(dataset_path: Path) -> dict[int, str]:
    yaml_path = next(dataset_path.rglob("data.yaml"), None)
    if not yaml_path:
        return {}
    text = yaml_path.read_text(encoding="utf-8")
    # Kaggle copy may append prose after the YAML block (breaks PyYAML).
    for marker in ("\n\nUpdated Dataset", "\n\nCleaner version"):
        idx = text.find(marker)
        if idx > 0:
            text = text[:idx]
            break
    try:
        data = yaml.safe_load(text) or {}
    except yaml.YAMLError:
        data = {}
    names = data.get("names", {})
    if isinstance(names, list):
        return {i: str(n) for i, n in enumerate(names)}
    if isinstance(names, dict):
        return {int(k): str(v) for k, v in names.items()}
    return {}


def find_image_label_pairs(dataset_path: Path) -> list[tuple[Path, Path | None]]:
    pairs: list[tuple[Path, Path | None]] = []
    for images_dir in dataset_path.rglob("images"):
        if not images_dir.is_dir():
            continue
        labels_dir = images_dir.parent / "labels"
        for img in images_dir.rglob("*"):
            if img.suffix.lower() not in IMAGE_EXTS:
                continue
            label = None
            if labels_dir.is_dir():
                rel = img.relative_to(images_dir)
                stem = rel.stem
                for candidate in (
                    labels_dir / rel.with_suffix(".txt"),
                    labels_dir / f"label_{stem}.txt",
                    labels_dir / f"{stem}.txt",
                ):
                    if candidate.is_file():
                        label = candidate
                        break
            pairs.append((img, label))
    return pairs


def primary_class_from_label(label_path: Path | None, class_names: dict[int, str]) -> str:
    if not label_path or not label_path.is_file():
        return "unknown_aircraft"
    ids: list[int] = []
    for line in label_path.read_text(encoding="utf-8").strip().splitlines():
        parts = line.split()
        if parts:
            try:
                ids.append(int(float(parts[0])))
            except ValueError:
                continue
    if not ids:
        return "unknown_aircraft"
    class_id = Counter(ids).most_common(1)[0][0]
    return class_names.get(class_id, f"class_{class_id}")


def visibility_for_slug(label_path: Path | None, class_names: dict[int, str], slug: str) -> float:
    """YOLO bbox area (w×h, normalized) for the target class — larger ≈ more visible."""
    if not label_path or not label_path.is_file():
        return 0.0
    best = 0.0
    for line in label_path.read_text(encoding="utf-8").strip().splitlines():
        parts = line.split()
        if len(parts) < 5:
            continue
        try:
            class_id = int(float(parts[0]))
            width = float(parts[3])
            height = float(parts[4])
        except ValueError:
            continue
        if slugify(class_names.get(class_id, f"class_{class_id}")) != slug:
            continue
        best = max(best, width * height)
    return best


def pick_best_images(
    candidates: list[tuple[Path, float]], limit: int
) -> list[Path]:
    """Keep images with the largest aircraft bounding boxes in the label."""
    ranked = sorted(candidates, key=lambda item: item[1], reverse=True)
    return [path for path, _ in ranked[:limit]]


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare aircraft images from YOLO Kaggle dataset")
    parser.add_argument(
        "--max-per-class",
        type=int,
        default=1,
        help="Images per class; picks highest-visibility bbox from YOLO labels (default 1)",
    )
    parser.add_argument(
        "--thumbnails-only",
        action="store_true",
        help="Alias for --max-per-class 1",
    )
    parser.add_argument(
        "--dataset-path",
        type=str,
        default="",
        help="Use existing extracted dataset path instead of downloading",
    )
    args = parser.parse_args()

    if args.dataset_path:
        dataset_path = Path(args.dataset_path)
    else:
        print("Downloading aircraft dataset via kagglehub (this is large, ~6GB)...")
        dataset_path = Path(
            kagglehub.dataset_download("rawsi18/air-military-vehicle-dataset-yolo8-data-format")
        )

    class_names = load_class_names(dataset_path)
    print(f"Found {len(class_names)} classes in data.yaml")

    per_class = 1 if args.thumbnails_only else args.max_per_class

    by_class: dict[str, list[tuple[Path, float]]] = defaultdict(list)
    for img_path, label_path in find_image_label_pairs(dataset_path):
        class_name = primary_class_from_label(label_path, class_names)
        slug = slugify(class_name)
        if slug == "unknown_aircraft":
            continue
        score = visibility_for_slug(label_path, class_names, slug)
        by_class[slug].append((img_path, score))

    if PUBLIC_AIRCRAFT.exists():
        shutil.rmtree(PUBLIC_AIRCRAFT)
    PUBLIC_AIRCRAFT.mkdir(parents=True)

    aircraft: list[dict] = []
    for slug in sorted(by_class.keys()):
        sources = pick_best_images(by_class[slug], per_class)

        dest_dir = PUBLIC_AIRCRAFT / slug
        dest_dir.mkdir(parents=True)
        image_files: list[str] = []

        for i, src in enumerate(sources):
            ext = src.suffix.lower() or ".jpg"
            dest_name = f"{slug}{ext}" if per_class == 1 else f"{slug}_{i + 1}{ext}"
            shutil.copy2(src, dest_dir / dest_name)
            image_files.append(f"/aircraft/{slug}/{dest_name}")

        if not image_files:
            continue

        aircraft.append(
            {
                "id": slug,
                "slug": slug,
                "name": slug_to_name(slug),
                "images": image_files,
                "thumbnail": image_files[0],
                "specs": infer_aircraft_specs(slug),
            }
        )

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(
            {
                "aircraft": aircraft,
                "generatedFrom": "rawsi18/air-military-vehicle-dataset-yolo8-data-format",
                "classCount": len(class_names),
            },
            f,
            indent=2,
        )

    limit = (
        "1 per class (most visible bbox)"
        if per_class == 1
        else f"up to {per_class} per class (by visibility)"
    )
    print(f"Prepared {len(aircraft)} aircraft types ({limit}) -> {DATA_FILE}")
    print(f"Images in {PUBLIC_AIRCRAFT}")


if __name__ == "__main__":
    main()
