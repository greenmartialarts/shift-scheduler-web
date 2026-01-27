import Link from "next/link";
import { Check, ArrowRight, Zap, Building2 } from "lucide-react";

export default function PricingPage() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
                        Simple, transparent <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">value</span>
                    </p>
                    <p className="mt-6 text-xl leading-8 text-zinc-600 dark:text-zinc-400">
                        We believe the best tools should be accessible to all community organizers.
                    </p>
                </div>

                <div className="mx-auto grid max-w-lg grid-cols-1 gap-12 lg:max-w-none lg:grid-cols-2 lg:items-center">
                    {/* Free Forever Tier */}
                    <div className="relative rounded-[32px] border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-zinc-900 p-8 shadow-2xl scale-105 z-10">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-sm font-bold text-white shadow-xl">
                            MOST POPULAR
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl">
                                <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Free Forever</h3>
                                <p className="text-zinc-500">Perfect for any scale</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <span className="text-5xl font-bold tracking-tight">$0</span>
                            <span className="text-zinc-500"> / month</span>
                        </div>

                        <ul className="space-y-4 mb-10">
                            {[
                                "Unlimited Volunteers",
                                "Unlimited Events & Shifts",
                                "Conflict Detection",
                                "Auto-Assign Optimization",
                                "Real-time Check-ins",
                                "Full Analytics & Exports",
                                "CSV & PDF Generation",
                                "Dark Mode & Themes"
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                    <span className="text-zinc-600 dark:text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/signup"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Get started now <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Enterprise Tier */}
                    <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-zinc-200 dark:bg-zinc-800 rounded-2xl">
                                <Building2 className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Enterprise</h3>
                                <p className="text-zinc-500">Custom solutions</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <span className="text-4xl font-bold tracking-tight">Let&apos;s Talk</span>
                        </div>

                        <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-lg">
                            For large organizations needing custom integrations, dedicated support, or on-premise solutions.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[
                                "Custom Integrations",
                                "SLA Commitments",
                                "Dedicated Account Manager",
                                "Advanced Security Controls",
                                "Custom Feature Development",
                                "SSO & SAML Support"
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                                    <span className="text-zinc-600 dark:text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/contact"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[20px] font-bold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100"
                        >
                            Contact support
                        </Link>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-32 max-w-3xl mx-auto">
                    <h3 className="text-3xl font-bold text-center mb-12">Common Questions</h3>
                    <div className="space-y-6">
                        {[
                            {
                                q: "Is it really free forever?",
                                a: "Yes. Our core mission is to support organizers. We provide the full suite of scheduling and check-in tools for free to ensure every event can succeed."
                            },
                            {
                                q: "Can I export my data anytime?",
                                a: "Absolutely. Your data is yours. We provide CSV and PDF export options for all your volunteer, shift, and attendance records."
                            },
                        ].map((item) => (
                            <div key={item.q} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                                <h4 className="text-lg font-bold mb-2">{item.q}</h4>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
