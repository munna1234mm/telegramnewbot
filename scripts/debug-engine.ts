import { WorkflowEngine } from '../src/lib/workflow-engine';

// Mock context matching the user's scenario
const mockContext = {
    bot: { id: 'test-bot', token: 'fake-token' },
    userText: '/start',
    chatId: 123456,
    userName: 'TestUser',
    isCallback: false
};

// Mock Workflow Definition from the screenshot
// Trigger -> Action
const mockWorkflow = {
    id: 'test-workflow',
    definitionJSON: JSON.stringify({
        nodes: [
            {
                id: '1',
                type: 'trigger',
                data: {
                    label: 'Command Trigger',
                    config: { command: '/start' }
                }
            },
            {
                id: '2',
                type: 'action',
                data: {
                    label: 'Send Message',
                    config: { message: 'ok' }
                }
            }
        ],
        edges: [
            { source: '1', target: '2', id: 'e1-2' }
        ]
    })
};

async function runDebug() {
    console.log('--- Starting Debug Run ---');
    console.log('Input:', mockContext.userText);

    // Instantiate Engine
    // We mock the client to prevent actual API calls
    const engine = new WorkflowEngine('fake-token', mockWorkflow);

    // Override client.sendMessage to just log
    (engine as any).client = {
        sendMessage: async (chatId: number, text: string) => {
            console.log(`[MockTelegram] Sending to ${chatId}: ${text}`);
            return true;
        }
    };

    const result = await engine.run(mockContext);
    console.log('--- Execution Result ---');
    console.log(JSON.stringify(result, null, 2));
}

runDebug();
