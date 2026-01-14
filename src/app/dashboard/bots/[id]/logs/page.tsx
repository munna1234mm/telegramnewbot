'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

export default function LogsPage({ params }: { params: Promise<{ id: string }> }) {
    const [logs, setLogs] = useState<any[]>([]);
    // Unwrap params properly in Next.js 15 client component if needed, 
    // but client components usually receive resolved params in props or need `useParams`
    // Let's safe bet use `useParams` or wait for unwrapping. 
    // For simplicity in this structure:
    const [botId, setBotId] = useState<string>('');

    useEffect(() => {
        params.then(p => {
            setBotId(p.id);
            fetch(`/api/bots/${p.id}/logs`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setLogs(data);
                });
        });
    }, [params]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Execution Logs</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <p className="text-slate-500 text-sm">No activity recorded yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50">
                                    {log.status === 'SUCCESS' ? (
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="font-semibold text-slate-900">{log.workflow?.name || 'Unknown Workflow'}</p>
                                            <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">Steps:</p>
                                        <ul className="list-disc list-inside text-xs text-slate-500 mt-1 space-y-1">
                                            {JSON.parse(log.steps || '[]').map((step: string, i: number) => (
                                                <li key={i}>{step}</li>
                                            ))}
                                        </ul>
                                        {log.error && (
                                            <div className="mt-2 p-2 bg-red-100 text-red-700 text-xs rounded">
                                                Error: {log.error}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
