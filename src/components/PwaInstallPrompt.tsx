"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearInstallPromptDismissal,
  dismissInstallPrompt,
  isInAppBrowser,
  isInstallPromptDismissed,
  isIosDevice,
  isIosSafari,
  isStandaloneMode,
} from "@/lib/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"ios" | "android" | "ios-other-browser">("ios");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandaloneMode()) return;
    if (isInstallPromptDismissed()) return;

    if (isIosDevice()) {
      if (isInAppBrowser()) {
        setMode("ios-other-browser");
        setVisible(true);
        return;
      }
      if (isIosSafari()) {
        setMode("ios");
        const timer = window.setTimeout(() => setVisible(true), 2000);
        return () => window.clearTimeout(timer);
      }
      setMode("ios-other-browser");
      setVisible(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode("android");
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const showAgain = () => {
      if (isStandaloneMode()) return;
      if (isIosDevice()) {
        setMode(isIosSafari() && !isInAppBrowser() ? "ios" : "ios-other-browser");
        setVisible(true);
      }
    };
    window.addEventListener("ti-show-pwa-prompt", showAgain);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("ti-show-pwa-prompt", showAgain);
    };
  }, []);

  const close = useCallback(() => {
    dismissInstallPrompt();
    setVisible(false);
  }, []);

  const installAndroid = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    close();
  }, [deferredPrompt, close]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start gap-3 p-4">
          <img
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl bg-card-muted object-contain p-1 dark:invert"
          />
          <div className="min-w-0 flex-1">
            <p
              id="pwa-install-title"
              className="font-semibold text-heading"
            >
              Install Tank Identifier
            </p>
            <p id="pwa-install-desc" className="mt-1 text-sm text-muted">
              {mode === "ios" && (
                <>
                  Add this app to your Home Screen for a full-screen experience
                  — no App Store required.
                </>
              )}
              {mode === "ios-other-browser" && (
                <>
                  Open this page in <strong className="text-foreground">Safari</strong>,
                  then use Share → Add to Home Screen.
                </>
              )}
              {mode === "android" && (
                <>Install the app on your device for quick access.</>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded-lg p-1 text-muted hover:bg-card-muted hover:text-foreground"
            aria-label="Dismiss install instructions"
          >
            <CloseIcon />
          </button>
        </div>

        {mode === "ios" && <IosInstallSteps />}

        {mode === "ios-other-browser" && (
          <div className="border-t border-border px-4 py-3">
            <CopyUrlButton />
          </div>
        )}

        <div className="flex gap-2 border-t border-border bg-card-muted/50 px-4 py-3">
          {mode === "android" && deferredPrompt && (
            <button
              type="button"
              onClick={installAndroid}
              className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white dark:text-stone-950"
            >
              Install app
            </button>
          )}
          {mode === "ios-other-browser" && (
            <a
              href={typeof window !== "undefined" ? window.location.href : "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white dark:text-stone-950"
            >
              Open in Safari
            </a>
          )}
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

function IosInstallSteps() {
  return (
    <ol className="space-y-3 border-t border-border px-4 py-4 text-sm">
      <li className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-bold text-accent">
          1
        </span>
        <span className="text-foreground">
          Tap the <ShareIcon /> <strong>Share</strong> button below (or at the top
          on iPad)
        </span>
      </li>
      <li className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-bold text-accent">
          2
        </span>
        <span className="text-foreground">
          Scroll and tap <strong>Add to Home Screen</strong>
        </span>
      </li>
      <li className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-bold text-accent">
          3
        </span>
        <span className="text-foreground">
          Tap <strong>Add</strong> — the tank icon will appear on your Home Screen
        </span>
      </li>
    </ol>
  );
}

function CopyUrlButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-card-muted"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? "Link copied — paste in Safari" : "Copy link for Safari"}
    </button>
  );
}

/** Re-open install instructions from footer */
export function PwaInstallFooterLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isIosDevice() && !isStandaloneMode());
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      className="text-accent hover:text-accent-hover"
      onClick={() => {
        clearInstallPromptDismissal();
        window.dispatchEvent(new CustomEvent("ti-show-pwa-prompt"));
      }}
    >
      Install on iPhone
    </button>
  );
}

function ShareIcon() {
  return (
    <svg
      className="mx-0.5 inline h-5 w-5 align-text-bottom text-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 3v12M7 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 21h14" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
