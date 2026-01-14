import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Zap, MessageSquare, Split, Clock, Users, Command, Image as ImageIcon, Globe, Shield } from 'lucide-react';

const NodeWrapper = ({ children, gradient, icon: Icon, title, selected }: any) => (
    <div className={`shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden min-w-[240px] border ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-100'} bg-white`}>
        {/* Header */}
        <div className={`px-4 py-3 flex items-center gap-2 ${gradient} text-white`}>
            {Icon && <Icon className="w-4 h-4 opacity-90" />}
            <span className="font-bold text-xs uppercase tracking-wider">{title}</span>
        </div>
        {/* Body */}
        <div className="p-4 bg-white/95 backdrop-blur-sm">
            {children}
        </div>
    </div>
);

export const TriggerNode = memo(({ data, selected }: any) => {
    // Dynamic Icon based on label/config
    let Icon = Zap;
    if (data.label.includes('Time') || data.label.includes('Schedule')) Icon = Clock;
    else if (data.label.includes('User') || data.label.includes('Member')) Icon = Users;
    else if (data.label.includes('Command')) Icon = Command;
    else if (data.label.includes('Web')) Icon = Globe;

    return (
        <div className="relative group">
            <NodeWrapper
                gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
                title="Trigger"
                icon={Icon}
                selected={selected}
            >
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-800 text-sm">{data.label}</span>
                    {data.config?.command && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <code className="text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-600 font-mono">
                                {data.config.command}
                            </code>
                        </div>
                    )}
                    {data.config?.cron && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {data.config.cron}
                        </div>
                    )}
                </div>
            </NodeWrapper>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !border-2 !border-white !bg-blue-500 shadow-sm" />
        </div>
    );
});

export const ActionNode = memo(({ data, selected }: any) => {
    let Icon = MessageSquare;
    if (data.label.includes('Image') || data.label.includes('Media')) Icon = ImageIcon;

    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !border-2 !border-white !bg-slate-400" />
            <NodeWrapper
                gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
                title="Action"
                icon={Icon}
                selected={selected}
            >
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{data.label}</span>
                    {data.config?.message && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic line-clamp-2">
                            "{data.config.message}"
                        </div>
                    )}
                    {/* Visual Buttons Preview */}
                    {data.config?.buttons?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-1">
                            {data.config.buttons.map((b: any, i: number) => (
                                <span key={i} className="text-[10px] items-center flex bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-medium">
                                    {b.text}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </NodeWrapper>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !border-2 !border-white !bg-emerald-500 shadow-sm" />
        </div>
    );
});

export const ConditionNode = memo(({ data, selected }: any) => {
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !border-2 !border-white !bg-slate-400" />
            <div className={`shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden min-w-[200px] border ${selected ? 'border-amber-400 ring-2 ring-amber-100' : 'border-amber-100'} bg-white`}>
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <Split className="w-4 h-4 opacity-90" />
                        <span className="font-bold text-xs uppercase tracking-wider">Condition</span>
                    </div>
                </div>
                <div className="p-4 text-center bg-white/95">
                    <p className="font-medium text-slate-800 text-sm mb-3">{data.label}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold px-2">
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">TRUE</span>
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">FALSE</span>
                    </div>
                </div>
            </div>

            {/* True Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                style={{ left: '25%' }}
                className="!w-3 !h-3 !border-2 !border-white !bg-emerald-500 shadow-sm"
            />

            {/* False Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                style={{ left: '75%' }}
                className="!w-3 !h-3 !border-2 !border-white !bg-rose-500 shadow-sm"
            />
        </div>
    );
});

export const AgentNode = memo(({ data, selected }: any) => {
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !border-2 !border-white !bg-slate-400" />
            <NodeWrapper
                gradient="bg-gradient-to-r from-violet-600 to-purple-600"
                title="AI Agent"
                icon={Users} // Using Users for now, or we can add Bot to imports
                selected={selected}
            >
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{data.label}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="uppercase font-bold text-violet-600">{data.config?.provider || 'AI'}</span>
                        <span>{data.config?.model || 'Default'}</span>
                    </div>
                </div>
            </NodeWrapper>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !border-2 !border-white !bg-violet-500 shadow-sm" />
        </div>
    );
});
