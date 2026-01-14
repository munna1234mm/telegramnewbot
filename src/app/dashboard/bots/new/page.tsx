'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewBotPage() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate API verification
        setTimeout(async () => { // Added async here for the fetch call inside
            if (token.length < 10) {
                setError('Invalid token format.');
                setIsLoading(false);
                return;
            }

            // Real API call
            try {
                const res = await fetch('/api/bots', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, name: 'My New Bot', username: '@new_bot' })
                });
                if (res.ok) {
                    router.push('/dashboard/bots');
                } else {
                    setError('Failed to connect bot');
                }
            } catch (e) {
                setError('Network error');
            } finally {
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="mb-8">
                <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">Connect a new Bot</h1>
                <p className="text-slate-500 mt-2">Enter your Telegram Bot API Token to get started.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleConnect} className="space-y-6">
                    <div>
                        <label htmlFor="token" className="block text-sm font-medium text-slate-700 mb-2">Bot API Token</label>
                        <input
                            id="token"
                            type="text"
                            placeholder="123456789:ABCdefGhIJKlmNoPQRstUvWxYZ"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                        />
                        <p className="text-sm text-slate-500 mt-2">
                            You can get this token from <a href="https://t.me/BotFather" target="_blank" className="text-blue-600 hover:underline">@BotFather</a> on Telegram.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                                </>
                            ) : (
                                <>Connect Bot</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-8">
                <h3 className="font-semibold text-slate-900 mb-4">How to get a token?</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-600 text-sm bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <li>Open Telegram and search for <strong>@BotFather</strong>.</li>
                    <li>Send the command <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">/newbot</code>.</li>
                    <li>Follow the instructions to name your bot and give it a username.</li>
                    <li>Copy the <strong>HTTP API Token</strong> provided by BotFather.</li>
                    <li>Paste into the field above and click Connect.</li>
                </ol>
            </div>
        </div>
    );
}
