import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Volunteer Scheduler
          </div>
          <Link
            href="/login"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-6 py-24 sm:py-32 lg:px-8 overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="mx-auto max-w-3xl text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Powered by AI Optimization
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-zinc-900 via-indigo-900 to-purple-900 dark:from-zinc-50 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent animate-fade-in-up">
              Comprehensive Volunteer Management
            </h1>
            <p className="mt-8 text-xl leading-8 text-zinc-600 dark:text-zinc-400 animate-fade-in-up animation-delay-200">
              Streamline your event staffing with automated scheduling, real-time check-in tracking,
              conflict detection, and detailed reporting. The complete solution for community organizers and non-profits.
            </p>
            <div className="mt-12 flex items-center justify-center gap-x-6 animate-fade-in-up animation-delay-400">
              <Link
                href="/login"
                className="group relative rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <span className="relative z-10">Get started</span>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 blur transition-opacity duration-200" />
              </Link>
              <a
                href="#features"
                className="group text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
              >
                Learn more <span aria-hidden="true" className="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative bg-white dark:bg-zinc-950 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Complete Feature Set</h2>
              <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Everything You Need to Manage Events
              </p>
              <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                From volunteer onboarding to final reporting, our platform handles every aspect of event coordination.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                {/* Feature Cards */}
                {[
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
                ].map((feature, index) => (
                  <div
                    key={feature.name}
                    className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 hover:border-transparent hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    <div className="relative">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-4`}>
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          {feature.icon}
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                        {feature.name}
                      </h3>
                      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 py-24 sm:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Ready to streamline your events?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Join organizations using our platform to manage volunteers efficiently and effectively.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/signup"
                  className="group relative rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
                >
                  <span className="relative z-10">Sign up free</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 blur transition-opacity duration-200" />
                </Link>
                <Link
                  href="/login"
                  className="group text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  Already have an account? <span aria-hidden="true" className="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-zinc-500">
              &copy; {new Date().getFullYear()} Volunteer Scheduler. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
