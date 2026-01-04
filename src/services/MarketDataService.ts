
export interface MarketData {
    symbol: string;
    longName: string;
    regularMarketPrice: number;
    logourl?: string;
}

export const MarketDataService = {
    /**
     * Fetch quotes from Yahoo Finance via a CORS proxy.
     * Yahoo Finance symbols for Brazil usually end with .SA (e.g., PETR4.SA)
     */
    async getQuotes(tickers: string[]): Promise<MarketData[]> {
        if (!tickers.length) return [];

        // Normalize tickers: ensuring they have .SA if they look like Brazilian stocks/FIIs
        // Usually 4 letters + 1 or 2 numbers (e.g., PETR4, MXRF11)
        const normalizedTickers = tickers.map(t => {
            const up = t.trim().toUpperCase();
            if (up.length >= 5 && !up.includes('.')) {
                return `${up}.SA`;
            }
            return up;
        });

        const uniqueTickers = [...new Set(normalizedTickers.filter(t => t))];
        const tickerString = uniqueTickers.join(',');

        // Using a public CORS proxy to access Yahoo API from the client
        // Note: For a real production app, you should have your own proxy backend.
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickerString}`;
        // Try direct first, then proxy if it fails (using a common proxy for web apps)
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Falha ao buscar cotações no Yahoo Finance');

            const content = await response.json();
            const data = JSON.parse(content.contents);

            if (data && data.quoteResponse && data.quoteResponse.result) {
                return data.quoteResponse.result.map((r: any) => ({
                    symbol: r.symbol.replace('.SA', ''),
                    longName: r.longName || r.shortName || r.symbol,
                    regularMarketPrice: r.regularMarketPrice,
                    logourl: `https://s.yimg.com/wm/geoblock/hq/${r.symbol.replace('.SA', '')}.png` // Simulated logo URL
                }));
            }
            return [];
        } catch (error) {
            console.error('MarketDataService (Yahoo) Error:', error);
            throw error;
        }
    }
};
