import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AIConfig } from "../types";
import { retryWithBackoff, logDetailedError, getErrorMessage } from "./retryService";
import { errorRecovery } from "./errorRecovery";

export interface ChatMessage {
    role: 'user' | 'assistant' | 'model' | 'system';
    content: string;
}

export interface AIResponse {
    text: string;
    modelName: string;
}

/**
 * Unified service to interact with multiple AI providers.
 * Supports Google Gemini SDK and OpenAI-compatible REST APIs.
 * Implements automatic retry logic with exponential backoff.
 *
 * @param messages - Array of chat messages (history + current)
 * @param config - AI configuration including provider and model settings
 * @param legacyToken - Optional fallback token for Gemini
 * @returns Promise with the AI response text and model used
 */
export const chatWithAI = async (
    messages: ChatMessage[],
    config: AIConfig,
    legacyToken?: string
): Promise<AIResponse> => {
    const provider = config?.provider || 'google';
    const apiKey = (config?.apiKey || legacyToken || '').trim();

    if (!apiKey && provider !== 'platform') {
        throw new Error("A.I. API Key missing. Please check your settings.");
    }

    try {
        if (provider === 'google') {
            return await handleGoogleGemini(messages, apiKey, config?.model);
        } else {
            return await handleOpenAICompatible(messages, config);
        }
    } catch (error: any) {
        const context = errorRecovery.captureContext(error, 'Chat with AI', {
            metadata: {
                provider,
                messageCount: messages.length,
                model: config?.model
            }
        });

        logDetailedError('AI Service Error', error, {
            provider,
            messageCount: messages.length
        });

        const userMessage = errorRecovery.getUserMessage(error, 'comunicar com IA');
        errorRecovery.logError(context, userMessage, 'high', false);

        throw new Error(userMessage);
    }
};

/**
 * Handle communication with Google Gemini Generative AI models.
 * Implements a fallback mechanism across several Gemini model versions.
 * Integrates automatic retry logic for transient failures.
 *
 * @param messages - Array of chat messages in standard format
 * @param apiKey - Google Gemini API Key
 * @param preferredModel - Optional model name to try first
 * @returns Promise with the AI response
 */
async function handleGoogleGemini(
    messages: ChatMessage[],
    apiKey: string,
    preferredModel?: string
): Promise<AIResponse> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = preferredModel ? [preferredModel] : [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-2.0-flash-exp",
        "gemini-1.5-pro"
    ];

    // Convert messages to Gemini format (excluding system prompt which should be handled as instructions or part of first message)
    // Note: Gemini startChat history uses { role: 'user'|'model', parts: [{ text: '...' }] }
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const history = chatMessages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const lastMessage = chatMessages[chatMessages.length - 1].content;
    const prompt = systemMessage ? `${systemMessage.content}\n\n${lastMessage}` : lastMessage;

    let lastError: any = null;

    for (const modelName of models) {
        try {
            // Wrap the Gemini call with retry logic
            const result = await retryWithBackoff(
                async () => {
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        safetySettings: [
                            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
                        ]
                    });
                    const chat = model.startChat({ history });
                    const response = await chat.sendMessage(prompt);
                    return response;
                },
                {
                    maxRetries: 2,
                    initialDelayMs: 500,
                    timeoutMs: 30000,
                    operationName: `Gemini ${modelName}`
                }
            );

            const response = await result.response;
            return { text: response.text(), modelName };
        } catch (err: any) {
            lastError = err;
            // Skip to next model on 404 (model not available) or non-retryable errors
            if (err.message?.includes('404') || !err.isRetryable) {
                console.warn(`[Gemini] Model ${modelName} not available or error not retryable, trying next...`, err.message);
                continue;
            }
            // If it's a retryable error, we've already retried, so just log and continue
            console.warn(`[Gemini] Model ${modelName} failed after retries, trying next...`, err.message);
            continue;
        }
    }

    throw lastError || new Error("No Google models available.");
}

/**
 * OpenAI-compatible API Implementation using standard fetch.
 * Standardizes messages for GPT-style endpoints.
 * Includes automatic retry logic with exponential backoff.
 *
 * @param messages - Array of chat messages
 * @param config - AI configuration with baseUrl, model, and apiKey
 * @returns Promise with the AI response
 */
async function handleOpenAICompatible(
    messages: ChatMessage[],
    config: AIConfig
): Promise<AIResponse> {
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    const model = config.model || 'gpt-4o-mini';
    const apiKey = config.apiKey || '';

    // Standardize roles for OpenAI
    const formattedMessages = messages.map(m => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : m.role,
        content: m.content
    }));

    const makeRequest = async () => {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: formattedMessages,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error: any = new Error(errorData.error?.message || `API Error: ${response.status}`);
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        return data;
    };

    // Retry the OpenAI API call
    const data = await retryWithBackoff(makeRequest, {
        maxRetries: 3,
        initialDelayMs: 1000,
        timeoutMs: 30000,
        operationName: `OpenAI ${model}`
    });

    return {
        text: data.choices[0].message.content,
        modelName: model
    };
}
