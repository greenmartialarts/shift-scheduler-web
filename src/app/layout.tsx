import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CookieConsent } from "@/components/CookieConsent";
import { NotificationProvider } from "@/components/ui/NotificationProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { TutorialProvider } from "@/components/tutorial/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { SWRegister } from "@/components/SWRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Volunteer Scheduler | Professional Event Management",
  description: "High-performance volunteer scheduling and coordination platform for events of any size. Automate check-ins, shift assignments, and volunteer communication.",
  keywords: ["volunteer scheduler", "event management", "shift coordination", "automated scheduling"],
  authors: [{ name: "Volunteer Scheduler Team" }],
  openGraph: {
    title: "Volunteer Scheduler | Professional Event Management",
    description: "The modern way to coordinate your volunteer team.",
    type: "website",
    siteName: "Volunteer Scheduler",
  },
  appleWebApp: {
    title: "Volunteer Scheduler",
    capable: true,
    statusBarStyle: "default",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4090063067766583"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SWRegister />
          <NotificationProvider>
            <ErrorBoundary>
              <TutorialProvider>
                <AnalyticsTracker />
                <TutorialOverlay />
                <div className="fixed bottom-4 right-4 z-50">
                  <ThemeToggle />
                </div>
                {children}
                <CookieConsent />
              </TutorialProvider>
            </ErrorBoundary>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
