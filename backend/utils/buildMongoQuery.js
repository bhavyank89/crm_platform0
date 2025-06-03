import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function buildMongoQuery(prompt) {
    if (!prompt) {
        throw new Error('Prompt is required to generate query');
    }

    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined. Please check your .env file and ensure it contains GEMINI_API_KEY=YOUR_API_KEY_HERE');
    }

    let finalPrompt = prompt;
    const lastXDaysMatch = prompt.match(/last (\d+) days/i);
    if (lastXDaysMatch) {
        const days = parseInt(lastXDaysMatch[1], 10);
        const dateXDaysAgo = new Date();
        dateXDaysAgo.setDate(dateXDaysAgo.getDate() - days);
        const requiredDateISO = dateXDaysAgo.toISOString();
        finalPrompt = prompt.replace(lastXDaysMatch[0], `after "${requiredDateISO}"`);
    }

    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `Convert the following natural language description into a valid MongoDB query object using **only the following fields** from the Customer schema:

                        - name (string)
                        - email (string)
                        - phone (string)
                        - joinedAt (ISO 8601 date string)
                        - totalSpend (number)
                        - visitCount (number)
                        - lastActive (ISO 8601 date string)

                        Ensure:
                        1. All dates are ISO 8601 formatted strings.
                        2. The output is raw, valid JSON (no shell syntax, no markdown, no \`\`\`).
                        3. Return only the JSON object, nothing else.

                        Natural language: "${finalPrompt}"`

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
        const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedContent) {
            throw new Error('Gemini API did not return expected content in candidates[0].content.parts[0].text.');
        }

        // Clean the output: remove markdown and replace ISODate("...") with just the string
        const cleanedJsonString = generatedContent
            .replace(/```json|```/g, '')
            .replace(/ISODate\("([^"]+)"\)/g, '"$1"') // <- fix invalid ISODate
            .trim();

        try {
            const mongoQuery = JSON.parse(cleanedJsonString);
            return mongoQuery;
        } catch (jsonParseError) {
            console.error("⚠️ JSON.parse failed. Cleaned content was:\n", cleanedJsonString);
            throw new Error(`Failed to parse MongoDB query from Gemini response. Invalid JSON format. Error: ${jsonParseError.message}`);
        }

    } catch (error) {
        console.error("❌ Error in buildMongoQuery:", error.message);
        throw error;
    }
}
