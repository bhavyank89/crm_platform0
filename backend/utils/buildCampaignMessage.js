import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function buildCampaignMessage({ segmentName, rulesDescription, customerName }) {
    if (!segmentName || !rulesDescription || !customerName) {
        throw new Error('segmentName, rulesDescription, and customerName are all required');
    }

    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is missing. Set it in your .env file');
    }

    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `You're an expert marketing assistant. Create a short, personalized campaign message based on the following inputs:
                        
Segment Name: "${segmentName}"
Rules (described in natural language): "${rulesDescription}"
Customer Name: "${customerName}"

Instructions:
1. Use the customer's name in the greeting.
2. Keep the message clear, concise, and tailored to the segment rules.
3. Output must be a raw JSON object with this structure:

{
  "title": "Campaign Title",
  "message": "Personalized message content",
  "goal": "Optional - describe the campaign's goal in one sentence"
}

Return only the JSON, no markdown or explanation.`
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
            console.error("❌ Gemini API error response:", errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error("No content returned from Gemini API");
        }

        const cleanedJson = generatedText
            .replace(/```json|```/g, '')
            .trim();

        try {
            const campaign = JSON.parse(cleanedJson);
            return campaign;
        } catch (err) {
            console.error("⚠️ Failed to parse Gemini response as JSON:\n", cleanedJson);
            throw new Error("Invalid JSON format from Gemini response");
        }

    } catch (error) {
        console.error("❌ Error in buildCampaignMessage:", error.message);
        throw error;
    }
}
