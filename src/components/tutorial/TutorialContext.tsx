'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

export type TutorialStepId =
    | 'welcome'
    | 'create-hub'
    | 'event-details'
    | 'open-event'
    | 'command-center'
    | 'manage-access'
    | 'volunteers-tab'
    | 'add-volunteer'
    | 'import-volunteers'
    | 'shifts-tab'
    | 'add-shift'
    | 'import-shifts'
    | 'assignments-tab'
    | 'assign-volunteer'
    | 'assets-tab'
    | 'create-asset'
    | 'admin-panel'
    | 'check-in'
    | 'asset-checkout'
    | 'asset-return'
    | 'check-out'
    | 'cleanup-dashboard'
    | 'delete-event'
    | 'completion'

interface TutorialState {
    isActive: boolean
    currentStepId: TutorialStepId | null
    tutorialEventId: string | null
    knownEventIds: string[]
    startTutorial: () => Promise<void>
    endTutorial: () => Promise<void>
    advanceStep: () => void
    goToStep: (stepId: TutorialStepId) => void
    setTutorialEventId: (id: string) => void
    setKnownEventIds: (ids: string[]) => void
}

const TutorialContext = createContext<TutorialState | undefined>(undefined)

export function TutorialProvider({ children }: { children: ReactNode }) {
    const [isActive, setIsActive] = useState(false)
    const [currentStepId, setCurrentStepId] = useState<TutorialStepId | null>(null)
    const [tutorialEventId, setTutorialEventId] = useState<string | null>(null)
    const [knownEventIds, setKnownEventIds] = useState<string[]>([])
    const pathname = usePathname()

    const startTutorial = async () => {
        setIsActive(true)
        setCurrentStepId('welcome')
        setTutorialEventId(null)
    }

    const checkTutorialStatus = async (userId?: string) => {
        const supabase = createClient()
        let id = userId
        if (!id) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) id = user.id
        }

        if (id) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('has_completed_tutorial')
                .eq('id', id)
                .single()

            // Auto-start if never completed
            if (profile && !profile.has_completed_tutorial) {
                // Determine if we should auto-start or if user has already manually closed it
                // For now, let's auto-start
                startTutorial()
            }
        }
    }

    const endTutorial = async () => {
        setIsActive(false)
        setCurrentStepId(null)
        setTutorialEventId(null)

        // Mark as completed in DB
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .update({ has_completed_tutorial: true })
                .eq('id', user.id)
        }
    }

    const advanceStep = () => {
        // Logic to determine next step based on current step
        // This is a simplified linear flow, but we can make it dynamic
        const steps: TutorialStepId[] = [
            'welcome', 'create-hub', 'event-details', 'open-event',
            'command-center', 'manage-access', 'volunteers-tab',
            'add-volunteer', 'import-volunteers', 'shifts-tab',
            'add-shift', 'import-shifts', 'assignments-tab',
            'assign-volunteer', 'assets-tab', 'create-asset',
            'admin-panel', 'check-in', 'asset-checkout',
            'asset-return', 'check-out', 'cleanup-dashboard',
            'delete-event', 'completion'
        ]

        const currentIndex = steps.indexOf(currentStepId as TutorialStepId)
        if (currentIndex < steps.length - 1) {
            setCurrentStepId(steps[currentIndex + 1])
        } else {
            endTutorial()
        }
    }

    const goToStep = (stepId: TutorialStepId) => {
        setCurrentStepId(stepId)
    }

    // Restore state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('tutorial_state')
        if (savedState) {
            const { isActive, currentStepId, tutorialEventId, knownEventIds } = JSON.parse(savedState)
            setIsActive(isActive)
            setCurrentStepId(currentStepId)
            setTutorialEventId(tutorialEventId)
            setKnownEventIds(knownEventIds || [])
        } else {
            // Check DB for completion status on initial load, but wait for auth
            const supabase = createClient()
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                    checkTutorialStatus(session.user.id)
                }
            })

            return () => {
                subscription.unsubscribe()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (isActive) {
            localStorage.setItem('tutorial_state', JSON.stringify({ isActive, currentStepId, tutorialEventId, knownEventIds }))
        } else {
            localStorage.removeItem('tutorial_state')
        }
    }, [isActive, currentStepId, tutorialEventId, knownEventIds])

    // Auto-advance logic for route changes
    useEffect(() => {
        if (!isActive) return

        // If we are on 'open-event' and have navigated to a specific event page
        if (currentStepId === 'open-event' && pathname.startsWith('/events/') && pathname.split('/').length === 3) {
            goToStep('command-center')
        }

        // Auto-advance to 'check-in' if we navigate to the admin panel
        if (currentStepId === 'admin-panel' && pathname.endsWith('/active')) {
            goToStep('check-in')
        }
    }, [pathname, currentStepId, isActive])

    return (
        <TutorialContext.Provider value={{
            isActive,
            currentStepId,
            tutorialEventId,
            startTutorial,
            endTutorial,
            advanceStep,
            goToStep,
            setTutorialEventId,
            knownEventIds,
            setKnownEventIds
        }}>
            {children}
        </TutorialContext.Provider>
    )
}

export function useTutorial() {
    const context = useContext(TutorialContext)
    if (context === undefined) {
        throw new Error('useTutorial must be used within a TutorialProvider')
    }
    return context
}
