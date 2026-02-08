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
                    <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-8">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Message Sent</h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
                        We have received your inquiry and will respond to the provided email address.
                    </p>
                    <button
                        onClick={() => setStatus("idle")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition-colors"
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
                    <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-500">Support & Inquiries</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
                        Get in touch
                    </p>
                    <p className="mt-6 text-xl leading-8 text-zinc-600 dark:text-zinc-400">
                        Have questions about system features or deployment? Our team is available for operational support.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {/* Contact Form */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 rounded-2xl shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === "error" && (
                                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-900/30">
                                    {errorMessage}
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="first-name" className="block text-xs font-bold mb-2 text-zinc-500 uppercase tracking-wider">First Name</label>
                                    <input
                                        type="text"
                                        id="first-name"
                                        name="first-name"
                                        required
                                        disabled={status === "pending"}
                                        className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-50 text-zinc-900 dark:text-zinc-100"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="last-name" className="block text-xs font-bold mb-2 text-zinc-500 uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        id="last-name"
                                        name="last-name"
                                        required
                                        disabled={status === "pending"}
                                        className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-50 text-zinc-900 dark:text-zinc-100"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold mb-2 text-zinc-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    disabled={status === "pending"}
                                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-50 text-zinc-900 dark:text-zinc-100"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-xs font-bold mb-2 text-zinc-500 uppercase tracking-wider">Inquiry Type</label>
                                <div className="relative">
                                    <select
                                        id="subject"
                                        name="subject"
                                        disabled={status === "pending"}
                                        className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none disabled:opacity-50 text-zinc-900 dark:text-zinc-100"
                                    >
                                        <option>General Inquiry</option>
                                        <option>Technical Support</option>
                                        <option>Deployment / Sales</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-xs font-bold mb-2 text-zinc-500 uppercase tracking-wider">Message Details</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={5}
                                    disabled={status === "pending"}
                                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none disabled:opacity-50 text-zinc-900 dark:text-zinc-100"
                                    placeholder="Provide details about your request..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === "pending"}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {status === "pending" ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : "Submit Request"}
                            </button>
                        </form>
                    </div>
                </div>

                <ArticleFeedback />
            </div>
        </div>
    );
}
