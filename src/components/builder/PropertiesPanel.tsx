import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Zap, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertiesPanelProps {
    selectedNode: any;
    setNodes: React.Dispatch<React.SetStateAction<any[]>>;
    onClose: () => void;
    onDelete: () => void;
}

export function PropertiesPanel({ selectedNode, setNodes, onClose, onDelete }: PropertiesPanelProps) {
    const [label, setLabel] = useState(selectedNode.data.label || '');
    const [config, setConfig] = useState(selectedNode.data.config || {});
    const [buttons, setButtons] = useState<any[]>(selectedNode.data.config?.buttons || []);

    useEffect(() => {
        setLabel(selectedNode.data.label || '');
        setConfig(selectedNode.data.config || {});
        setButtons(selectedNode.data.config?.buttons || []);
    }, [selectedNode.id]);

    const updateNode = (newLabel: string, newConfig: any) => {
        setNodes((nds) =>
            nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newLabel, config: newConfig } } : n))
        );
    };

    const handleChange = (key: string, value: any) => {
        if (key === 'label') {
            setLabel(value);
            updateNode(value, config);
        } else {
            const newConfig = { ...config, [key]: value };
            setConfig(newConfig);
            updateNode(label, newConfig);
        }
    };

    // Button Logic
    const handleAddButton = () => {
        const newButtons = [...buttons, { text: 'Click Me', data: 'callback_id' }];
        setButtons(newButtons);
        handleChange('buttons', newButtons);
    };

    const handleButtonChange = (index: number, key: string, value: string) => {
        const newButtons = [...buttons];
        newButtons[index] = { ...newButtons[index], [key]: value };
        setButtons(newButtons);
        handleChange('buttons', newButtons);
    };

    const handleRemoveButton = (index: number) => {
        const newButtons = buttons.filter((_, i) => i !== index);
        setButtons(newButtons);
        handleChange('buttons', newButtons);
    };

    // Render Fields based on Node Type & Label context
    const renderContent = () => {
        if (selectedNode.type === 'trigger') {
            return (
                <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded border border-blue-100 flex gap-2 items-start">
                        <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-xs text-blue-800">
                            Configure how this workflow starts.
                        </div>
                    </div>

                    {(label.includes('Command') || label.includes('/')) && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Command String</label>
                            <input
                                className="w-full border rounded p-2 text-sm font-mono"
                                value={config.command || ''}
                                onChange={(e) => handleChange('command', e.target.value)}
                                placeholder="/start"
                            />
                        </div>
                    )}

                    {(label.includes('Message') || label.includes('Text')) && (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Match Type</label>
                                <select
                                    className="w-full border rounded p-2 text-sm"
                                    value={config.matchType || 'exact'}
                                    onChange={(e) => handleChange('matchType', e.target.value)}
                                >
                                    <option value="exact">Exact Match</option>
                                    <option value="contains">Contains Keyword</option>
                                    <option value="regex">Regex Pattern</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Pattern / Keyword</label>
                                <input
                                    className="w-full border rounded p-2 text-sm"
                                    value={config.pattern || ''}
                                    onChange={(e) => handleChange('pattern', e.target.value)}
                                    placeholder={config.matchType === 'regex' ? '^hello.*' : 'hello'}
                                />
                            </div>
                        </div>
                    )}

                    {(label.includes('Time') || label.includes('Schedule')) && (
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-500">Cron Schedule</label>
                            <div className="flex gap-2">
                                <input
                                    className="w-full border rounded p-2 text-sm font-mono"
                                    value={config.cron || '0 9 * * *'}
                                    onChange={(e) => handleChange('cron', e.target.value)}
                                />
                                <div className="p-2 bg-slate-100 rounded text-slate-500" title="Every day at 9am">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400">Format: Minute Hour Day Month Weekday</p>
                        </div>
                    )}
                </div>
            );
        }

        if (selectedNode.type === 'action') {
            return (
                <div className="space-y-4">
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-100 flex gap-2 items-start">
                        <MessageSquare className="w-4 h-4 text-emerald-600 mt-0.5" />
                        <div className="text-xs text-emerald-800">
                            Configure the bot response.
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Message Text</label>
                        <textarea
                            className="w-full border rounded p-2 h-32 text-sm resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={config.message || ''}
                            onChange={(e) => handleChange('message', e.target.value)}
                            placeholder="Hello! How can I help you?"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Markdown supported</span>
                            <span>{config.message?.length || 0} chars</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-semibold text-slate-500">Interactive Buttons</label>
                            <Button size="sm" variant="ghost" onClick={handleAddButton} className="h-6 w-6 p-0 hover:bg-emerald-100 text-emerald-600">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {buttons.length === 0 && (
                            <p className="text-xs text-slate-400 italic text-center py-2">No buttons added.</p>
                        )}

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {buttons.map((btn, i) => (
                                <div key={i} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs space-y-2 relative group">
                                    <button onClick={() => handleRemoveButton(i)} className="absolute top-1 right-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                    </button>
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded px-2 py-1"
                                        placeholder="Button Label"
                                        value={btn.text}
                                        onChange={(e) => handleButtonChange(i, 'text', e.target.value)}
                                    />
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[10px]"
                                        placeholder="callback_data or https://..."
                                        value={btn.data}
                                        onChange={(e) => handleButtonChange(i, 'data', e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedNode.type === 'condition') {
            return (
                <div className="space-y-4">
                    <div className="p-3 bg-amber-50 rounded border border-amber-100 flex gap-2 items-start">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div className="text-xs text-amber-800">
                            Split the workflow based on logic.
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Condition Type</label>
                        <select className="w-full border rounded p-2 text-sm">
                            <option>Keyword Match</option>
                            <option>User is Admin</option>
                            <option>Time Window</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Keywords (Comma sep)</label>
                        <input
                            className="w-full border rounded p-2 text-sm"
                            value={config.keywords || ''}
                            onChange={(e) => handleChange('keywords', e.target.value)}
                            placeholder="sale, price, help"
                        />
                    </div>
                </div>
            );
        }

        if (selectedNode.type === 'agent') {
            return (
                <div className="space-y-4">
                    <div className="p-3 bg-violet-50 rounded border border-violet-100 flex gap-2 items-start">
                        <Zap className="w-4 h-4 text-violet-600 mt-0.5" />
                        <div className="text-xs text-violet-800">
                            Configure AI Model and Prompts.
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Provider</label>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={config.provider || 'openai'}
                            onChange={(e) => handleChange('provider', e.target.value)}
                        >
                            <option value="openai">OpenAI (GPT-4o)</option>
                            <option value="gemini">Google Gemini</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">API Key</label>
                        <input
                            type="password"
                            className="w-full border rounded p-2 text-sm font-mono"
                            value={config.apiKey || ''}
                            onChange={(e) => handleChange('apiKey', e.target.value)}
                            placeholder="sk-..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">System Message</label>
                        <textarea
                            className="w-full border rounded p-2 h-24 text-sm resize-none focus:ring-2 focus:ring-violet-500 outline-none"
                            value={config.systemMessage || ''}
                            onChange={(e) => handleChange('systemMessage', e.target.value)}
                            placeholder="You are a helpful assistant..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500">User Message</label>
                        <textarea
                            className="w-full border rounded p-2 h-20 text-sm resize-none focus:ring-2 focus:ring-violet-500 outline-none"
                            value={config.userMessage || ''}
                            onChange={(e) => handleChange('userMessage', e.target.value)}
                            placeholder="{{last_message}}"
                        />
                        <p className="text-[10px] text-slate-400">Use {'{{variable}}'} to inject data.</p>
                    </div>
                </div>
            );
        }

        return <div className="text-slate-400 text-sm italic text-center pt-10">Select a configurable node</div>;
    };

    return (
        <div className="w-80 border-l border-slate-200 bg-white h-full flex flex-col shadow-2xl z-20">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 backdrop-blur">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Properties</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Label</label>
                    <input
                        type="text"
                        className="w-full border-b border-slate-300 py-1 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none bg-transparent"
                        value={label}
                        onChange={(e) => handleChange('label', e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Settings</label>
                    {renderContent()}
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">{selectedNode.id}</span>
                <button
                    onClick={onDelete}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition-all"
                >
                    <Trash2 className="w-3 h-3" /> Delete
                </button>
            </div>
        </div>
    );
}
