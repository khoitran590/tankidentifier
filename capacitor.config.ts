import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tankidentifier.app",
  appName: "Tank Identifier",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#0c0a09",
    },
    StatusBar: {
      style: "DARK",
    },
  },
};

export default config;
