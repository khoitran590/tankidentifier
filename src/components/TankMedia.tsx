"use client";

import Image from "next/image";
import { useState } from "react";
import { getDisplayImages } from "@/lib/tank-media";
import type { Tank } from "@/types/tank";

type ImageSizes = {
  card: string;
  gallery: string;
  thumb: string;
};

const SIZES: ImageSizes = {
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  gallery: "(max-width: 1024px) 100vw, 50vw",
  thumb: "96px",
};

type TankCardMediaProps = {
  tank: Tank;
  priority?: boolean;
};

/** Catalog card: crossfade between two photos on hover (touch: tap toggles). */
export function TankCardMedia({ tank, priority = false }: TankCardMediaProps) {
  const [primary, secondary] = getDisplayImages(tank);
  const hasAlt = primary !== secondary;
  const [showAlt, setShowAlt] = useState(false);

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden bg-card-muted"
      onMouseEnter={() => hasAlt && setShowAlt(true)}
      onMouseLeave={() => setShowAlt(false)}
    >
      <Image
        src={primary}
        alt={tank.name}
        fill
        className={`object-cover transition duration-500 ${
          hasAlt && showAlt ? "opacity-0 scale-105" : "opacity-100"
        }`}
        sizes={SIZES.card}
        priority={priority}
      />
      {hasAlt && (
        <Image
          src={secondary}
          alt=""
          fill
          aria-hidden
          className={`object-cover transition duration-500 ${
            showAlt ? "opacity-100 scale-105" : "opacity-0"
          }`}
          sizes={SIZES.card}
        />
      )}
      {hasAlt && (
        <div
          className="pointer-events-none absolute bottom-2 left-2 z-10 h-14 w-[4.5rem] overflow-hidden rounded-md border-2 border-background/90 shadow-md sm:hidden"
          aria-hidden
        >
          <Image
            src={secondary}
            alt=""
            fill
            className="object-cover"
            sizes={SIZES.thumb}
          />
        </div>
      )}
      {hasAlt && (
        <span
          className="pointer-events-none absolute bottom-2 right-2 rounded bg-background/85 px-1.5 py-0.5 text-[10px] font-medium text-muted backdrop-blur-sm"
          aria-hidden
        >
          2 photos
        </span>
      )}
    </div>
  );
}

type TankGalleryProps = {
  tank: Tank;
};

/** Detail page: two equal panels with optional thumbnail strip. */
export function TankGallery({ tank }: TankGalleryProps) {
  const images = getDisplayImages(tank);
  const [active, setActive] = useState(0);
  const hasAlt = images[0] !== images[1];

  return (
    <div className="space-y-3">
      <div
        className={`grid gap-3 ${hasAlt ? "grid-cols-2" : "grid-cols-1"}`}
        role={hasAlt ? "tablist" : undefined}
        aria-label={hasAlt ? "Tank photos" : undefined}
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            role={hasAlt ? "tab" : undefined}
            aria-selected={hasAlt ? active === i : undefined}
            aria-label={`Photo ${i + 1}`}
            onClick={() => hasAlt && setActive(i)}
            className={`relative overflow-hidden rounded-xl border bg-card-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              hasAlt
                ? active === i
                  ? "border-accent ring-1 ring-ring aspect-[4/3]"
                  : "border-border aspect-[4/3] opacity-90 hover:border-border-strong"
                : "border-border aspect-[16/10] sm:aspect-[16/10]"
            }`}
          >
            <Image
              src={src}
              alt={`${tank.name} — photo ${i + 1}`}
              fill
              className="object-cover"
              sizes={SIZES.gallery}
              priority={i === 0}
            />
          </button>
        ))}
      </div>
      {hasAlt && (
        <p className="text-center text-xs text-subtle sm:text-left">
          Tap a photo to highlight · {images.length} reference images
        </p>
      )}
    </div>
  );
}

type TankThumbStripProps = {
  tank: Tank;
  className?: string;
};

export function TankThumbStrip({ tank, className = "" }: TankThumbStripProps) {
  const [primary, secondary] = getDisplayImages(tank);
  if (primary === secondary) return null;

  return (
    <div className={`flex gap-2 ${className}`}>
      {[primary, secondary].map((src, i) => (
        <div
          key={src}
          className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border"
        >
          <Image src={src} alt="" fill className="object-cover" sizes={SIZES.thumb} />
          <span className="sr-only">Photo {i + 1}</span>
        </div>
      ))}
    </div>
  );
}
