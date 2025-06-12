import { storage } from "./storage";

interface TrendingKeyword {
  keyword: string;
  volume: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  growth: number; // percentage change
  source: string;
}

export class TrendingKeywordFinder {
  
  async findTrendingCryptoKeywords(): Promise<TrendingKeyword[]> {
    const keywords: TrendingKeyword[] = [];
    
    try {
      // CoinGecko trending coins
      const trendingResponse = await fetch('https://api.coingecko.com/api/v3/search/trending');
      const trending = await trendingResponse.json();
      
      for (const coin of trending.coins) {
        keywords.push({
          keyword: coin.item.symbol.toLowerCase(),
          volume: coin.item.market_cap_rank || 999,
          sentiment: 'bullish',
          growth: Math.random() * 50 + 10, // Simulated growth
          source: 'coingecko_trending'
        });
        
        // Also add full name
        keywords.push({
          keyword: coin.item.name.toLowerCase(),
          volume: coin.item.market_cap_rank || 999,
          sentiment: 'bullish', 
          growth: Math.random() * 30 + 5,
          source: 'coingecko_trending'
        });
      }
      
      // Get top gaining coins for trending keywords
      const gainersResponse = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=percent_change_24h_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h');
      const gainers = await gainersResponse.json();
      
      for (const coin of gainers.slice(0, 10)) {
        if (coin.price_change_percentage_24h > 5) {
          keywords.push({
            keyword: coin.symbol.toLowerCase(),
            volume: 100 - (coin.market_cap_rank || 100),
            sentiment: 'bullish',
            growth: coin.price_change_percentage_24h,
            source: 'price_gainers'
          });
        }
      }
      
      // Add general crypto trending terms
      const cryptoTerms = [
        { keyword: 'btc', volume: 95, sentiment: 'bullish', growth: 15 },
        { keyword: 'eth', volume: 90, sentiment: 'bullish', growth: 12 },
        { keyword: 'defi', volume: 75, sentiment: 'bullish', growth: 8 },
        { keyword: 'altseason', volume: 65, sentiment: 'bullish', growth: 25 },
        { keyword: 'bullrun', volume: 70, sentiment: 'bullish', growth: 30 },
        { keyword: 'hodl', volume: 60, sentiment: 'bullish', growth: 5 },
        { keyword: 'diamondhands', volume: 55, sentiment: 'bullish', growth: 18 },
        { keyword: 'wagmi', volume: 45, sentiment: 'bullish', growth: 22 },
        { keyword: 'gm', volume: 40, sentiment: 'neutral', growth: 3 },
        { keyword: 'web3', volume: 80, sentiment: 'bullish', growth: 10 }
      ];
      
      for (const term of cryptoTerms) {
        keywords.push({
          keyword: term.keyword,
          volume: term.volume,
          sentiment: term.sentiment as 'bullish' | 'bearish' | 'neutral',
          growth: term.growth,
          source: 'crypto_culture'
        });
      }
      
      await storage.logActivity({
        type: "trending_keywords_found",
        message: `Found ${keywords.length} trending crypto keywords`,
        status: "success",
        workflowId: 1,
        metadata: { 
          keywordCount: keywords.length,
          sources: ['coingecko_trending', 'price_gainers', 'crypto_culture']
        }
      });
      
    } catch (error) {
      await storage.logActivity({
        type: "trending_keywords_error",
        message: `Failed to find trending keywords: ${(error as Error).message}`,
        status: "error",
        workflowId: 1
      });
    }
    
    // Sort by volume and growth
    return keywords
      .sort((a, b) => (b.volume + b.growth) - (a.volume + a.growth))
      .slice(0, 15); // Top 15 trending keywords
  }
  
  async getTopKeywordsForScraping(limit: number = 10): Promise<string[]> {
    const trendingKeywords = await this.findTrendingCryptoKeywords();
    
    // Filter for highest volume and bullish sentiment
    const topKeywords = trendingKeywords
      .filter(k => k.sentiment === 'bullish' && k.volume > 30)
      .slice(0, limit)
      .map(k => k.keyword);
    
    await storage.logActivity({
      type: "scraping_keywords_selected", 
      message: `Selected ${topKeywords.length} keywords for trending scraping`,
      status: "info",
      workflowId: 1,
      metadata: { keywords: topKeywords }
    });
    
    return topKeywords;
  }
  
  async getKeywordAnalysis(): Promise<{
    bullish: TrendingKeyword[];
    bearish: TrendingKeyword[];
    highGrowth: TrendingKeyword[];
    topVolume: TrendingKeyword[];
  }> {
    const keywords = await this.findTrendingCryptoKeywords();
    
    return {
      bullish: keywords.filter(k => k.sentiment === 'bullish').slice(0, 10),
      bearish: keywords.filter(k => k.sentiment === 'bearish').slice(0, 5),
      highGrowth: keywords.filter(k => k.growth > 20).slice(0, 8),
      topVolume: keywords.filter(k => k.volume > 70).slice(0, 8)
    };
  }
}

export const trendingKeywordFinder = new TrendingKeywordFinder();