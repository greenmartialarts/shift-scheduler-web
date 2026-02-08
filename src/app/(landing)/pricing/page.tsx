import Link from "next/link";
import { Check, ArrowRight, Zap, Building2 } from "lucide-react";

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

                <div className="mx-auto grid max-w-lg grid-cols-1 gap-12 lg:max-w-none lg:grid-cols-2 lg:items-center">
                    {/* Free Forever Tier */}
                    <div className="relative rounded-2xl border border-blue-600 dark:border-blue-500 bg-white dark:bg-zinc-900 p-8 shadow-sm">
                        <div className="absolute -top-3 left-6 rounded-md bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                            Recommended
                        </div>
                        <div className="flex items-center gap-4 mb-6 pt-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Standard Plan</h3>
                                <p className="text-sm text-zinc-500">For events of any size</p>
                            </div>
                        </div>

                        <div className="mb-8 font-mono">
                            <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">$0</span>
                        </div>

                        <ul className="space-y-3 mb-10">
                            {[
                                "Unlimited Volunteers",
                                "Unlimited Events & Shifts",
                                "Overlap Prevention",
                                "Shift Assignment Optimizer",
                                "Volunteer Check-In",
                                "Shift Reporting & Exports",
                                "PDF Generation",
                                "Mobile Support"
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-3">
                                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/signup"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Get started now <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Enterprise Tier */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
                                <Building2 className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Enterprise</h3>
                                <p className="text-sm text-zinc-500">Custom requirements</p>
                            </div>
                        </div>

                        <div className="mb-8 font-mono">
                            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Contact Sales</span>
                        </div>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                            For large organizations needing custom integrations, dedicated support, or on-premise solutions.
                        </p>

                        <ul className="space-y-3 mb-10">
                            {[
                                "Custom Integrations",
                                "SLA Commitments",
                                "Dedicated Support",
                                "Advanced Security Controls",
                                "SSO & SAML Support"
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-3">
                                    <Check className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/contact"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-semibold transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-100"
                        >
                            Contact support
                        </Link>
                    </div>
                </div>

                <div className="mt-32 max-w-3xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-12">Implementation Details</h3>
                    <div className="space-y-4">
                        {[
                            {
                                q: "Is the platform free?",
                                a: "Yes. Our mission is to support organizers. We provide the full suite of scheduling and check-in tools for free to ensure every event can succeed."
                            },
                            {
                                q: "Data Export & Portability",
                                a: "Your data is yours. We provide CSV and PDF export options for all volunteer, shift, and attendance records at any time."
                            },
                        ].map((item) => (
                            <div key={item.q} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                                <h4 className="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">{item.q}</h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
