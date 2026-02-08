import { createClient } from '@/lib/supabase/server'
import { inviteAdmin, revokeInvitation, getEventAdmins, getPendingInvitations } from './actions'
import { updateEventSettings } from '../../actions'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { GenerateNextOccurrenceButton } from './GenerateNextOccurrenceButton'
import { AdminActionButton } from './AdminActionButton'

interface Admin {
    user_id: string;
    role: string;
    email: string | null;
    created_at: string;
}

interface Invitation {
    id: string;
    email: string;
    expires_at: string;
}



const COMMON_TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
]

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check access & fetch event details
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

    if (eventError || !event) {
        redirect('/events')
    }

    const { data: adminsData } = await getEventAdmins(eventId)
    const { data: pendingData } = await getPendingInvitations(eventId)

    const admins = (adminsData as unknown as Admin[]) || []
    const pending = (pendingData as unknown as Invitation[]) || []

    return (
        <div className="p-6 md:p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Event Settings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                        Access control and configurations for {event.name}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* General Configuration */}
                    <div className="premium-card p-6">
                        <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            General Configuration
                        </h2>
                        <form action={async (formData) => {
                            'use server'
                            await updateEventSettings(formData)
                            revalidatePath(`/events/${eventId}/share`)
                            redirect(`/events/${eventId}/share`)
                        }} className="grid md:grid-cols-2 gap-4">
                            <input type="hidden" name="id" value={eventId} />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Event Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={event.name}
                                    required
                                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Event Timezone
                                </label>
                                <select
                                    name="timezone"
                                    defaultValue={event.timezone || 'UTC'}
                                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                >
                                    {COMMON_TIMEZONES.includes(event.timezone || '') ? null : (
                                        event.timezone && <option value={event.timezone}>{event.timezone}</option>
                                    )}
                                    {COMMON_TIMEZONES.map((tz) => (
                                        <option key={tz} value={tz}>
                                            {tz.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Recurrence (for series)
                                </label>
                                <select
                                    name="recurrence_rule"
                                    defaultValue={(event as { recurrence_rule?: string }).recurrence_rule || ''}
                                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                >
                                    <option value="">None</option>
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="BIWEEKLY">Biweekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                </select>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Use &quot;Generate next occurrence&quot; below to create the next event in the series.</p>
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {(event as { recurrence_rule?: string }).recurrence_rule && (
                        <div className="premium-card p-6">
                            <h2 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">Recurring series</h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                Create the next event in the series (same shifts and volunteers, new date).
                            </p>
                            <GenerateNextOccurrenceButton eventId={eventId} />
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Invite Section */}
                        <div className="space-y-6">
                            <div className="premium-card p-6">
                                <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                    Invite Admin
                                </h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                                    Invite another user to manage this event. They will have full administrative access.
                                </p>
                                <form action={async (formData) => {
                                    'use server'
                                    const email = formData.get('email') as string
                                    await inviteAdmin(eventId, email)
                                }}>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="colleague@example.com"
                                            required
                                            className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-zinc-900 transition-all font-medium"
                                        />
                                        <button
                                            type="submit"
                                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            Invite
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Pending Invitations */}
                            {pending.length > 0 && (
                                <div className="premium-card p-6">
                                    <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                        Pending Invitations
                                    </h2>
                                    <div className="space-y-4">
                                        {pending.map((invite) => (
                                            <div key={invite.id} className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{invite.email}</p>
                                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">Expires: {new Date(invite.expires_at).toLocaleDateString()}</p>
                                                </div>
                                                <form action={async () => {
                                                    'use server'
                                                    await revokeInvitation(invite.id, eventId)
                                                }}>
                                                    <button type="submit" className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors">
                                                        Revoke
                                                    </button>
                                                </form>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Current Admins List */}
                        <div className="premium-card p-6 h-fit">
                            <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                Current Admins
                            </h2>
                            <div className="space-y-4">
                                {admins.map((admin) => {
                                    const isMe = admin.user_id === user?.id
                                    return (
                                        <div key={admin.user_id} className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                    {admin.email ? admin.email[0].toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                                                        {isMe ? 'You' : (admin.email || `User ${admin.user_id.slice(0, 8)}...`)}
                                                    </p>
                                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                        {admin.role === 'owner' ? 'Owner' : 'Administrator'}
                                                    </p>
                                                </div>
                                            </div>

                                            <AdminActionButton
                                                eventId={eventId}
                                                userId={admin.user_id}
                                                isMe={isMe}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
