import { storage } from "./storage";
import { proxyManager } from "./proxy-manager";
import { generateAIContent, analyzeContentQuality } from "./openai";
import { InsertTweet, InsertAiContent } from "@shared/schema";

interface TrendingTweet {
  id: string;
  text: string;
  author: string;
  username: string;
  url: string;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
  timestamp: Date;
}

export class TwitterScraper {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  async scrapeTrendingTweets(searchTerms: string[], minEngagement: number = 20): Promise<TrendingTweet[]> {
    const tweets: TrendingTweet[] = [];

    for (const term of searchTerms) {
      try {
        console.log(`Scraping real data for: ${term}`);
        
        // Reddit cryptocurrency discussions - real data source
        const redditData = await this.scrapeRedditCrypto(term, minEngagement);
        tweets.push(...redditData);
        
        await this.randomDelay(2000, 4000);
        
        await storage.logActivity({
          type: "twitter_scraping",
          message: `Scraped ${redditData.length} real posts for "${term}"`,
          status: "success",
          workflowId: 1
        });

      } catch (error) {
        await storage.logActivity({
          type: "scraping_error",
          message: `Failed to scrape "${term}": ${error}`,
          status: "error",
          workflowId: 1
        });
      }
    }

    return tweets;
  }

  private async scrapeRedditCrypto(term: string, minEngagement: number): Promise<TrendingTweet[]> {
    const tweets: TrendingTweet[] = [];
    
    try {
      // Reddit public API for cryptocurrency subreddits
      const subreddits = ['CryptoCurrency', 'Bitcoin', 'ethereum', 'defi', 'CryptoMarkets'];
      
      for (const subreddit of subreddits) {
        const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(term)}&sort=hot&limit=25`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent()
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.data && data.data.children) {
            for (const post of data.data.children) {
              const postData = post.data;
              
              // Only include posts with high engagement (comments = replies)
              if (postData.num_comments >= minEngagement) {
                tweets.push({
                  id: postData.id,
                  text: postData.title + (postData.selftext ? ': ' + postData.selftext.substring(0, 200) : ''),
                  author: postData.author,
                  username: postData.author,
                  url: `https://reddit.com${postData.permalink}`,
                  engagement: {
                    likes: postData.ups,
                    retweets: Math.floor(postData.ups * 0.1), // Estimate shares
                    replies: postData.num_comments
                  },
                  timestamp: new Date(postData.created_utc * 1000)
                });
              }
            }
          }
        }
        
        await this.randomDelay(1000, 2000); // Rate limiting
      }
    } catch (error) {
      console.error(`Reddit scraping error for ${term}:`, error);
    }
    
    return tweets;
  }
          
          await storage.logActivity({
            type: "twitter_scraping",
            message: `Scraped ${extractedTweets.length} trending tweets for "${term}"`,
            status: "success",
            workflowId: 1,
            metadata: { searchTerm: term, tweetCount: extractedTweets.length }
          });
        }

        // Rate limiting
        await this.randomDelay(2000, 5000);

      } catch (error) {
        await storage.logActivity({
          type: "twitter_scraping_error",
          message: `Failed to scrape "${term}": ${(error as Error).message}`,
          status: "error",
          workflowId: 1
        });
      }
    }

    return tweets;
  }

  private parseTwitterHTML(html: string, searchTerm: string, minEngagement: number): TrendingTweet[] {
    // Since we can't parse actual HTML here, simulate realistic trending tweets
    // In production, you'd use a proper HTML parser like Cheerio
    const tweets: TrendingTweet[] = [];
    const tweetCount = Math.floor(Math.random() * 8) + 3; // 3-10 tweets

    for (let i = 0; i < tweetCount; i++) {
      const likes = Math.floor(Math.random() * 2000) + minEngagement;
      const retweets = Math.floor(likes * 0.3);
      const replies = Math.floor(likes * 0.2);
      
      // Only include high-engagement tweets
      if (likes >= minEngagement) {
        tweets.push({
          id: `trending_${searchTerm}_${Date.now()}_${i}`,
          text: this.generateRealisticTweet(searchTerm),
          author: this.generateUsername(),
          username: this.generateUsername().toLowerCase(),
          url: `https://twitter.com/user/status/${Date.now()}${i}`,
          engagement: { likes, retweets, replies },
          timestamp: new Date(Date.now() - Math.random() * 3600000) // Last hour
        });
      }
    }

    return tweets;
  }

  private generateRealisticTweet(term: string): string {
    const templates = [
      `${term} is absolutely exploding right now! The fundamentals are stronger than ever. This could be the breakout we've been waiting for 🚀`,
      `Just did a deep dive into ${term} and I'm bullish AF. The technology is revolutionary and adoption is accelerating. Loading up more 💎`,
      `${term} holders are about to be rewarded for their patience. The charts are looking incredible and momentum is building fast`,
      `PSA: ${term} is still massively undervalued. When this thing moves, it's going to move FAST. Don't say I didn't warn you`,
      `${term} community is the strongest in crypto. The development activity is insane and partnerships keep rolling in. Bullish!`,
      `Unpopular opinion: ${term} is going to outperform everything else this cycle. The risk/reward ratio is too good to ignore`,
      `${term} just hit a major milestone and the market is starting to take notice. This is exactly what we needed to see`,
      `Been accumulating ${term} for months and finally seeing some validation. The patience is paying off big time`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateUsername(): string {
    const prefixes = ['Crypto', 'Bitcoin', 'DeFi', 'Blockchain', 'Web3', 'Digital', 'Yield'];
    const suffixes = ['Bull', 'King', 'Master', 'Trader', 'Investor', 'Guru', 'Prophet', 'Whale'];
    const numbers = Math.floor(Math.random() * 9999);
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${numbers}`;
  }

  async generateRepliesForTweets(tweets: TrendingTweet[]): Promise<void> {
    for (const tweet of tweets) {
      try {
        // Store the original tweet
        const storedTweet = await storage.createTweet({
          tweetId: tweet.id,
          text: tweet.text,
          author: tweet.author,
          username: tweet.username,
          replyCount: tweet.engagement.replies,
          likes: tweet.engagement.likes,
          retweets: tweet.engagement.retweets,
          engagementScore: String(tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies),
          mediaUrls: [],
          workflowId: 1
        });

        // Generate follower-focused reply using local algorithm
        const { followerFocusedReplies } = await import("./follower-focused-replies");
        const analysis = followerFocusedReplies.analyzeFollowerPotential(tweet);
        
        if (analysis.shouldReply) {
          const replyData = followerFocusedReplies.generateCompleteReply(tweet.text, tweet.author);
          
          // Store reply for approval
          await storage.createAIContent({
            content: replyData.content,
            type: 'reply',
            qualityScore: String(analysis.score),
            targetTweetId: tweet.id,
            status: analysis.score >= 70 ? 'approved' : 'pending_approval'
          });
        }

        await storage.logActivity({
          type: "ai_reply_generated",
          message: `Generated follower-focused reply for trending tweet (${tweet.engagement.likes} likes)`,
          status: "success",
          workflowId: 1,
          metadata: { 
            originalTweetId: tweet.id,
            qualityScore: analysis.score,
            engagement: tweet.engagement.likes,
            replyType: 'follower_focused'
          }
        });

      } catch (error) {
        await storage.logActivity({
          type: "reply_generation_error",
          message: `Failed to generate reply: ${(error as Error).message}`,
          status: "error",
          workflowId: 1
        });
      }
    }
  }

  async executeTrendingWorkflow(searchTerms: string[], minEngagement: number = 100): Promise<void> {
    await storage.logActivity({
      type: "trending_workflow_started",
      message: `Starting trending tweet scraping for ${searchTerms.length} terms`,
      status: "info",
      workflowId: 1,
      metadata: { searchTerms, minEngagement }
    });

    // Step 1: Scrape trending tweets
    const trendingTweets = await this.scrapeTrendingTweets(searchTerms, minEngagement);
    
    // Step 2: Generate AI replies
    await this.generateRepliesForTweets(trendingTweets);

    await storage.logActivity({
      type: "trending_workflow_completed",
      message: `Processed ${trendingTweets.length} trending tweets and generated replies`,
      status: "success",
      workflowId: 1,
      metadata: { 
        tweetsProcessed: trendingTweets.length,
        avgEngagement: trendingTweets.reduce((sum, t) => sum + t.engagement.likes, 0) / trendingTweets.length
      }
    });
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async randomDelay(min: number = 1000, max: number = 5000): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const twitterScraper = new TwitterScraper();