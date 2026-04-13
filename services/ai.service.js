import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const CLASSIFIER_PROMPT = `You are an expert helpdesk classifier. Your goal is to analyze emails and return a JSON object.

RULES:
1. PRIORITY: 
   - 'High': If the issue mentions system-wide outages, "500 errors", security breaches, or financial/payment failure.
   - 'Medium': For individual account issues (login, password reset) or functional bugs.
   - 'Low': For general questions, feedback, or feature requests.


EXAMPLES:
- "API is down, 500 errors for all users" -> { "priority": "High" }
- "I can't log in to my account" -> { "priority": "Medium"}

Only return valid JSON.`;

/**
 * Helpdesk Email Analyzer using OpenRouter
 * @param {string} subject
 * @param {string} emailBody 
 * @returns {Promise<{priority: string, category: string}>}
 */
export const analyzeEmail = async (subject, emailBody) => {
    try {
        const api_key = process.env.OPENROUTER_API_KEY;
        if (!api_key) {
            throw new Error("OPENROUTER_API_KEY is missing");
        }

        const fullText = `Subject: ${subject}\n\nBody: ${emailBody}`;

        // Using native fetch (available in Node.js 18+)
        const response = await fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${api_key}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://skillnest-fullstack.vercel.app",
                "X-Title": "Helpdesk Classifier"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: CLASSIFIER_PROMPT + "\n\nAlso return a 'category' field: Technical, Billing, General, or Urgent." },
                    { role: "user", content: `Analyze this email:\n${fullText}` }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = JSON.parse(content);

        return {
            priority: result.priority || "Medium",
            category: result.category || "General"
        };
    } catch (error) {
        console.error("AI Analysis Error:", error.message);
        return {
            priority: "Medium",
            category: "General"
        };
    }
};

