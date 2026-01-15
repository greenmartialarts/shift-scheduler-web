import { createClient } from '@/lib/supabase/server'
import TemplateManager from './template-manager'
// import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TemplatesPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // const { data: event } = await supabase
    //     .from('events')
    //     .select('name')
    //     .eq('id', id)
    //     .single()

    const { data: templates } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

    return (
        <div className="p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Shift Templates</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                        Configure reusable blueprints for rapid shift scheduling
                    </p>
                </div>

                <TemplateManager templates={templates || []} />
            </div>
        </div>
    )
}
