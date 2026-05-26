"use client";

import Image from "next/image";
import { useState } from "react";
import { getDisplayImages, getGalleryImages } from "@/lib/tank-media";
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
      {tank.images.length > 1 && (
        <span
          className="pointer-events-none absolute bottom-2 right-2 rounded bg-background/85 px-1.5 py-0.5 text-[10px] font-medium text-muted backdrop-blur-sm"
          aria-hidden
        >
          {tank.images.length} photos
        </span>
      )}
    </div>
  );
}

type TankGalleryProps = {
  tank: Tank;
};

/** Detail page: one large image with optional thumbnail strip for multiple photos. */
export function TankGallery({ tank }: TankGalleryProps) {
  const images = getGalleryImages(tank);
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  const activeSrc = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card-muted sm:aspect-[4/3]">
        <Image
          src={activeSrc}
          alt={`${tank.name} — photo ${active + 1}`}
          fill
          className="object-cover"
          sizes={SIZES.gallery}
          priority
        />
      </div>

      {images.length > 1 && (
        <>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Tank photos"
          >
            {images.map((src, i) => (
              <button
                key={`${i}-${src}`}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-label={`Photo ${i + 1}`}
                onClick={() => setActive(i)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active === i
                    ? "border-accent ring-1 ring-ring"
                    : "border-border opacity-80 hover:border-border-strong hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill className="object-cover" sizes={SIZES.thumb} />
              </button>
            ))}
          </div>
          <p className="text-xs text-subtle">
            {images.length} reference image{images.length === 1 ? "" : "s"} · select a thumbnail
          </p>
        </>
      )}
    </div>
  );
}

type TankThumbStripProps = {
  tank: Tank;
  className?: string;
};

export function TankThumbStrip({ tank, className = "" }: TankThumbStripProps) {
  const images = getGalleryImages(tank);
  if (images.length <= 1) return null;

  return (
    <div className={`flex gap-2 overflow-x-auto ${className}`}>
      {images.slice(0, 6).map((src, i) => (
        <div
          key={`${i}-${src}`}
          className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border"
        >
          <Image src={src} alt="" fill className="object-cover" sizes={SIZES.thumb} />
          <span className="sr-only">Photo {i + 1}</span>
        </div>
      ))}
    </div>
  );
}
