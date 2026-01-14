import Link from 'next/link';
import { Bot, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-10 hidden md:flex top-0 left-0">
                <div className="p-6">
                    <div className="flex items-center gap-2 text-white font-bold text-xl">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">T</div>
                        Telegram Builder
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavLink href="/dashboard" icon={<LayoutDashboard />}>Dashboard</NavLink>
                    <NavLink href="/dashboard/bots" icon={<Bot />}>My Bots</NavLink>
                    <NavLink href="/dashboard/settings" icon={<Settings />}>Settings</NavLink>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            U
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">User Name</p>
                            <p className="text-xs text-slate-400 truncate">user@example.com</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
        >
            <span className="w-5 h-5">{icon}</span>
            {children}
        </Link>
    )
}
