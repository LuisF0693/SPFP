import { GoogleGenerativeAI } from "@google/generative-ai";

// Fallback to Env if needed, but primary comes from UserProfile
const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const parseBankStatementWithAI = async (text: string, customApiKey?: string): Promise<any> => {
    const apiKey = (customApiKey || DEFAULT_API_KEY).trim();

    if (!apiKey) {
        throw new Error("Gemini API Key missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Model fallback list
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro"
    ];

    const prompt = `
    Analyze the following text extracted from a bank statement (PDF) or financial document.
    Extract the transactions into a JSON format.
    
    Return ONLY a JSON array of objects with the following keys:
    - date (YYYY-MM-DD format)
    - description (string, clean up unnecessary codes)
    - value (number, positive for income, negative for expense)
    - type (string, 'INCOME' or 'EXPENSE')
    - categoryId (suggest a category based on description, e.g., 'food', 'transport', 'utilities', 'shopping', 'uncategorized')

    If no transactions are found, return an empty array.
    Do not include markdown formatting like \`\`\`json. Just the raw JSON.

    Text to analyze:
    ${text.substring(0, 30000)} // Limit context if necessary
  `;


    let lastError: any = null;

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();

            // Clean up potential markdown formatting
            const cleanedJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedJson);
        } catch (error: any) {
            console.warn(`Failed with ${modelName}:`, error.message);
            lastError = error;
            // Continue to next model if it's a model-not-found or quota error
            if (error.message?.includes('404') || error.message?.includes('429')) continue;
            throw error; // If it's an auth error, stop
        }
    }

    throw lastError || new Error("Failed to parse transactions with AI.");
};
