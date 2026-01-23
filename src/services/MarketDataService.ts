
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

                const response = await fetch(finalUrl);
                if (!response.ok) continue;

                const rawData = await response.json();
                const data = isAllOrigins ? JSON.parse(rawData.contents) : rawData;

                if (data?.quoteResponse?.result) {
                    return data.quoteResponse.result.map((r: any) => ({
                        symbol: r.symbol.replace('.SA', ''),
                        longName: r.longName || r.shortName || r.symbol,
                        regularMarketPrice: r.regularMarketPrice,
                        logourl: `https://s.yimg.com/wm/geoblock/hq/${r.symbol.replace('.SA', '')}.png`
                    }));
                }
            } catch (error) {
                console.warn(`Proxy ${proxyBase} failed, trying next...`, error);
                continue;
            }
        }

        console.error('All MarketDataService proxies failed.');
        return [];
    }
};
