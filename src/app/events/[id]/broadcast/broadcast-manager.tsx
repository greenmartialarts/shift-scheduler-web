'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Users, UserCheck, MessageSquare, Mail, AtSign, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { PremiumButton } from '@/components/ui/PremiumButton'
import { useNotification } from '@/components/ui/NotificationProvider'
import { sendBroadcastEmail } from './actions'

type Volunteer = {
    id: string
    name: string
    group: string | null
    email: string | null
    phone: string | null
}

export default function BroadcastManager({
    eventId,
    volunteers,
    activeVolunteerIds,
}: {
    eventId: string
    volunteers: Volunteer[]
    activeVolunteerIds: Set<string>
}) {
    const [filterType, setFilterType] = useState<'all' | 'active' | 'group'>('all')
    const [selectedGroup, setSelectedGroup] = useState<string>('')
    const [replyToAccount, setReplyToAccount] = useState<number>(1)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { showAlert } = useNotification()

    const groups = Array.from(new Set(volunteers.map(v => v.group).filter(Boolean))) as string[]

    const filteredVolunteers = volunteers.filter(v => {
        if (filterType === 'all') return true
        if (filterType === 'active') return activeVolunteerIds.has(v.id)
        if (filterType === 'group') return v.group === selectedGroup
        return true
    }).filter(v => v.email)

    async function handleSend() {
        if (!subject || !message) {
            showAlert('Please provide both a subject and a message.', 'warning')
            return
        }

        if (filteredVolunteers.length === 0) {
            showAlert('No eligible recipients found for this selection.', 'warning')
            return
        }

        setIsLoading(true)
        const recipientEmails = filteredVolunteers.map(v => v.email!)

        const res = await sendBroadcastEmail(eventId, {
            emails: recipientEmails,
            subject,
            message,
            replyToAccount
        })

        setIsLoading(false)

        if (res?.success) {
            showAlert(`Broadcast sent successfully to ${filteredVolunteers.length} volunteers!`, 'success')
            setSubject('')
            setMessage('')
        } else {
            showAlert(res?.error || 'Failed to send broadcast.', 'error')
        }
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Configuration */}
            <div className="lg:col-span-1 space-y-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="premium-card p-6"
                >
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        Target Audience
                    </h3>

                    <div className="space-y-3">
                        {[
                            { id: 'all', label: 'All Volunteers', icon: Users, sub: `${volunteers.filter(v => v.email).length} eligible` },
                            { id: 'active', label: 'Active Now', icon: UserCheck, sub: `${Array.from(activeVolunteerIds).filter(id => volunteers.find(v => v.id === id)?.email).length} checked in` },
                            { id: 'group', label: 'Specific Group', icon: MessageSquare, sub: 'Filter by role' }
                        ].map(item => (
                            <motion.button
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setFilterType(item.id as 'all' | 'active' | 'group')}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${filterType === item.id
                                    ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]'
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    }`}
                            >
                                <div className={`p-2 rounded-xl ${filterType === item.id ? 'bg-indigo-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className={`font-black tracking-tight ${filterType === item.id ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500'}`}>{item.label}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{item.sub}</div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {filterType === 'group' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800"
                            >
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3 pl-1">Select Group</label>
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold text-zinc-900 dark:text-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                                >
                                    <option value="">Choose a group...</option>
                                    {groups.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="premium-card p-6 bg-amber-500/5 border-amber-500/20"
                >
                    <h3 className="text-sm font-black uppercase tracking-widest text-amber-600/60 dark:text-amber-400/60 mb-6 flex items-center gap-2">
                        <AtSign className="w-4 h-4" />
                        Reply-To Channel
                    </h3>

                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(num => (
                            <motion.button
                                key={num}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setReplyToAccount(num)}
                                className={`p-3 rounded-xl border font-black text-xs transition-all ${replyToAccount === num
                                    ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20'
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-amber-500/30'
                                    }`}
                            >
                                ACCT {num}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right: Composition */}
            <div className="lg:col-span-2 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card p-8 flex flex-col h-full bg-indigo-500/[0.02]"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
                            <Mail className="w-7 h-7 text-indigo-500" />
                            Compose Broadcast
                        </h2>
                        <div className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
                            {filteredVolunteers.length} Recipients Selected
                        </div>
                    </div>

                    <div className="space-y-6 flex-grow">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 ml-1">Message Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Urgent: All Medical Staff to Gate 4"
                                className="w-full px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-bold"
                            />
                        </div>

                        <div className="flex-grow flex flex-col">
                            <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 ml-1">Message Content</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Draft your command here..."
                                className="w-full flex-grow min-h-[300px] px-6 py-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-medium leading-relaxed resize-none shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold italic">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Rotation enabled: 25 recipients per batch
                        </div>
                        <PremiumButton
                            onClick={handleSend}
                            disabled={isLoading || !subject || !message || filteredVolunteers.length === 0}
                            className="w-full md:w-auto px-12 py-5 text-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Deploying Broadcast...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-3" />
                                    Launch Broadcast
                                </>
                            )}
                        </PremiumButton>
                    </div>
                </motion.div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <AlertCircle className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                        This broadcast will be phased across 3 distinct Gmail identities to ensure deliverability and avoid security flagging.
                        Each recipient is BCC&apos;d for privacy.
                    </p>
                </div>
            </div>
        </div>
    )
}
