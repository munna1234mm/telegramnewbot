'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, MoreVertical, Trash2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function BotCard({ bot }: { bot: any }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this bot? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/bots/${bot.id}`, { method: 'DELETE' });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete bot');
                setIsDeleting(false);
            }
        } catch (e) {
            console.error(e);
            setIsDeleting(false);
        }
    };

    if (isDeleting) return null; // Optimistic hide

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">{bot.name}</h3>
                        <p className="text-xs text-slate-400">{bot.username}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${bot.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {bot.status}
                    </span>
                    <Link href={`/dashboard/bots/${bot.id}/logs`} className="text-slate-400 hover:text-blue-600 p-1" title="View Logs">
                        <Activity className="w-5 h-5" />
                    </Link>
                    <button onClick={handleDelete} className="text-slate-400 hover:text-red-600 p-1" title="Delete Bot">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-50 mb-4">
                <div>
                    <p className="text-xs text-slate-400 uppercase">Workflows</p>
                    <p className="font-medium text-slate-700">{bot.workflows?.length || 0}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase">Last Run</p>
                    <p className="font-medium text-slate-700">{bot.lastRun ? new Date(bot.lastRun).toLocaleDateString() : 'Never'}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 text-slate-600">Settings</Button>
                <Link href={`/builder/${bot.id}`} className="flex-1">
                    <Button variant="primary" className="w-full bg-slate-900 hover:bg-slate-800 text-white">Edit Flows</Button>
                </Link>
            </div>
        </div>
    );
}
