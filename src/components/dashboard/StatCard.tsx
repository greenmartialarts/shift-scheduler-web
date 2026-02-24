import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className = '' }: StatCardProps) {
    return (
        <div className={`rounded-lg bg-white p-6 shadow dark:bg-gray-800 ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                {Icon && (
                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span
                        className={
                            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }
                    >
                        {trend.value}%
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">from last week</span>
                </div>
            )}
        </div>
    );
}
