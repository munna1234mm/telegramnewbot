


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
            // Google Gemini REST API
            // Using gemini-pro as it's the stable model.
            // Prepending system message because detailed systemInstruction support can be flaky in REST.
            const effectiveModel = model.includes('gemini') ? model : 'gemini-pro';

            // NOTE: 'gemini-pro' does NOT support systemInstruction via REST in some versions,
            // so we merge system + user to be safe.
            const combinedPrompt = `${system}\n\nUser Message:\n${user}`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${apiKey}`;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: combinedPrompt }] }]
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Gemini API Error: ${res.statusText}`);
            }

            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
