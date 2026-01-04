import { z } from 'zod'

// Login schema
export const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

// Signup schema
export const SignupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

// Password reset schema
export const PasswordResetSchema = z.object({
    email: z.string().email('Invalid email address'),
})

// Volunteer schema
export const VolunteerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    group: z.string().max(50, 'Group name too long').optional(),
    max_hours: z.number().min(0, 'Hours must be positive').max(168, 'Maximum 168 hours per week').optional(),
})

// Shift schema
export const ShiftSchema = z.object({
    name: z.string().min(1, 'Shift name is required').max(100, 'Name too long'),
    start_time: z.string().datetime('Invalid start time'),
    end_time: z.string().datetime('Invalid end time'),
    required_groups: z.string().optional(),
    allowed_groups: z.string().optional(),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type SignupInput = z.infer<typeof SignupSchema>
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>
export type VolunteerInput = z.infer<typeof VolunteerSchema>
export type ShiftInput = z.infer<typeof ShiftSchema>
