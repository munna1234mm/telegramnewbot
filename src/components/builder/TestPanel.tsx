import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TestPanel({ nodes, edges, onClose }: { nodes: any[], edges: any[], onClose: () => void }) {
    const [messages, setMessages] = useState<any[]>([
        { id: 1, type: 'bot', text: 'Test Mode Started. Send a message to trigger your workflow.' }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const simulateWorkflow = async (userMsg: string) => {
        setIsProcessing(true);

        // 1. Find Entry Triggers
        const triggers = nodes.filter(n => n.type === 'trigger');
        let activeNode: any = null;

        // Simple Matching Logic
        for (const trigger of triggers) {
            const config = trigger.data.config || {};
            const label = trigger.data.label || '';

            // Command Match
            if (label.includes('Command') || config.command) {
                if (userMsg.trim().toLowerCase() === (config.command || '/start').toLowerCase()) {
                    activeNode = trigger;
                    break;
                }
            }
            // Keyword Match (if trigger was keyword based, but here we usually have trigger -> condition)
            else if (label.includes('New Message')) {
                activeNode = trigger; // Generic trigger always fires
                break;
            }
        }

        if (!activeNode) {
            setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: 'No matching trigger found.' }]);
            setIsProcessing(false);
            return;
        }

        // 2. Traverse Graph
        let currentNode = activeNode;
        const steps = [];
        let safetyCounter = 0;

        while (currentNode && safetyCounter < 20) {
            steps.push(currentNode.id);
            safetyCounter++;

            // Find outgoing edge
            const edge = edges.find(e => e.source === currentNode.id);
            if (!edge) break;

            const nextNode = nodes.find(n => n.id === edge.target);
            if (!nextNode) break;

            // Execute Node Logic
            currentNode = nextNode;

            // If Condition Node
            if (currentNode.type === 'condition') {
                const config = currentNode.data.config || {};
                // Mock check: e.g. Keywords
                if (currentNode.data.label.includes('Keyword')) {
                    const keywords = (config.keywords || '').split(',').map((k: string) => k.trim().toLowerCase());
                    const match = keywords.some((k: string) => userMsg.toLowerCase().includes(k));

                    // If match, follow 'true' handle, else 'false' (Not fully implemented in this simple simulator, just linear for now)
                    if (!match) {
                        // Stop if condition fails (simplification)
                        break;
                    }
                }
            }

            // If Action Node
            if (currentNode.type === 'action') {
                const config = currentNode.data.config || {};
                await new Promise(r => setTimeout(r, 600)); // Fake delay

                if (currentNode.data.label.includes('Send') || currentNode.data.label.includes('Reply')) {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        type: 'bot',
                        text: config.message || '[Config Missing: Set Message Text]'
                    }]);
                } else if (currentNode.data.label.includes('Delete')) {
                    setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: 'Bot deleted the user message' }]);
                }
            }
        }

        setIsProcessing(false);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userMsg }]);
        setInput('');

        simulateWorkflow(userMsg);
    };

    return (
        <div className="w-96 border-l border-slate-200 bg-white h-full flex flex-col shadow-2xl z-30 absolute right-0 top-0">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Bot className="w-5 h-5 text-blue-600" /> Test Simulator
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100" ref={scrollRef}>
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.type === 'system' ? (
                            <div className="text-xs text-slate-400 text-center w-full italic my-1">{msg.text}</div>
                        ) : (
                            <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.type === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                }`}>
                                {msg.text}
                            </div>
                        )}
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-lg rounded-bl-none p-3 shadow-sm">
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message (/start)..."
                    />
                    <Button type="submit" size="sm" disabled={isProcessing}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
