'use client'

import { motion } from 'framer-motion'

export function BackgroundSphere() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-zinc-50 dark:bg-zinc-950">
            {/* Main Animated Sphere */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    rotate: [0, 90, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
            />

            {/* Smaller Complementary Sphere */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -30, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />

            {/* Accent Glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 dark:opacity-20"
                style={{
                    background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
                }}
            />
        </div>
    )
}
