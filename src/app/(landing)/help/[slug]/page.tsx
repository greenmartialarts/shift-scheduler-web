import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, User } from "lucide-react";
import { ArticleFeedback } from "@/components/help/ArticleFeedback";

const articles: Record<string, {
    title: string;
    category: string;
    readTime: string;
    lastUpdated: string;
    content: React.ReactNode;
}> = {
    "bulk-import-csv": {
        title: "How to bulk import volunteers from CSV",
        category: "Management",
        readTime: "4 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>Importing your volunteer database is handled within each event. Our smart importer brings in your team along with their group assignments in seconds.</p>
                <h3>Preparation</h3>
                <p>Your CSV should ideally have columns for Name, Email, and Group. Our system will attempt to auto-map these during the upload process.</p>
                <h3>Steps to Import</h3>
                <ol>
                    <li>From your event dashboard, select the <strong>Volunteers</strong> module.</li>
                    <li>Click the <strong>Import CSV</strong> button at the top of the volunteer list.</li>
                    <li>Upload your file and verify the column mapping.</li>
                    <li>Review the preview to ensure names and groups are correctly parsed.</li>
                    <li>Click <strong>Confirm Import</strong> to add the volunteers to your event.</li>
                </ol>
            </>
        )
    },
    "automated-shift-reminders": {
        title: "Setting up automated shift reminders",
        category: "Automation",
        readTime: "3 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>The system handles reminders through the <strong>Broadcast</strong> and <strong>Settings</strong> modules. Automated triggers ensure volunteers are notified before their shifts start.</p>
                <h3>Configuration</h3>
                <p>Navigate to <strong>Settings</strong> (Share) to configure event-wide notification preferences. You can toggle automated reminders and set the buffer time for delivery.</p>
                <h3>Manual Broadcasts</h3>
                <p>For urgent updates, use the <strong>Broadcast</strong> module to send instant messages to all assigned volunteers or specific groups.</p>
            </>
        )
    },
    "check-in-kiosk-settings": {
        title: "Customizing check-in kiosk settings",
        category: "Operations",
        readTime: "5 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>The <strong>Launch Kiosk</strong> feature provides a dedicated, simplified interface for volunteer self-service check-in.</p>
                <h3>Using the Kiosk</h3>
                <p>Click <strong>Launch Kiosk</strong> from the event header. This opens a separate view that hides admin controls, allowing volunteers to find their name and check in independently.</p>
                <h3>Kiosk Features</h3>
                <ul>
                    <li><strong>Buffer Logic</strong>: Automatically shows shifts starting within the current window.</li>
                    <li><strong>Fast Search</strong>: Quickly filter the roster by name.</li>
                    <li><strong>Asset Integration</strong>: Prompts volunteers if they have assigned assets to collect.</li>
                </ul>
            </>
        )
    },
    "admin-permissions": {
        title: "Managing administrator permissions",
        category: "Security",
        readTime: "3 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>Admin security is managed through the <strong>Account</strong> and <strong>Settings</strong> sections. You can control who has access to specific events and management modules.</p>
                <h3>Super Admin vs Event Admin</h3>
                <p>Super Admins can create and delete events, while Event Admins (shared via the <strong>Settings</strong> module) can manage the day-to-day operations of a specific project.</p>
            </>
        )
    },
    "attendance-reports-payroll": {
        title: "Exporting attendance reports for payroll",
        category: "Reporting",
        readTime: "4 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>The <strong>Reports</strong> module provides real-time data on check-in/out times, total hours, and volunteer performance.</p>
                <h3>Generating Exports</h3>
                <ol>
                    <li>Select <strong>Reports</strong> from your event dashboard.</li>
                    <li>Review the <strong>Attendance</strong> summary for a high-level overview.</li>
                    <li>Click <strong>Export Data</strong> to download a CSV containing precise timestamps for check-ins and check-outs, ready for payroll processing.</li>
                </ol>
            </>
        )
    },
    "email-delivery-issues": {
        title: "Troubleshooting email delivery issues",
        category: "Support",
        readTime: "3 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>Email reliability is a priority. Most issues can be resolved by checking volunteer profile details or broadcast logs.</p>
                <h3>Resolution Steps</h3>
                <ul>
                    <li>Verify the volunteer&apos;s email address in the <strong>Volunteers</strong> module.</li>
                    <li>Check the <strong>Broadcast</strong> module to see if messages were marked as failed or queued.</li>
                    <li>Ensure the event domain is not blocked by the volunteer&apos;s corporate or personal spam filter.</li>
                </ul>
            </>
        )
    },
    "overlapping-shifts": {
        title: "Handling overlapping volunteer shifts",
        category: "Scheduling",
        readTime: "3 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>The <strong>Assignments</strong> module includes intelligent conflict detection to prevent volunteers from being double-booked.</p>
                <h3>Visual Alerts</h3>
                <p>When manually assigning shifts, the interface will flag overlaps in real-time. On the <strong>Admin Center</strong> (Active Personnel) view, you can see if active volunteers have conflicting future shifts scheduled.</p>
            </>
        )
    },
    "daily-volunteer-schedules": {
        title: "Printing daily volunteer schedules",
        category: "Operational",
        readTime: "2 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>For paper-based coordination, use the <strong>Reports</strong> module to generate printable roster sheets.</p>
                <h3>Steps</h3>
                <ol>
                    <li>Navigate to <strong>Reports</strong>.</li>
                    <li>Choose the <strong>Daily Roster</strong> template.</li>
                    <li>The system generates a print-optimized view of all shifts, assigned volunteers, and their contact information.</li>
                </ol>
            </>
        )
    },
    "custom-shift-names": {
        title: "Configuring custom shift names",
        category: "Customization",
        readTime: "2 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>Customize your event structure by naming shifts based on their function within the <strong>Shifts</strong> module.</p>
                <h3>Setup</h3>
                <ol>
                    <li>Open the <strong>Shifts</strong> module.</li>
                    <li>When creating or editing a timeline, enter a descriptive <strong>Shift Name</strong> (e.g., &quot;Registration A&quot; or &quot;VIP Lounge&quot;).</li>
                    <li>These names will appear in the Kiosk and all volunteer notifications.</li>
                </ol>
            </>
        )
    },
    "resetting-admin-passwords": {
        title: "Resetting administrator passwords",
        category: "Security",
        readTime: "2 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>Password management is handled in the <strong>Account</strong> section of the application.</p>
                <p>Users can reset their own password by going to the Login page and selecting <strong>Forgot Password</strong>, or by updating it in <strong>Account Settings</strong> when logged in.</p>
            </>
        )
    },
    "performance-analytics": {
        title: "Interpreting performance analytics",
        category: "Reporting",
        readTime: "6 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>The main <strong>Event Dashboard</strong> and <strong>Reports</strong> modules provide deep insights into your event&apos;s success.</p>
                <h3>Key Metrics Explained</h3>
                <ul>
                    <li><strong>Fill Rate</strong>: Calculated by comparing your required shift groups against actual assignments.</li>
                    <li><strong>Operational Intelligence</strong>: Interactive charts showing volunteer distribution by group and shift status.</li>
                    <li><strong>Active Personnel</strong>: Real-time count of currently checked-in volunteers compared to scheduled demand.</li>
                </ul>
            </>
        )
    },
    "asset-assignments-real-time": {
        title: "Managing asset assignments in real-time",
        category: "Operations",
        readTime: "4 min read",
        lastUpdated: "January 2026",
        content: (
            <>
                <p>The <strong>Assets</strong> module allows you to track equipment like radios and vests as volunteers check in.</p>
                <h3>Workflow</h3>
                <ol>
                    <li>Add equipment to the <strong>Assets</strong> inventory.</li>
                    <li>When a volunteer arrives, use the <strong>Admin Center</strong> or <strong>Check-in</strong> module to link an asset ID to their current shift.</li>
                    <li>The system tracks the asset as &quot;Checked Out&quot; until the volunteer checks out of their shift.</li>
                </ol>
            </>
        )
    }
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = articles[slug];

    if (!article) {
        notFound();
    }

    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                <Link
                    href="/help"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-indigo-600 transition-colors mb-12"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Help Center
                </Link>

                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                            {article.category}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Clock className="h-4 w-4" />
                            {article.readTime}
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl mb-8">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-3 text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-8">
                        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 italic">Volunteer Scheduler Team</div>
                            <div className="text-xs">Last updated: {article.lastUpdated}</div>
                        </div>
                    </div>
                </header>

                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <div className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 space-y-8">
                        {article.content}
                    </div>
                </div>

                <ArticleFeedback />
            </div>
        </div>
    );
}
