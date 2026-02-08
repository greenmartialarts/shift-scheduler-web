import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-blue-100 dark:selection:bg-blue-900/40">
            <Navbar />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <footer className="border-t border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
                <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between">
                    <div className="flex justify-center space-x-6 md:order-2">
                        <Link
                            href="/privacy"
                            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                        >
                            Terms of Service
                        </Link>
                    </div>
                    <div className="mt-8 md:order-1 md:mt-0">
                        <p className="text-center text-xs text-zinc-500 font-mono">
                            &copy; {new Date().getFullYear()} Volunteer Scheduler
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
