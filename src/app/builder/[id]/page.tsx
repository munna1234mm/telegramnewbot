'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    Connection,
    Edge,
    Node,
    useNodesState,
    useEdgesState,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Play, Bot, Zap, Command, Clock, Users, Split, MessageSquare, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { TestPanel } from '@/components/builder/TestPanel';
import { TriggerNode, ActionNode, ConditionNode } from '@/components/builder/CustomNodes';

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    condition: ConditionNode,
};

const initialNodes: Node[] = [
    { id: '1', position: { x: 400, y: 50 }, data: { label: '/start', config: { command: '/start' } }, type: 'trigger' },
];

let id = 100;
const getId = () => `${id++}`;

export default function BuilderPage() {
    const params = useParams();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [showTestPanel, setShowTestPanel] = useState(false);

    // Fetch workflow data on mount
    useEffect(() => {
        if (params.id) {
            fetch(`/api/workflows?id=${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.nodes) {
                        setNodes(data.nodes);
                        setEdges(data.edges || []);
                    }
                })
                .catch(err => console.error("Failed to load workflow", err));
        }
    }, [params.id, setNodes, setEdges]);

    // Allow Delete with Backspace/Delete keys
    const deleteKeyCode = ['Backspace', 'Delete'];

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const typeStr = event.dataTransfer.getData('application/reactflow');
            if (typeof typeStr === 'undefined' || !typeStr) return;

            const [nodeType, nodeLabel] = typeStr.split('::');

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type: nodeType,
                position,
                data: { label: nodeLabel || 'New Node', config: {} },
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode); // Auto select new node
        },
        [reactFlowInstance, setNodes]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setShowTestPanel(false); // Close test if editing
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    // Clean up selection if node deletes via keyboard
    const onNodesDelete = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const saveWorkflow = async () => {
        try {
            await fetch('/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: params.id,
                    botId: params.id, // Add this so getBotWorkflows extraction works
                    nodes,
                    edges,
                    enabled: true // Auto enable on save for now
                })
            });
            alert('Workflow Saved!');
        } catch (e) {
            alert('Failed to save');
        }
    };

    const publishWorkflow = async () => {
        // For now, publish is same as save + specific flag if needed
        await saveWorkflow();
        alert('Workflow Published & Live!');
    };

    return (
        <div className="h-screen flex flex-col font-sans">
            <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-slate-900">Workflow Builder</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowTestPanel(!showTestPanel)}>
                        <Bot className="w-4 h-4 mr-2" /> Test
                    </Button>
                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    <Button variant="outline" size="sm" onClick={saveWorkflow}>
                        <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={publishWorkflow}>
                        <Play className="w-4 h-4 mr-2" /> Publish
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-white/50 backdrop-blur-xl border-r border-slate-200 flex flex-col z-20 shadow-sm">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Workflow Components</h2>
                        <p className="text-xs text-slate-400 mt-1">Drag blocks to the canvas</p>
                    </div>

                    <div className="p-4 space-y-6 overflow-y-auto flex-1">
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Triggers</div>
                            <div className="space-y-2">
                                <DraggableItem type="trigger" label="New Message" icon={<Zap className="w-3 h-3" />} color="bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300" />
                                <DraggableItem type="trigger" label="Command" icon={<Command className="w-3 h-3" />} color="bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300" />
                                <DraggableItem type="trigger" label="Time / Schedule" icon={<Clock className="w-3 h-3" />} color="bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300" />
                                <DraggableItem type="trigger" label="User Actions" icon={<Users className="w-3 h-3" />} color="bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300" />
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Logic</div>
                            <div className="space-y-2">
                                <DraggableItem type="condition" label="Condition / Split" icon={<Split className="w-3 h-3" />} color="bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300" />
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Actions</div>
                            <div className="space-y-2">
                                <DraggableItem type="action" label="Send Message" icon={<MessageSquare className="w-3 h-3" />} color="bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300" />
                                <DraggableItem type="action" label="Send Image/Media" icon={<ImageIcon className="w-3 h-3" />} color="bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300" />
                                <DraggableItem type="action" label="Reply To User" icon={<MessageSquare className="w-3 h-3" />} color="bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 h-full bg-slate-100 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        onNodesDelete={onNodesDelete}
                        deleteKeyCode={deleteKeyCode}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>

                {/* Right Panels (Test or Properties) */}
                {showTestPanel && (
                    <TestPanel nodes={nodes} edges={edges} onClose={() => setShowTestPanel(false)} />
                )}

                {selectedNode && !showTestPanel && (
                    <PropertiesPanel
                        selectedNode={selectedNode}
                        setNodes={setNodes}
                        onClose={() => setSelectedNode(null)}
                        onDelete={() => {
                            setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
                            setSelectedNode(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function DraggableItem({ type, label, color, icon }: { type: string, label: string, color: string, icon?: React.ReactNode }) {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', `${nodeType}::${label}`);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing text-sm font-medium flex items-center gap-3 shadow-sm hover:shadow transition-all ${color}`}
        >
            {icon ? (
                <div className="p-1.5 bg-white/60 rounded-md shadow-sm">{icon}</div>
            ) : null}
            <span>{label}</span>
        </div>
    );
}
