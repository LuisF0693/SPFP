import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize the API client
const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const parseBankStatementWithAI = async (text: string): Promise<any> => {
    if (!API_KEY) {
        throw new Error("Gemini API Key not found. Please set VITE_GEMINI_API_KEY in .env.local");
    }

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

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean up potential markdown formatting
        const cleanedJson = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();

        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Error parsing with Gemini:", error);
        throw new Error("Failed to parse transactions with AI.");
    }
};
