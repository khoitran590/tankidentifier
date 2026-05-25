"use client";

import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect } from "react";

export function CapacitorBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    async function initNativeShell() {
      try {
        await SplashScreen.hide();
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // Plugins optional during web dev
      }
    }

    void initNativeShell();

    let removeBackListener: (() => void) | undefined;

    void App.addListener("backButton", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        void App.exitApp();
      }
    }).then((handle) => {
      removeBackListener = () => handle.remove();
    });

    return () => removeBackListener?.();
  }, []);

  return null;
}
