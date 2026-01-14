'use client';

import Link from 'next/link';
import { Plus, Bot, MoreVertical, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BotCard } from '@/components/dashboard/BotCard';
import { useState, useEffect } from 'react';

export default function BotsListPage() {
    const [bots, setBots] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/bots')
            .then(res => res.json())
            .then(data => setBots(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Bots</h1>
                    <p className="text-slate-500 mt-1">View and manage all your connected Telegram bots.</p>
                </div>
                <Link href="/dashboard/bots/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> Connect New Bot
                    </Button>
                </Link>
            </div>

            {/* Bots Grid */}
            {bots.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bots.map((bot) => (
                        <BotCard key={bot.id} bot={bot} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No bots connected</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                        Connect your first Telegram bot to start automating.
                    </p>
                    <Link href="/dashboard/bots/new">
                        <Button>Connect Bot</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
