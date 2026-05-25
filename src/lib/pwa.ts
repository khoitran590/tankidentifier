export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari legacy
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Best experience: install from Safari on iOS */
export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  if (!isIosDevice()) return false;
  const ua = navigator.userAgent;
  return !/crios|fxios|edgios|opr\//i.test(ua);
}

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /fbav|instagram|line\//i.test(ua);
}

const DISMISS_KEY = "ti-pwa-install-dismissed-at";
const DISMISS_DAYS = 14;

export function isInstallPromptDismissed(): boolean {
  if (typeof localStorage === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  const ms = DISMISS_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedAt < ms;
}

export function dismissInstallPrompt(): void {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

export function clearInstallPromptDismissal(): void {
  localStorage.removeItem(DISMISS_KEY);
}
