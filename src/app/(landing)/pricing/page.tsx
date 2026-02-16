'use client';

import Link from "next/link";
import { Check, ArrowRight, Sparkles, Globe, ShieldCheck, Heart, Download, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqItems = [
    {
        q: "Is the platform free?",
        a: "Yes. Our mission is to support organizers. We provide the full suite of scheduling and check-in tools for free to ensure every event can succeed.",
        icon: Heart
    },
    {
        q: "Data Export & Portability",
        a: "Your data is yours. We provide CSV and PDF export options for all volunteer, shift, and attendance records at any time.",
        icon: Download
    },
];

function AccordionItem({ item }: { item: typeof faqItems[0] }) {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = item.icon;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden transition-all duration-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{item.q}</h4>
                </div>
                <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48' : 'max-h-0'}`}>
                <div className="p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.a}</p>
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-500">Usage Plans</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
                        Free for all community events
                    </p>
                    <p className="mt-6 text-xl leading-8 text-zinc-600 dark:text-zinc-400">
                        The full suite of staffing and attendance tools is available to all organizers.
                    </p>
                </div>

                <div className="mx-auto grid max-w-lg grid-cols-1 gap-12 lg:max-w-none lg:grid-cols-2 lg:items-stretch">
                    {/* Standard Plan Tier */}
                    <div className="relative rounded-2xl border border-blue-600/50 dark:border-blue-500/30 bg-[#0A0A15] p-8 shadow-2xl transition-transform hover:scale-[1.01]">
                        <div className="absolute -top-3 left-6 rounded-md bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                            Recommended
                        </div>
                        <div className="flex items-center gap-4 mb-6 pt-4">
                            <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/20">
                                <Sparkles className="h-7 w-7 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Standard Plan</h3>
                                <p className="text-sm text-zinc-400">For events of any size</p>
                            </div>
                        </div>

                        <div className="mb-8 font-mono">
                            <span className="text-5xl font-bold tracking-tight text-white">$0</span>
                            <span className="ml-2 text-sm text-zinc-500">/ forever</span>
                        </div>

                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-10">
                            {[
                                "Unlimited Volunteers",
                                "Unlimited Events & Shifts",
                                "Overlap Prevention",
                                "Shift Optimizer",
                                "Volunteer Check-In",
                                "Shift Reporting",
                                "PDF Generation",
                                "Mobile Support"
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <span className="text-sm text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/signup"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                        >
                            Get started now <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Enterprise Tier */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 shadow-sm flex flex-col justify-between opacity-90 grayscale-[0.2] hover:grayscale-0 transition-all">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl">
                                    <Globe className="h-7 w-7 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Enterprise</h3>
                                    <p className="text-sm text-zinc-500">Custom requirements</p>
                                </div>
                            </div>

                            <div className="mb-8 font-mono">
                                <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Contact Sales</span>
                            </div>

                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                For large organizations needing custom integrations, dedicated support, or on-premise solutions.
                            </p>

                            <ul className="space-y-4 mb-10">
                                {[
                                    "Custom Integrations",
                                    "SLA Commitments",
                                    "Dedicated Support",
                                    "Advanced Security",
                                    "SSO & SAML"
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <Check className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                        <span className="text-sm text-zinc-600 dark:text-zinc-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link
                            href="/contact"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl font-bold transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-700"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>

                <div className="mt-40 max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold mb-4">Implementation Details</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">Everything you need to know about getting started.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqItems.map((item) => (
                            <AccordionItem key={item.q} item={item} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
