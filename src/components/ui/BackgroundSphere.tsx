'use client'

import { motion } from 'framer-motion'

export function BackgroundSphere() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 120, 240, 360],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/15 blur-[100px] dark:from-indigo-500/10 dark:to-purple-500/10"
            />
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    rotate: [360, 240, 120, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-purple-500/15 to-indigo-500/15 blur-[100px] dark:from-purple-500/10 dark:to-indigo-500/10"
            />
        </div>
    )
}
