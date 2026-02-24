"use client";

import dynamic from 'next/dynamic';
import type { Volunteer, Shift } from './reports-manager';

const ReportsManager = dynamic(() => import('./reports-manager'), {
    ssr: false,
    loading: () => (
        <div className="h-96 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

export default function ReportsClient({
    eventName,
    volunteers,
    shifts,
    eventId
}: {
    eventName: string;
    volunteers: Volunteer[];
    shifts: Shift[];
    eventId: string;
}) {
    return (
        <ReportsManager
            eventName={eventName}
            volunteers={volunteers}
            shifts={shifts}
            eventId={eventId}
        />
    );
}
