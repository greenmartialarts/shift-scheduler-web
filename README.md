# Volunteer Scheduler Web App

A comprehensive web application for managing events, volunteers, and shifts with automated scheduling, real-time check-in tracking, and detailed reporting capabilities.

## Features

### 🔐 Authentication
- Secure user sign-up and login via Supabase
- Password reset functionality
- Protected routes with automatic redirects

### 📅 Event Management
- Create and manage multiple events
- Event-specific dashboards
- Date-based organization

### 👥 Volunteer Management
- **Individual Entry**: Add volunteers one at a time with custom details
- **Bulk Upload**: Import volunteers via CSV with support for:
  - Name, group, and max hours
  - Automatic validation
- **Search & Filter**: Real-time search across volunteer names and groups
- **Delete All**: Quick data cleanup with bulk delete option

### ⏰ Shift Management
- **Named Shifts**: Assign custom names to shifts for easy identification
- **Flexible Scheduling**: Create shifts with:
  - Start and end times
  - Group-based requirements (e.g., "2 Delegates, 1 Adult")
  - Allowed and excluded volunteer groups
- **Bulk Upload**: Import shifts via CSV with support for:
  - Shift names, times, and requirements
  - Complex group configurations
- **Search**: Search by shift name, date, or time
- **Delete All**: Bulk delete functionality

### 🎯 Assignment System
- **Manual Assignment**: Drag-and-drop style volunteer assignment
- **Auto-Assign**: One-click automated scheduling powered by optimization API
  - Handles complex constraints
  - Partial assignment support with detailed feedback
  - Unfilled shift notifications
- **Conflict Detection**: Automatic detection of:
  - Double-booked volunteers
  - Overlapping shift times
  - Visual warnings with priority sorting
- **Swap Functionality**: Easy volunteer swapping between shifts
- **Smart Search**: Search by shift name, date/time, or volunteer name
- **Visual Indicators**: Color-coded shifts for conflicts and unfilled positions

### ✅ Check-in Management
- **Real-time Tracking**: Check volunteers in/out during shifts
- **Late Detection**: Automatic flagging of late arrivals
- **Smart Sorting**: Priority-based shift ordering:
  - Late/active shifts at top
  - Upcoming shifts in middle
  - Completed shifts at bottom
- **Dismiss Warnings**: Ability to dismiss late warnings for excused absences
- **Search**: Search by shift name, date, time, or volunteer name
- **Visual Status**: Color-coded shifts (red for late, green for complete)

### 📊 Reports & Analytics
- **Master Schedule Export**: CSV export with:
  - Shift names and times
  - Volunteer assignments
  - Attendance status
- **Volunteer Statistics**: Track per volunteer:
  - Total hours worked
  - Shifts completed
  - Late/absent count
- **Individual PDFs**: Generate personalized schedules for each volunteer
- **Bulk PDF Export**: Create combined PDF with all volunteer schedules
- **CSV Exports**: Downloadable reports for external analysis

### 🎨 User Experience
- **Dark Mode**: Full dark mode support with persistent toggle
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Automatic page refreshes after data changes
- **Error Handling**: Clear error messages and validation feedback
- **Loading States**: Visual feedback for async operations

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: [Supabase](https://supabase.com/)
- **CSV Parsing**: PapaParse
- **PDF Generation**: jsPDF with autoTable
- **API Integration**: Shift Scheduler Optimization API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/scheduler-web.git
   cd scheduler-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Database Setup:
   Run the SQL migrations in `supabase/migrations/` in your Supabase SQL Editor to create the necessary tables and Row Level Security (RLS) policies.

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Bulk Upload Formats

**Volunteers CSV**
```csv
id,name,group,max_hours
v1,John Doe,Delegates,8
v2,Jane Smith,Adults,10
```

**Shifts CSV**
```csv
name,id,start,end,required_groups,allowed_groups,excluded_groups
Morning Shift,s1,2025-12-01T09:00,2025-12-01T11:00,Delegates:2|Adults:1,Delegates|Adults,
Afternoon Shift,s2,2025-12-01T14:00,2025-12-01T16:00,Delegates:1|Adults:2,Delegates|Adults,
```

### Auto-Assign API

This project integrates with the Shift Scheduler API for automated assignment optimization:
- **Endpoint**: `POST https://shift-scheduler-api-j4wh.onrender.com/schedule/json`
- **Features**: Constraint-based optimization, partial assignment support
- **Feedback**: Detailed unfilled shift notifications

### Sample Data

The repository includes sample data files for testing:
- `sample_volunteers.csv` / `sample_shifts.csv`: Feasible scenario (121 volunteers, 150 shifts)
- `sample_volunteers_impossible.csv` / `sample_shifts_impossible.csv`: Impossible scenario for testing
- Python scripts (`generate_data.py`, `generate_impossible_data.py`) for regenerating sample data

## Database Schema

Key tables:
- `events`: Event information
- `volunteers`: Volunteer details with group and max hours
- `shifts`: Shift schedules with named shifts and group requirements
- `assignments`: Volunteer-to-shift mappings with check-in status

## Recent Updates

- **Shift Names**: Added custom naming for shifts across all features
- **Enhanced Search**: Search by shift name in assignments and check-in
- **Improved Auto-Assign**: Better feedback for partial assignments and unfilled shifts
- **Check-in Features**: Late detection, dismissible warnings, smart sorting
- **Reports**: Enhanced exports with shift names in CSV and PDF formats
- **Dark Mode**: Repositioned toggle to bottom-right for better accessibility
- **Delete All**: Bulk delete functionality for volunteers and shifts

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
