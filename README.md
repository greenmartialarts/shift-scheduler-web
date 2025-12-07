# Volunteer Scheduler Web

A comprehensive web application for managing event volunteers, shifts, and assignments. Built with Next.js and Supabase, it features a robust admin dashboard and a tablet-friendly Kiosk mode for on-site operations.

## Features

### 📅 Event & Shift Management
-   **Event Dashboard**: Real-time analytics on fill rates, attendance, and volunteer distribution.
-   **Shift Management**: Create and manage shifts with specific requirements (time, required groups).
-   **Templates & Recurring Shifts**: Quickly generate schedules using templates and recurring patterns.
-   **Clone Events**: Easily duplicate entire events including their shift structures.
-   **Inline Editing**: Update shift details and requirements on the fly.

### 👥 Volunteer Management
-   **Volunteer Database**: Manage volunteer profiles and group affiliations.
-   **Inline Editing**: Quickly update volunteer details directly from the list view.
-   **Bulk Upload**: Import volunteers and shifts via CSV.
-   **Group Management**: Organize volunteers into groups (e.g., "Medical", "Security", "General") with color-coding.

### 📋 Assignments
-   **Smart Assignments**: Manually assign volunteers or use the Auto-Assign feature to fill slots based on availability and group requirements.
-   **Conflict Detection**: Prevents double-booking volunteers.

### 📱 Kiosk Mode & Check-in
-   **Tablet-Friendly Interface**: Simplified, high-contrast UI designed for on-site tablets.
-   **Self-Service**: Volunteers can search for their name and check themselves in/out.
-   **Asset Tracking**: Assign equipment (radios, vests) during check-in and track returns during check-out.
-   **Smart Transitions**: Automatically handles switching between consecutive shifts, prompting for asset transfer.

### 📦 Asset Management
-   **Inventory Tracking**: Manage a pool of assets (radios, keys, vests).
-   **Status Monitoring**: Track which assets are available, assigned, lost, or in maintenance.

### 📊 Reporting
-   **Export Data**: Download schedules and volunteer lists as CSV.
-   **PDF Reports**: Generate printable Sign-In Sheets and individual Volunteer Schedule PDFs.
-   **Live Stats**: Monitor "Active Currently" (on-site) vs "Total Checked In" (attendance) counts.

### 🔐 Security & Access Control
-   **Role-Based Access**: Distinguishes between 'Admin' (full access).
-   **Authentication**: Secure login with error feedback and basic password reset functionality.

## Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Database & Auth**: [Supabase](https://supabase.com/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

-   Node.js 18+
-   A Supabase project

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd scheduler_web
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    Run the SQL migrations located in `supabase/migrations` in your Supabase SQL Editor to set up the schema and Row Level Security (RLS) policies.
    -   `20251202000001_add_scheduler_features.sql`
    -   `20251202000002_add_assets_and_kiosk.sql`
    -   `20251202000003_add_assignment_checkout.sql`

5.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage Guide

### Setting up an Event
1.  Navigate to the dashboard and create a new Event.
2.  Go to **Manage Groups** to define volunteer roles.
3.  Go to **Shifts** to create shifts manually or import them.
4.  Go to **Volunteers** to add your team.

### Managing Assignments
1.  Use the **Assignments** page to drag-and-drop volunteers or use the "Auto Assign" button.
2.  Review the **Dashboard** to see fill rates.

### On-Site Operations
1.  On a tablet, navigate to the Event Dashboard and click **Launch Kiosk**.
2.  Place the tablet at the check-in desk.
3.  Volunteers search their name to check in.
4.  If assets are required, the Kiosk will prompt to assign them.
