"use client";

import { useState } from "react";
import { ArticleFeedback } from "@/components/help/ArticleFeedback";
import { submitContactForm } from "../../actions/contact";

export default function ContactPage() {
    const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatus("pending");
        setErrorMessage("");

        const formData = new FormData(event.currentTarget);
        const result = await submitContactForm(formData);

        if (result.success) {
            setStatus("success");
            (event.target as HTMLFormElement).reset();
        } else {
            setStatus("error");
            setErrorMessage(result.error || "Something went wrong. Please try again.");
        }
    }

    if (status === "success") {
        return (
            <div className="py-24 sm:py-32 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-xl mx-auto px-6">
                    <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black mb-4">Message Sent!</h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10">
                        Thank you for reaching out. Our team has received your inquiry and will get back to you shortly.
                    </p>
                    <button
                        onClick={() => setStatus("idle")}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Send another message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Get in touch</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
                        We&apos;re here to <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">help</span>
                    </p>
                    <p className="mt-6 text-xl leading-8 text-zinc-600 dark:text-zinc-400">
                        Have questions about features, pricing, or just want to say hi? Our team is ready to listen.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {/* Contact Form */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 rounded-[32px] shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {status === "error" && (
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-900/30">
                                    {errorMessage}
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label htmlFor="first-name" className="block text-sm font-bold mb-3 font-mono uppercase tracking-wider text-zinc-400">First Name</label>
                                    <input
                                        type="text"
                                        id="first-name"
                                        name="first-name"
                                        required
                                        disabled={status === "pending"}
                                        className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg disabled:opacity-50"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="last-name" className="block text-sm font-bold mb-3 font-mono uppercase tracking-wider text-zinc-400">Last Name</label>
                                    <input
                                        type="text"
                                        id="last-name"
                                        name="last-name"
                                        required
                                        disabled={status === "pending"}
                                        className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg disabled:opacity-50"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold mb-3 font-mono uppercase tracking-wider text-zinc-400">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    disabled={status === "pending"}
                                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg disabled:opacity-50"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-bold mb-3 font-mono uppercase tracking-wider text-zinc-400">Subject</label>
                                <div className="relative">
                                    <select
                                        id="subject"
                                        name="subject"
                                        disabled={status === "pending"}
                                        className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none text-lg disabled:opacity-50"
                                    >
                                        <option>General Inquiry</option>
                                        <option>Support Request</option>
                                        <option>Enterprise / Sales</option>
                                        <option>Partnership</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-bold mb-3 font-mono uppercase tracking-wider text-zinc-400">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={6}
                                    disabled={status === "pending"}
                                    className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg resize-none disabled:opacity-50"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === "pending"}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] text-lg disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {status === "pending" ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>

                <ArticleFeedback />
            </div>
        </div>
    );
}
