import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatWithAI } from '../services/aiService';

// Mock do Google Generative AI
vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
            getGenerativeModel: vi.fn().mockImplementation(() => ({
                startChat: vi.fn().mockImplementation(() => ({
                    sendMessage: vi.fn().mockResolvedValue({
                        response: {
                            text: () => 'Mocked AI Response'
                        }
                    })
                }))
            }))
        }))
    };
});

describe('aiService', () => {
    const mockConfig = {
        provider: 'google' as const,
        apiKey: 'test-api-key',
        model: 'gemini-1.5-flash'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.skip('should call Gemini AI when provider is google', async () => {
        const response = await chatWithAI('Hello', [], mockConfig);
        expect(response).toBe('Mocked AI Response');
    });

    it.skip('should throw error if apiKey is missing', async () => {
        await expect(chatWithAI('Hello', [], { ...mockConfig, apiKey: '' }))
            .rejects.toThrow('API Key não configurada');
    });
});
