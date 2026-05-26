import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { AuthProvider } from "@/contexts/AuthContext";
import { FirebaseAnalytics } from "@/components/FirebaseAnalytics";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tank Identifier — Military Vehicle Catalog",
  description:
    "Browse 150+ military tanks with specifications and side-by-side comparison.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    title: "Tank Identifier",
    statusBarStyle: "black-translucent",
  },
  applicationName: "Tank Identifier",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#12100e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="native-app flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            <FirebaseAnalytics />
            <PwaInstallPrompt />
            <Header />
          <main className="flex-1 pb-[env(safe-area-inset-bottom)]">
            {children}
          </main>
          <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
