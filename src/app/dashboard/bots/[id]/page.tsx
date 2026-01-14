'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Users, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BotManagePage() {
    const params = useParams();
    const router = useRouter();
    const [bot, setBot] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState<any>(null);

    useEffect(() => {
        // Fetch Bot Details (we might need a better API for this, but for now reuse getBots and find)
        // Or create a getBot API. Let's rely on the list for now or fetch list and find.
        fetch('/api/bots')
            .then(res => res.json())
            .then(data => {
                const found = data.find((b: any) => b.id === params.id);
                setBot(found);
            });
    }, [params.id]);

    const handleBroadcast = async () => {
        if (!message.trim()) return;
        setSending(true);
        setBroadcastResult(null);
        try {
            const res = await fetch(`/api/bots/${params.id}/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            setBroadcastResult(data);
            if (data.success) setMessage('');
        } catch (e) {
            alert('Error sending broadcast');
        } finally {
            setSending(false);
        }
    };

    if (!bot) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-slate-500 hover:text-slate-800">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{bot.name}</h1>
                    <p className="text-slate-500">@{bot.username}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Stats Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Bot Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="text-slate-500 text-sm">Subscribers</div>
                            <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {bot.subscribers?.length || 0}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="text-slate-500 text-sm">Workflows</div>
                            <div className="text-2xl font-bold text-slate-800">
                                {bot.workflows || 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Broadcast Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Send className="w-5 h-5 text-green-500" />
                        Send Broadcast
                    </h3>
                    <p className="text-sm text-slate-500">
                        Send a message to all {bot.subscribers?.length || 0} subscribers.
                    </p>

                    <textarea
                        className="w-full border border-slate-300 rounded-lg p-3 h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Type your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <div className="flex justify-between items-center">
                        <div className="text-sm">
                            {broadcastResult && (
                                <span className={broadcastResult.success ? 'text-green-600' : 'text-red-600'}>
                                    {broadcastResult.success
                                        ? `Sent to ${broadcastResult.sent} users!`
                                        : 'Failed to send.'}
                                </span>
                            )}
                        </div>
                        <Button onClick={handleBroadcast} disabled={sending || !message.trim()}>
                            {sending ? 'Sending...' : 'Send Message'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Link href={`/builder/${bot.id}`}>
                    <Button variant="outline">Open Workflow Builder</Button>
                </Link>
            </div>
        </div>
    );
}
