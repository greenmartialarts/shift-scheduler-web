# Volunteer Scheduler Web App

A web application for managing events, volunteers, and shifts, featuring automated scheduling integration.

## Features

-   **Authentication**: Secure user sign-up and login via Supabase.
-   **Event Management**: Create and manage multiple events.
-   **Volunteer Management**:
    -   Add volunteers individually.
    -   **Bulk Upload**: Import volunteers via CSV.
    -   Continuous search and filtering.
-   **Shift Management**:
    -   Create shifts with specific group requirements (e.g., "2 Delegates, 1 Adult").
    -   **Bulk Upload**: Import shifts via CSV.
    -   Continuous search.
-   **Assignments**:
    -   Manual assignment of volunteers to shifts.
    -   **Auto-Assign**: One-click automated scheduling powered by an external optimization API.
    -   **Swapping**: Easily swap volunteers between shifts.

## Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Database & Auth**: [Supabase](https://supabase.com/)
-   **CSV Parsing**: PapaParse

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   A Supabase project

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/scheduler-web.git
    cd scheduler-web
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Database Setup:
    Run the SQL script located in `supabase/schema.sql` in your Supabase SQL Editor to create the necessary tables and Row Level Security (RLS) policies.

5.  Run the development server:
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Bulk Upload Formats

**Volunteers CSV (`sample_volunteers.csv`)**
```csv
id,name,group,max_hours
v1,John Doe,Delegates,8
v2,Jane Smith,Adults,10
```

**Shifts CSV (`sample_shifts.csv`)**
```csv
id,start,end,required_groups,allowed_groups,excluded_groups
s1,2025-12-01T09:00,2025-12-01T11:00,Delegates:1|Adults:1,Delegates|Adults,
```

### Auto-Assign API

This project integrates with the Shift Scheduler API. The auto-assign feature sends current event data to:
`POST https://shift-scheduler-api-j4wh.onrender.com/schedule/json`

## License

MIT

## Recent Changes

-   **New Landing Page**: A custom root landing page with feature highlights.
-   **Dark Mode Toggle**: Repositioned to the bottom-right for better accessibility.
-   **Login Error Handling**: Improved feedback with inline error messages.
-   **Sample Data**:
    -   Updated `sample_volunteers.csv` and `sample_shifts.csv` for feasible scheduling scenarios (121 volunteers, 150 shifts).
    -   Added `sample_volunteers_impossible.csv` and `sample_shifts_impossible.csv` for testing impossible scheduling scenarios.
    -   Included Python scripts (`generate_data.py`, `generate_impossible_data.py`) for data generation.
-   **Delete All**: Added "Delete All" buttons for volunteers and shifts to easily clear data.

## Known Issues

-   **Auto-Assign Silent Failure**: The auto-assign feature currently does not explicitly notify the user if a valid schedule could not be found (i.e., if the problem is mathematically impossible). It may fail silently or return an incomplete schedule without a clear error message.
