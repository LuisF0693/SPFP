import { retryWithBackoff, logDetailedError, getErrorMessage } from './retryService';

export interface MarketData {
    symbol: string;
    longName: string;
    regularMarketPrice: number;
    logourl?: string;
}

const CORS_PROXIES = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?'
];

export const MarketDataService = {
    /**
     * Fetch quotes from Yahoo Finance via a CORS proxy.
     * Handles Brazilian stocks, FIIs, US stocks, and Crypto.
     * Implements automatic retry logic for each proxy attempt.
     */
    async getQuotes(tickers: string[]): Promise<MarketData[]> {
        if (!tickers.length) return [];

        // Normalize tickers
        const normalizedTickers = tickers.map(t => {
            const up = t.trim().toUpperCase();
            // Crypto usually handled as BTC-USD, ETH-BRL etc.
            if (up.includes('-') || up.includes('=X')) return up;
            // Brazilian stocks/FIIs: mostly 5-6 chars without dot
            if (up.length >= 5 && !up.includes('.') && /^[A-Z]{4}\d/.test(up)) {
                return `${up}.SA`;
            }
            return up;
        });

        const uniqueTickers = [...new Set(normalizedTickers.filter(t => t))];
        const tickerString = uniqueTickers.join(',');
        const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickerString}`;

        // Attempt fetching with proxy fallbacks
        for (const proxyBase of CORS_PROXIES) {
            try {
                const isAllOrigins = proxyBase.includes('allorigins');
                const finalUrl = isAllOrigins
                    ? `${proxyBase}${encodeURIComponent(targetUrl)}`
                    : `${proxyBase}${encodeURIComponent(targetUrl)}`;

                // Wrap with retry logic
                const result = await retryWithBackoff(
                    async () => {
                        const response = await fetch(finalUrl);
                        if (!response.ok) {
                            const error: any = new Error(`HTTP ${response.status}`);
                            error.status = response.status;
                            throw error;
                        }
                        return response.json();
                    },
                    {
                        maxRetries: 2,
                        initialDelayMs: 800,
                        timeoutMs: 10000,
                        operationName: `Market Data from ${proxyBase}`
                    }
                );

                const data = isAllOrigins ? JSON.parse(result.contents) : result;

                if (data?.quoteResponse?.result) {
                    console.log(`[Market Data] Successfully fetched ${data.quoteResponse.result.length} quotes from ${proxyBase}`);
                    return data.quoteResponse.result.map((r: any) => ({
                        symbol: r.symbol.replace('.SA', ''),
                        longName: r.longName || r.shortName || r.symbol,
                        regularMarketPrice: r.regularMarketPrice,
                        logourl: `https://s.yimg.com/wm/geoblock/hq/${r.symbol.replace('.SA', '')}.png`
                    }));
                }
            } catch (error: any) {
                logDetailedError(
                    `Market Data Service - Proxy ${proxyBase}`,
                    error,
                    { tickers: uniqueTickers.length, proxyBase }
                );
                console.warn(`Proxy ${proxyBase} failed, trying next...`, error.message);
                continue;
            }
        }

        console.error('[Market Data] All proxies failed after retries.');
        return [];
    }
};
