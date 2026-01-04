
export interface MarketData {
    symbol: string;
    longName: string;
    regularMarketPrice: number;
    logourl?: string;
}

export const MarketDataService = {
    async getQuotes(tickers: string[], token: string): Promise<MarketData[]> {
        if (!tickers.length) return [];

        // Remove duplicates and empty
        const uniqueTickers = [...new Set(tickers.filter(t => t))];
        const tickerString = uniqueTickers.join(',');

        // Construct URL
        // If token is empty, we try without it (some endpoints might work freely or fail)
        // Brapi supports comma separated list
        let url = `https://brapi.dev/api/quote/${tickerString}`;
        if (token) {
            url += `?token=${token}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                // If 401/403, and no token was provided, throw specific error
                if ((response.status === 401 || response.status === 403) && !token) {
                    throw new Error('Token de API necessário para esta requisição.');
                }
                throw new Error('Falha ao buscar cotações');
            }

            const data = await response.json();
            // Brapi structure: { results: [ ... ] }
            if (data && data.results) {
                return data.results.map((r: any) => ({
                    symbol: r.symbol,
                    longName: r.longName,
                    regularMarketPrice: r.regularMarketPrice,
                    logourl: r.logourl
                }));
            }
            return [];
        } catch (error) {
            console.error('MarketDataService Error:', error);
            throw error;
        }
    }
};
