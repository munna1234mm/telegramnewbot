'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Users, Activity, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalBots: 0,
        totalSubscribers: 0,
        activeWorkflows: 0,
        totalExecutions: 0
    });

    useEffect(() => {
        fetch('/api/bots')
            .then(res => res.json())
            .then(bots => {
                if (Array.isArray(bots)) {
                    setStats({
                        totalBots: bots.length,
                        totalSubscribers: 0,
                        activeWorkflows: bots.reduce((acc: any, bot: any) => acc + (bot.workflows?.length || 0), 0),
                        totalExecutions: 0
                    });
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Bot} title="Total Bots" value={stats.totalBots.toString()} color="bg-blue-500" />
                <StatCard icon={Users} title="Subscribers" value={stats.totalSubscribers.toString()} color="bg-indigo-500" />
                <StatCard icon={Activity} title="Active Workflows" value={stats.activeWorkflows.toString()} color="bg-purple-500" />
                <StatCard icon={BarChart3} title="Total Executions" value={stats.totalExecutions.toString()} color="bg-emerald-500" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-500 text-center py-8">
                            No recent activity logs found.
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Database</span>
                                <span className="text-green-600 font-medium px-2 py-1 bg-green-50 rounded">Connected</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Telegram API</span>
                                <span className="text-green-600 font-medium px-2 py-1 bg-green-50 rounded">Operational</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Version</span>
                                <span className="text-slate-900 font-mono">v1.2.0 (Pro)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, title, value, color }: any) {
    return (
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                </div>
            </CardContent>
        </Card>
    );
}
