import { storage } from "./storage";
import { InsertTweet, InsertAiContent } from "@shared/schema";

interface RealTweet {
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

export class RealDataScraper {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  async scrapeRealData(searchTerms: string[], minReplies: number = 20): Promise<RealTweet[]> {
    const allTweets: RealTweet[] = [];

    for (const term of searchTerms) {
      console.log(`Collecting real data for: ${term}`);
      
      // Reddit cryptocurrency discussions with real engagement data
      const redditPosts = await this.scrapeRedditCrypto(term, minReplies);
      allTweets.push(...redditPosts);
      
      await this.delay(2000, 3000);
    }

    console.log(`Found ${allTweets.length} real posts with ${minReplies}+ replies`);
    return allTweets;
  }

  private async scrapeRedditCrypto(term: string, minReplies: number): Promise<RealTweet[]> {
    const tweets: RealTweet[] = [];
    
    // Major cryptocurrency subreddits
    const subreddits = [
      'CryptoCurrency',
      'Bitcoin', 
      'ethereum',
      'defi',
      'CryptoMarkets',
      'altcoin',
      'CryptoMoonShots'
    ];

    for (const subreddit of subreddits) {
      try {
        // Search for posts mentioning the term
        const searchUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(term)}&sort=hot&limit=50&t=week`;
        
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.data?.children) {
            for (const post of data.data.children) {
              const p = post.data;
              
              // Only include posts with high comment count (our "replies" metric)
              if (p.num_comments >= minReplies && p.ups > 10) {
                tweets.push({
                  id: `reddit_${p.id}`,
                  text: this.cleanText(p.title + (p.selftext ? ': ' + p.selftext : '')),
                  author: p.author,
                  username: p.author,
                  url: `https://reddit.com${p.permalink}`,
                  engagement: {
                    likes: p.ups,
                    retweets: Math.floor(p.ups * 0.05), // Estimate
                    replies: p.num_comments
                  },
                  timestamp: new Date(p.created_utc * 1000)
                });
              }
            }
          }
        }
        
        await this.delay(1000, 2000); // Rate limiting
      } catch (error) {
        console.error(`Error scraping r/${subreddit}:`, error);
      }
    }

    return tweets;
  }

  async generateFollowerReplies(tweets: RealTweet[]): Promise<void> {
    for (const tweet of tweets) {
      try {
        // Store the real tweet
        const tweetData: InsertTweet = {
          tweetId: tweet.id,
          text: tweet.text,
          author: tweet.author,
          username: tweet.username,
          replyCount: tweet.engagement.replies,
          likes: tweet.engagement.likes,
          retweets: tweet.engagement.retweets,
          engagementScore: String(tweet.engagement.likes + tweet.engagement.replies),
          mediaUrls: [],
          workflowId: 1
        };
        
        await storage.createTweet(tweetData);

        // Generate follower-focused reply using local algorithm
        const { followerFocusedReplies } = await import("./follower-focused-replies");
        const analysis = followerFocusedReplies.analyzeFollowerPotential({
          ...tweet,
          replyCount: tweet.engagement.replies
        });
        
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

          await storage.logActivity({
            type: "ai_reply_generated",
            message: `Generated follower-focused reply for real post with ${tweet.engagement.replies} comments`,
            status: "success",
            workflowId: 1
          });
        }

      } catch (error) {
        console.error(`Error processing tweet ${tweet.id}:`, error);
      }
    }
  }

  async executeRealWorkflow(searchTerms: string[], minReplies: number = 20): Promise<void> {
    console.log('Starting real data collection workflow...');
    
    // Get trending keywords for targeting
    const { trendingKeywordFinder } = await import("./trending-keywords");
    const trendingKeywords = await trendingKeywordFinder.getTopKeywordsForScraping(8);
    
    // Combine user terms with trending keywords
    const allTerms = Array.from(new Set([...searchTerms, ...trendingKeywords]));
    
    await storage.logActivity({
      type: "real_scraping_started",
      message: `Starting real data collection for: ${allTerms.join(', ')}`,
      status: "success",
      workflowId: 1
    });

    // Collect real data
    const realTweets = await this.scrapeRealData(allTerms, minReplies);
    
    if (realTweets.length > 0) {
      console.log(`Processing ${realTweets.length} real posts with ${minReplies}+ replies`);
      
      // Generate follower-attracting replies
      await this.generateFollowerReplies(realTweets);
      
      await storage.logActivity({
        type: "real_scraping_completed",
        message: `Processed ${realTweets.length} real posts, generated replies for high-engagement content`,
        status: "success",
        workflowId: 1
      });
    } else {
      console.log('No posts found meeting engagement criteria');
      
      await storage.logActivity({
        type: "real_scraping_completed",
        message: `No posts found with ${minReplies}+ replies for search terms`,
        status: "warning",
        workflowId: 1
      });
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\[removed\]/g, '')
      .replace(/\[deleted\]/g, '')
      .replace(/https?:\/\/[^\s]+/g, '[link]')
      .substring(0, 280)
      .trim();
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async delay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const realDataScraper = new RealDataScraper();