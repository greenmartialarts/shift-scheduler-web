'use server'

import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'

type BroadcastOptions = {
    emails: string[]
    subject: string
    message: string
    replyToAccount: number
}

export async function sendBroadcastEmail(eventId: string, options: BroadcastOptions) {
    const { emails, subject, message, replyToAccount } = options

    const configs = [
        { user: process.env.GMAIL_USER_1, pass: process.env.GMAIL_PASS_1 },
        { user: process.env.GMAIL_USER_2, pass: process.env.GMAIL_PASS_2 },
        { user: process.env.GMAIL_USER_3, pass: process.env.GMAIL_PASS_3 },
    ]

    // Verify all configs are present
    const validConfigs = configs.filter(c => c.user && c.pass)
    if (validConfigs.length < 3) {
        return { error: 'Broadcast Hub requires 3 Gmail accounts configured in .env.local (GMAIL_USER_1/2/3 and GMAIL_PASS_1/2/3)' }
    }

    const transporters = validConfigs.map(config =>
        nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.user,
                pass: config.pass,
            },
        })
    )

    // Determine Reply-To address
    const replyToEmail = validConfigs[replyToAccount - 1]?.user

    // Batch recipients (max 25 per user request)
    const BATCH_SIZE = 25
    const batches: string[][] = []
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        batches.push(emails.slice(i, i + BATCH_SIZE))
    }

    try {
        // Parallel batch sending with rotation
        const sendPromises = batches.map((batch, index) => {
            const transporterIndex = index % transporters.length
            const transporter = transporters[transporterIndex]
            const fromEmail = validConfigs[transporterIndex].user

            return transporter.sendMail({
                from: `\"Shift Scheduler Broadcast\" <${fromEmail}>`,
                to: fromEmail, // Send to self
                bcc: batch,    // Hide primary recipients
                subject: subject,
                text: message,
                html: `<div style=\"font-family: sans-serif; line-height: 1.6; color: #333;\">${message.replace(/\\n/g, '<br>')}</div>`,
                replyTo: replyToEmail
            })
        })

        await Promise.all(sendPromises)
        return { success: true }
    } catch (error: any) {
        console.error('Broadcast Error:', error)
        return { error: error.message || 'An unexpected error occurred during broadcast.' }
    }
}
