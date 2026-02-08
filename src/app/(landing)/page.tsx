"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const features = [
  {
    name: "Shift Assignment",
    description: "Fills open shifts based on volunteer availability. Replaces manual data entry and cross-referencing.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    ),
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    name: "Data Import",
    description: "Upload volunteer names and contact info from existing CSV files. Matches column headers automatically.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    ),
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    name: "Custom Labels",
    description: "Assign names to shifts like 'Front Gate' or 'Security' for clear reporting and on-site check-in.",
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </>
    ),
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    name: "Volunteer Check-In",
    description: "Mark attendance from any device. Flag volunteers who haven't arrived 15 minutes before their shift starts.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    name: "Overlap Prevention",
    description: "Flags if a volunteer is assigned to two locations at once. Prevents scheduling gaps on event day.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    ),
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    name: "Shift Reporting",
    description: "Export attendance records and volunteer hours to CSV. Generate PDF summaries for event wrap-ups.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    ),
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    name: "Volunteer Reassignment",
    description: "Move volunteers between shifts instantly when someone fails to show up.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    ),
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    name: "Advanced Search",
    description: "Quickly find volunteers by name or shift location from the central dashboard.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    ),
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    name: "Mobile Support",
    description: "Interface designed for use on tablets and phones during the event.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    ),
    color: "text-blue-600 dark:text-blue-400"
  }
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-8 border border-zinc-200 dark:border-zinc-700">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Event Staffing & Volunteer Management
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8 leading-[1.1] text-zinc-900 dark:text-zinc-100">
                Manage event staff and volunteer shifts.
              </h1>

              <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 mb-10 max-w-xl">
                Replace manual spreadsheets with a central system for scheduling and attendance. Automatically detect overlapping shifts and track check-ins on-site.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold transition-colors hover:bg-blue-700 shadow-sm"
                >
                  Start now for free
                </Link>
                <Link
                  href="/features"
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-3 text-zinc-900 dark:text-zinc-100 font-semibold transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm"
                >
                  Explore features
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2 shadow-sm overflow-hidden">
                <Image
                  src="/assets/hero-mockup.png"
                  alt="Dashboard Preview"
                  width={800}
                  height={600}
                  className="rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section id="features" className="relative bg-white dark:bg-zinc-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl mb-16">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-500 mb-3">
              Core Functionality
            </h2>
            <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Built for operational reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 ${feature.color} mb-6`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 text-zinc-900 dark:text-zinc-100">
                  {feature.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-500 font-semibold hover:underline"
            >
              See all features <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-8 py-20 text-center shadow-sm">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Set up your first event
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
              Start by importing your volunteer list or creating a shift schedule.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-8 py-4 text-white font-bold transition-colors hover:bg-blue-700 shadow-sm"
              >
                Start now for free
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-8 py-4 text-zinc-900 dark:text-zinc-100 font-bold transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                See a sample event
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
