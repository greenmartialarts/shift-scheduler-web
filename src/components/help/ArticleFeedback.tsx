"use client";

import { useState } from "react";
import { BookOpen, ThumbsUp, ThumbsDown, Check } from "lucide-react";

export function ArticleFeedback() {
    const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

    if (feedback) {
        return (
            <footer className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-800">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-8 flex flex-col items-center text-center transition-all animate-in fade-in zoom-in duration-300">
                    <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4">
                        <Check className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Thank you for your feedback!</h4>
                    <p className="text-emerald-700 dark:text-emerald-300">Your input helps us make our documentation better for the entire community.</p>
                </div>
            </footer>
        );
    }

    return (
        <footer className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-800">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-8 flex flex-col items-center text-center">
                <BookOpen className="h-10 w-10 text-blue-500 mb-4" />
                <h4 className="text-xl font-bold mb-2">Was this article helpful?</h4>
                <p className="text-zinc-500 mb-6 font-medium">Your feedback helps us improve our documentation for everyone.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => setFeedback("yes")}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 font-bold transition-all active:scale-95"
                    >
                        <ThumbsUp className="h-4 w-4" />
                        Yes
                    </button>
                    <button
                        onClick={() => setFeedback("no")}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 font-bold transition-all active:scale-95"
                    >
                        <ThumbsDown className="h-4 w-4" />
                        No
                    </button>
                </div>
            </div>
        </footer>
    );
}
