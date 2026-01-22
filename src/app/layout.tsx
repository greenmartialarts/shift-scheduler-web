import type { Metadata } from "next";
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
  title: "Web Scheduler",
  description: "Volunteer Scheduler Web Application",
  appleWebApp: {
    title: "Web Scheduler",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  var isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
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
