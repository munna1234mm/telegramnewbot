import { TelegramClient } from './telegram';
import { prisma } from './prisma';

interface ExecutionContext {
    bot: any;
    userText: string;
    chatId: number;
    userName?: string;
    isCallback?: boolean;
}

interface ExecutionResult {
    status: 'SUCCESS' | 'FAILED' | 'NO_MATCH';
    steps: string[];
    error?: string;
    workflowId?: string;
}

export class WorkflowEngine {
    private client: TelegramClient;
    private workflow: any;
    private logSteps: string[] = [];

    constructor(token: string, workflow: any) {
        this.client = new TelegramClient(token);
        this.workflow = workflow;
    }

    // Main entry point to process a workflow
    async run(context: ExecutionContext): Promise<ExecutionResult> {
        this.logSteps = []; // Reset steps

        // Safety check for workflow definition
        if (!this.workflow.definitionJSON) {
            return { status: 'FAILED', steps: ['No definition found'], error: 'Empty workflow definition' };
        }

        let nodes, edges;
        try {
            const definition = JSON.parse(this.workflow.definitionJSON);
            nodes = definition.nodes || [];
            edges = definition.edges || [];
        } catch (e) {
            return { status: 'FAILED', steps: ['Error parsing definition'], error: 'Invalid JSON' };
        }

        // 1. Find Matching Triggers
        const triggers = nodes.filter((n: any) => n.type === 'trigger');
        let activeTrigger = null;

        for (const trigger of triggers) {
            const label = trigger.data.label || '';
            const config = trigger.data.config || {};

            // Command Match
            if (label.includes('Command') || config.command) {
                const cmd = config.command || '/start';
                if (context.userText.trim().toLowerCase() === cmd.toLowerCase()) {
                    activeTrigger = trigger;
                    break;
                }
            }
            // Keyword / Message Match
            else if (label.includes('Message')) {
                if (context.isCallback) continue;

                const matchType = config.matchType || 'exact';
                const pattern = (config.pattern || '').toLowerCase();
                const text = context.userText.toLowerCase();

                if (matchType === 'exact' && text === pattern) activeTrigger = trigger;
                else if (matchType === 'contains' && text.includes(pattern)) activeTrigger = trigger;
                else if (matchType === 'regex') {
                    try {
                        if (new RegExp(config.pattern, 'i').test(context.userText)) activeTrigger = trigger;
                    } catch (e) { }
                }
                else if (!config.pattern) activeTrigger = trigger;

                if (activeTrigger) break;
            }
        }

        if (!activeTrigger) return { status: 'NO_MATCH', steps: [] };

        this.logSteps.push(`Triggered by: ${activeTrigger.data.label || 'Unknown Trigger'}`);

        // 2. Traverse and Execute
        try {
            await this.traverse(activeTrigger, nodes, edges, context);
            return { status: 'SUCCESS', steps: this.logSteps, workflowId: this.workflow.id };
        } catch (e: any) {
            console.error('Workflow Exec Error:', e);
            this.logSteps.push(`Error: ${e.message}`);
            return { status: 'FAILED', steps: this.logSteps, error: e.message, workflowId: this.workflow.id };
        }
    }

    private async traverse(currentNode: any, nodes: any[], edges: any[], context: ExecutionContext) {
        let node = currentNode;
        let safety = 0;

        while (node && safety < 50) {
            safety++;
            this.logSteps.push(`Step ${safety}: ${node.data.label} (${node.type})`);

            // Find next node
            const outgoingEdges = edges.filter((e: any) => e.source === node.id);
            if (outgoingEdges.length === 0) break;

            let nextNode = null;

            if (node.type === 'condition') {
                const result = this.evaluateCondition(node, context);
                this.logSteps.push(`Condition result: ${result}`);
                const handleId = result ? 'true' : 'false';
                const correctEdge = outgoingEdges.find((e: any) => e.sourceHandle === handleId);
                if (correctEdge) {
                    nextNode = nodes.find((n: any) => n.id === correctEdge.target);
                }
            } else {
                const edge = outgoingEdges[0];
                nextNode = nodes.find((n: any) => n.id === edge.target);
            }

            if (!nextNode) break;

            // Execute Actions
            if (nextNode.type === 'action') {
                await this.executeAction(nextNode, context);
            }

            node = nextNode;
        }
    }

    private evaluateCondition(node: any, context: ExecutionContext): boolean {
        const config = node.data.config || {};
        const label = node.data.label || '';

        if (label.includes('Keyword')) {
            const keywords = (config.keywords || '').split(',').map((k: string) => k.trim().toLowerCase());
            return keywords.some((k: string) => context.userText.toLowerCase().includes(k));
        }
        return false;
    }

    private async executeAction(node: any, context: ExecutionContext) {
        const config = node.data.config || {};
        const label = node.data.label || '';

        if (label.includes('Send') || label.includes('Reply')) {
            const options: any = {};
            if (config.buttons && config.buttons.length > 0) {
                const inline_keyboard = config.buttons.map((btn: any) => {
                    const isUrl = btn.data?.startsWith('http') || btn.data?.startsWith('t.me');
                    if (isUrl) return [{ text: btn.text, url: btn.data }];
                    return [{ text: btn.text, callback_data: btn.data }];
                });
                options.reply_markup = { inline_keyboard };
            }
            await this.client.sendMessage(context.chatId, config.message || 'No message configured', options);
        }
    }
}
