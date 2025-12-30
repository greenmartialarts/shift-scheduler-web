"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    name: "Auto-Assign Scheduling",
    description: "One-click optimization fills shifts efficiently with conflict detection and partial assignment support.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    ),
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    name: "Bulk CSV Import",
    description: "Import hundreds of volunteers and shifts in seconds with CSV upload and validation.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    ),
    gradient: "from-purple-500 to-pink-500"
  },
  {
    name: "Named Shifts",
    description: "Custom shift names for easy identification across assignments, check-in, and reports.",
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </>
    ),
    gradient: "from-pink-500 to-rose-500"
  },
  {
    name: "Real-time Check-in",
    description: "Track attendance with automatic late detection, dismissible warnings, and smart sorting.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    name: "Conflict Detection",
    description: "Automatic detection of double-booked volunteers with visual warnings and priority sorting.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    ),
    gradient: "from-amber-500 to-orange-500"
  },
  {
    name: "Reports & Analytics",
    description: "Export CSV schedules, generate individual PDFs, and track volunteer hours and attendance.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    ),
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    name: "Easy Swapping",
    description: "Quickly swap volunteers between shifts with one-click reassignment functionality.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    ),
    gradient: "from-violet-500 to-purple-500"
  },
  {
    name: "Advanced Search",
    description: "Search by shift name, date, time, or volunteer name across all pages for quick access.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    ),
    gradient: "from-fuchsia-500 to-pink-500"
  },
  {
    name: "Dark Mode",
    description: "Full dark mode support with persistent toggle for comfortable viewing in any environment.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    ),
    gradient: "from-slate-500 to-zinc-500"
  }
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800/50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-lg">V</span>
            </div>
            Volunteer Scheduler
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Login
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -90, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-[120px]"
            />
          </div>

          <div className="mx-auto max-w-7xl relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="max-w-2xl"
              >
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 border border-indigo-200/50 dark:border-indigo-800/50 backdrop-blur-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Powered by Intelligent Optimization
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-5xl font-bold tracking-tight sm:text-7xl mb-8 leading-[1.1]"
                >
                  Streamline Your <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Volunteer Force
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 mb-10 max-w-xl"
                >
                  The complete solution for modern organizers. Automated scheduling, real-time check-ins, and deep analytics to make your event a success.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-wrap items-center gap-6"
                >
                  <Link
                    href="/login"
                    className="group relative rounded-xl bg-zinc-900 dark:bg-white px-8 py-4 text-white dark:text-zinc-900 font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl"
                  >
                    <span>Get started free</span>
                  </Link>
                  <a
                    href="#features"
                    className="group text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                  >
                    Explore features <span aria-hidden="true" className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative hidden lg:block"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10 transform translate-x-4 translate-y-4" />
                <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-2 backdrop-blur-2xl shadow-2xl overflow-hidden group">
                  <Image
                    src="/assets/hero-mockup.png"
                    alt="Dashboard Preview"
                    width={800}
                    height={600}
                    className="rounded-2xl shadow-inner transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative bg-zinc-50 dark:bg-zinc-900/50 py-24 sm:py-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="mx-auto max-w-2xl lg:text-center mb-16 sm:mb-20">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400"
              >
                The Full Stack
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold tracking-tight sm:text-5xl text-zinc-900 dark:text-zinc-50 mt-4"
              >
                Everything built for scale
              </motion.p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.name}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-3xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                >
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {feature.name}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-[40px] bg-zinc-900 dark:bg-indigo-600 px-8 py-20 text-center shadow-2xl sm:px-16"
            >
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
                <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_70%)] animate-pulse" />
              </div>

              <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Ready to transform your <br /> event coordination?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100/80">
                Join the wave of organizers using data to build better volunteer experiences.
              </p>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                <Link
                  href="/signup"
                  className="rounded-2xl bg-white px-8 py-4 text-zinc-900 font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Start now for free
                </Link>
                <Link
                  href="/login"
                  className="text-white font-bold hover:text-indigo-200 transition-colors"
                >
                  Explore demo <span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <span className="text-sm text-zinc-500 italic">Built for Community Organizers</span>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-sm text-zinc-500">
              &copy; {new Date().getFullYear()} Volunteer Scheduler. High Performance Management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
