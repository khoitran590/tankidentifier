"use client";

import { useEffect, useState } from "react";

const SHOW_TOP_OFFSET = 480;

export function CatalogScrollEnhancements() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        setProgress(max > 0 ? (doc.scrollTop / max) * 100 : 0);
        setShowTop(doc.scrollTop > SHOW_TOP_OFFSET);
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div
        className="scroll-progress pointer-events-none fixed left-0 right-0 z-[60] h-0.5 origin-left bg-accent"
        style={{
          top: "calc(3.25rem + env(safe-area-inset-top, 0px))",
          transform: `scaleX(${progress / 100})`,
        }}
        aria-hidden
      />
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-lg backdrop-blur-md transition duration-300 hover:border-accent/50 hover:bg-card hover:text-accent sm:right-6 ${
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ChevronUpIcon />
      </button>
    </>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
