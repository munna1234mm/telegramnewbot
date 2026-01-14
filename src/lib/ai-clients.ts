


interface GenerateTextProps {
    provider: 'openai' | 'gemini';
    apiKey: string;
    system: string;
    user: string;
    model?: string;
}

export async function generateText({ provider, apiKey, system, user, model }: GenerateTextProps): Promise<string> {
    try {
        if (provider === 'openai') {
            return await generateOpenAI(apiKey, system, user, model || 'gpt-4o');
        } else if (provider === 'gemini') {
            return await generateGemini(apiKey, system, user, model || 'gemini-1.5-flash');
        }
        throw new Error(`Unsupported provider: ${provider}`);
    } catch (error: any) {
        console.error('AI Generation Error:', error);
        return `Error: ${error.message || 'Failed to generate response'}`;
    }
}

async function generateOpenAI(apiKey: string, system: string, user: string, model: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user }
            ]
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API Error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || '';
}

async function generateGemini(apiKey: string, system: string, user: string, model: string): Promise<string> {
    // Note: Gemini SDK is cleaner, but requires "npm install @google/generative-ai"
    // For now, let's use the REST API via the SDK if available, or fetch if not.
    // Since we are adding "npm install" as a step, let's assume valid SDK usage.

    // However, to keep it simple and dependency-free for this file if SDK isn't installed yet:
    // We will use the direct REST API for Gemini to avoid install complexity unless requested.
    // Actually, the user asked for "Gemini", so using the official SDK is better if we can.
    // But since I cannot run `npm install` directly without checking package.json, 
    // I will use `fetch` for Gemini as well to be safe and dependency-free.

    // Google Gemini REST API
    // Docs: https://ai.google.dev/tutorials/rest_quickstart
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: user }] }],
            systemInstruction: { parts: [{ text: system }] } // System instruction support depends on model/API version
        })
    });

    // Fallback if systemInstruction fails (some models/versions behave differently)
    // We might need to prepend system prompt to user message if systemInstruction causes 400.

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API Error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
