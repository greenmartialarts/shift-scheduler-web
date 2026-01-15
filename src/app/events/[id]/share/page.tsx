import { createClient } from '@/lib/supabase/server'
import { inviteAdmin, removeAdmin, revokeInvitation, getEventAdmins, getPendingInvitations } from './actions'
import { redirect } from 'next/navigation'

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
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Access control and configurations for {event.name}
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Invite Section */}
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800">
                            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
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
                                        className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 transition-all font-medium"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        Invite
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Pending Invitations */}
                        {pending.length > 0 && (
                            <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800">
                                <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-50">
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
                                                <button type="submit" className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-red-500 transition-colors">
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
                    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 h-fit">
                        <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                            Current Admins
                        </h2>
                        <div className="space-y-4">
                            {admins.map((admin) => {
                                const isMe = admin.user_id === user?.id
                                return (
                                    <div key={admin.user_id} className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">
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

                                        <form action={async () => {
                                            'use server'
                                            await removeAdmin(eventId, admin.user_id)
                                        }}>
                                            <button
                                                type="submit"
                                                className={`text-xs font-black uppercase tracking-widest transition-colors ${isMe ? 'text-zinc-200 dark:text-zinc-800 cursor-not-allowed' : 'text-red-600 hover:text-red-500'}`}
                                                disabled={isMe}
                                            >
                                                {isMe ? 'Leave' : 'Remove'}
                                            </button>
                                        </form>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
