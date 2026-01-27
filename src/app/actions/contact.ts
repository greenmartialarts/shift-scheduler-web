"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import nodemailer from "nodemailer";

const ContactSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(10, "Message must be at least 10 characters long"),
});

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function submitContactForm(formData: FormData) {
    const data = {
        firstName: formData.get("first-name"),
        lastName: formData.get("last-name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    };

    const validated = ContactSchema.safeParse(data);

    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0].message,
        };
    }

    try {
        const supabase = await createClient();
        const { error: dbError } = await supabase.from("contact_submissions").insert({
            first_name: validated.data.firstName,
            last_name: validated.data.lastName,
            email: validated.data.email,
            subject: validated.data.subject,
            message: validated.data.message,
        });

        if (dbError) {
            console.error("Database error:", dbError);
            return { success: false, error: "Failed to save submission." };
        }

        // Send Email Notification (Only if SMTP is configured)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                await transporter.sendMail({
                    from: `"Contact Form" <${process.env.SMTP_USER}>`,
                    to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
                    replyTo: validated.data.email,
                    subject: `New Contact Submission: ${validated.data.subject}`,
                    text: `
Name: ${validated.data.firstName} ${validated.data.lastName}
Email: ${validated.data.email}
Subject: ${validated.data.subject}

Message:
${validated.data.message}
                    `,
                    html: `
                        <div style="font-family: 'Inter', sans-serif, system-ui; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
                            <div style="background-color: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                                <div style="display: flex; align-items: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #f1f5f9;">
                                    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); width: 40px; height: 40px; border-radius: 10px; margin-right: 15px;"></div>
                                    <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #4f46e5; letter-spacing: -0.025em;">Scheduler <span style="color: #94a3b8; font-weight: 400; font-size: 16px;">Contact Center</span></h1>
                                </div>
                                
                                <p style="font-size: 16px; margin-bottom: 24px;">You have received a new inquiry from the <strong>Scheduler</strong> website.</p>
                                
                                <div style="background-color: #f1f5f9; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                                    <div style="margin-bottom: 12px; font-size: 14px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em;">Submission Details</div>
                                    <div style="display: grid; gap: 12px;">
                                        <div><strong style="color: #475569;">From:</strong> ${validated.data.firstName} ${validated.data.lastName}</div>
                                        <div><strong style="color: #475569;">Email:</strong> <a href="mailto:${validated.data.email}" style="color: #4f46e5; text-decoration: none;">${validated.data.email}</a></div>
                                        <div><strong style="color: #475569;">Subject:</strong> ${validated.data.subject}</div>
                                    </div>
                                </div>
                                
                                <div style="margin-bottom: 32px;">
                                    <div style="margin-bottom: 12px; font-size: 14px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em;">Message Content</div>
                                    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; white-space: pre-wrap; color: #334155; font-size: 16px;">${validated.data.message}</div>
                                </div>
                                
                                <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9;">
                                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">This email was automatically generated by the Scheduler Contact System.</p>
                                    <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">© 2026 Scheduler. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    `,
                });
            } catch (emailErr) {
                console.error("Email notification error:", emailErr);
                // We don't return error to user because the data is already saved in the DB
            }
        }

        return { success: true };
    } catch (err) {
        console.error("Submission error:", err);
        return { success: false, error: "An unexpected error occurred." };
    }
}
