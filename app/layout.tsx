import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/ambient-background";
import { BottomNav } from "@/components/bottom-nav";
import { OnboardingGate } from "@/components/onboarding-gate";
import { NotificationsInit } from "@/components/notifications-init";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexa Motion — Intelligent Running, Elevated",
  description:
    "A premium AI-powered running companion. Personalized training, intelligent coaching, beautiful analytics.",
  applicationName: "Nexa Motion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Nexa Motion",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background text-text-primary antialiased font-sans">
        <AmbientBackground />
        <NotificationsInit />
        <OnboardingGate>
          <main className="relative z-10 mx-auto w-full max-w-[480px] min-h-screen">
            {children}
          </main>
          <BottomNav />
        </OnboardingGate>
      </body>
    </html>
  );
}
