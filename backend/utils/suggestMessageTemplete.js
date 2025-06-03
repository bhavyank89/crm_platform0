import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function suggestMessageTemplete({ title, segment }) {
    if (!title) {
        throw new Error('Campaign title is required to generate message template.');
    }

    if (!segment) {
        throw new Error('Segment description is required to generate message template.');
    }

    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined. Please check your .env file and ensure it contains GEMINI_API_KEY=YOUR_API_KEY_HERE');
    }

    const prompt = `
You are a marketing assistant AI. Given a campaign title and a customer segment description, generate a short and engaging message template for a campaign. 
Use a tone that suits promotional content, and feel free to include personalization tokens like {{name}} or {{totalSpend}}.

- Campaign Title: "${title}"
- Target Segment: "${segment}"

Output format:
Just return the message template (no markdown, no extra info). Keep it friendly, actionable, and 1-2 sentences long.
`;

    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Gemini API raw error response:", errorText);
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const generatedMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!generatedMessage) {
            throw new Error('Gemini API did not return expected message template in candidates[0].content.parts[0].text.');
        }

        return generatedMessage;

    } catch (error) {
        console.error("❌ Error in suggestMessageTemplete:", error.message);
        throw error;
    }
}
