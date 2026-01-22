'use client'

import { useTutorial, TutorialStepId } from './TutorialContext'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const STEP_CONTENT: Record<TutorialStepId, { title: string, description: string, targetId?: string, position?: 'center' | 'bottom' | 'top' | 'left' | 'right' }> = {
    'welcome': {
        title: "Welcome to Shift Scheduler!",
        description: "Let's get you set up to manage your volunteers efficiently. This quick interactive tour will guide you through running a complete event. You can always restart this tutorial from the Settings menu.",
        position: 'center'
    },
    'create-hub': {
        title: "Create Your First Hub",
        description: "Start here by creating an Event Hub. This is where you'll manage shifts, volunteers, and assignments.",
        targetId: 'create-event-button',
        position: 'bottom'
    },
    'event-details': {
        title: "Event Details",
        description: "Fill in the details for your event. Name it 'Tutorial Event' so we can easily delete it later.",
        targetId: 'event-form',
        position: 'right'
    },
    'open-event': {
        title: "Open Your New Event",
        description: "Great! Your event is created. Click on the card to open the Command Center.",
        targetId: 'latest-event-card',
        position: 'bottom'
    },
    'command-center': {
        title: "The Command Center",
        description: "This is your Event Dashboard. It gives you a high-level overview of your operations, including fill rates and active personnel.",
        targetId: 'stats-grid',
        position: 'bottom'
    },
    'manage-access': {
        title: "Manage Access",
        description: "Here you can invite other admins to help manage this specific event.",
        targetId: 'tab-share',
        position: 'bottom'
    },
    'volunteers-tab': {
        title: "Volunteers",
        description: "Let's add your workforce. Click here to manage volunteers.",
        targetId: 'tab-volunteers',
        position: 'bottom'
    },
    'add-volunteer': {
        title: "Add a Volunteer",
        description: "Add a single volunteer manually to get started.",
        targetId: 'add-volunteer-btn',
        position: 'bottom'
    },
    'import-volunteers': {
        title: "Bulk Import",
        description: "For large events, you can import hundreds of volunteers at once using a CSV file.",
        targetId: 'import-volunteers-btn',
        position: 'bottom'
    },
    'shifts-tab': {
        title: "Shifts",
        description: "Now let's define when people need to work.",
        targetId: 'tab-shifts',
        position: 'bottom'
    },
    'add-shift': {
        title: "Add a Shift",
        description: "Create a shift, for example 'Morning Setup'.",
        targetId: 'add-shift-btn',
        position: 'bottom'
    },
    'import-shifts': {
        title: "Import Shifts",
        description: "Just like volunteers, shifts can be bulk imported via CSV.",
        targetId: 'import-shifts-btn',
        position: 'bottom'
    },
    'assignments-tab': {
        title: "Assignments",
        description: "Match your volunteers to shifts.",
        targetId: 'tab-assignments',
        position: 'bottom'
    },
    'assign-volunteer': {
        title: "Assign a Volunteer",
        description: "Click an empty slot to assign a volunteer to a shift.",
        targetId: 'assignment-slot', // This will need to be dynamic or first one
        position: 'top'
    },
    'assets-tab': {
        title: "Assets",
        description: "Track equipment like radios or tablets.",
        targetId: 'tab-assets',
        position: 'bottom'
    },
    'create-asset': {
        title: "Create Asset",
        description: "Add a new asset to your inventory.",
        targetId: 'add-asset-btn',
        position: 'bottom'
    },
    'admin-panel': {
        title: "Live Operations",
        description: "On the day of the event, use the Admin Panel (or Kiosk Mode) to manage check-ins.",
        targetId: 'admin-panel-link',
        position: 'bottom'
    },
    'check-in': {
        title: "Check-in Volunteer",
        description: "Mark a volunteer as arrived for their shift.",
        targetId: 'check-in-btn', // Needs to be specific
        position: 'right'
    },
    'asset-checkout': {
        title: "Asset Checkout",
        description: "Hand out equipment and log it here.",
        targetId: 'asset-checkout-btn',
        position: 'left'
    },
    'asset-return': {
        title: "Asset Return",
        description: "When they're done, mark the asset as returned.",
        targetId: 'asset-return-btn',
        position: 'left'
    },
    'check-out': {
        title: "Check-out Volunteer",
        description: "Clock them out to finish their shift.",
        targetId: 'check-out-btn',
        position: 'right'
    },
    'cleanup-dashboard': {
        title: "Back to Dashboard",
        description: "Let's clean up. Navigate back to your main events dashboard.",
        targetId: 'back-to-events-link',
        position: 'bottom'
    },
    'delete-event': {
        title: "Delete Event",
        description: "You can delete this tutorial event to keep your workspace tidy.",
        targetId: 'delete-event-btn',
        position: 'left'
    },
    'completion': {
        title: "You're a Pro!",
        description: "You've mastered the full workflow. You're ready to set up your real event now.",
        position: 'center'
    }
}

export function TutorialOverlay() {
    const { isActive, currentStepId, advanceStep, endTutorial } = useTutorial()
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        if (!isActive || !currentStepId) return

        const step = STEP_CONTENT[currentStepId]
        if (step.position === 'center') {
            setTimeout(() => setTargetRect(null), 0)
            return
        }

        const updateRect = (retries = 0) => {
            if (step.targetId) {
                const element = document.getElementById(step.targetId)
                if (element) {
                    setTargetRect(element.getBoundingClientRect())
                    // Scroll into view if needed
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                } else if (retries < 5) {
                    // If element not found, retry a few times as some components might still be mounting/loading
                    setTimeout(() => updateRect(retries + 1), 200)
                } else {
                    setTargetRect(null)
                }
            }
        }

        const handleUpdate = () => updateRect()

        updateRect()
        window.addEventListener('resize', handleUpdate)
        window.addEventListener('scroll', handleUpdate)

        // Small delay to allow UI to render
        const timeout = setTimeout(handleUpdate, 500)

        return () => {
            window.removeEventListener('resize', handleUpdate)
            window.removeEventListener('scroll', handleUpdate)
            clearTimeout(timeout)
        }
    }, [isActive, currentStepId])

    if (!isActive || !currentStepId) return null

    const content = STEP_CONTENT[currentStepId]

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Spotlight Overlay */}
            <div className="absolute inset-0 bg-black/50 transition-colors duration-500 clip-path-spotlight"
                style={{
                    clipPath: targetRect
                        ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
                        : undefined
                }}
            >
                {/* Fallback full dim if no target (center mode) */}
                {!targetRect && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />}
            </div>

            {/* Instruction Card */}
            {/* Instruction Card */}
            <div className="absolute w-full h-full flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        // Position logic based on targetRect
                        top: targetRect ? getCardPosition(targetRect, content.position).top : undefined,
                        left: targetRect ? getCardPosition(targetRect, content.position).left : undefined,
                        position: targetRect ? 'absolute' : 'relative'
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800 pointer-events-auto"
                >
                    <div className="space-y-4">
                        <div>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                                Tutorial
                            </span>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                                {content.title}
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm leading-relaxed">
                                {content.description}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={endTutorial}
                                className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                            >
                                Skip Tutorial
                            </button>
                            <button
                                onClick={advanceStep}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
                            >
                                {currentStepId === 'completion' ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

function getCardPosition(target: DOMRect, position: string | undefined): { top?: number, left?: number } {
    const gap = 20
    const cardWidth = 384 // max-w-sm roughly
    const cardHeight = 250 // slightly taller to be safe
    const padding = 20 // min distance from edge

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768

    // Helper to calculate coords for a given position
    const calculate = (pos: string) => {
        let t = 0
        let l = 0
        if (pos === 'bottom') {
            t = target.bottom + gap
            l = target.left + (target.width / 2) - (cardWidth / 2)
        } else if (pos === 'top') {
            t = target.top - cardHeight - gap
            l = target.left + (target.width / 2) - (cardWidth / 2)
        } else if (pos === 'right') {
            t = target.top
            l = target.right + gap
        } else if (pos === 'left') {
            t = target.top
            l = target.left - cardWidth - gap
        }
        return { t, l }
    }

    // 1. Try preferred position
    let finalPos = position || 'bottom'
    let { t: top, l: left } = calculate(finalPos)

    // 2. Check overlap/overflow logic to flip
    // If bottom overflow, try top
    if (finalPos === 'bottom' && (top + cardHeight > viewportHeight - padding)) {
        // Only flip if top has space
        if (target.top - cardHeight - gap > padding) {
            finalPos = 'top'
            const result = calculate(finalPos)
            top = result.t
            left = result.l
        }
    }
    // If top overflow (goes negative), try bottom
    else if (finalPos === 'top' && (top < padding)) {
        // Only flip if bottom has space
        if (target.bottom + cardHeight + gap < viewportHeight - padding) {
            finalPos = 'bottom'
            const result = calculate(finalPos)
            top = result.t
            left = result.l
        }
    }
    // If right overflow, try left
    else if (finalPos === 'right' && (left + cardWidth > viewportWidth - padding)) {
        if (target.left - cardWidth - gap > padding) {
            finalPos = 'left'
            const result = calculate(finalPos)
            top = result.t
            left = result.l
        }
    }
    // If left overflow, try right
    else if (finalPos === 'left' && (left < padding)) {
        if (target.right + cardWidth + gap < viewportWidth - padding) {
            finalPos = 'right'
            const result = calculate(finalPos)
            top = result.t
            left = result.l
        }
    }

    // 3. Final Clamping (Safety Net)
    // Even after flipping, ensure it doesn't go off screen
    if (left < padding) left = padding
    if (left + cardWidth > viewportWidth - padding) left = viewportWidth - cardWidth - padding

    if (top < padding) top = padding
    if (top + cardHeight > viewportHeight - padding) top = viewportHeight - cardHeight - padding

    return { top, left }
}
