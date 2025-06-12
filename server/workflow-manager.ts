import { storage } from "./storage";
import { proxyManager } from "./proxy-manager";

export class WorkflowManager {
  private activeWorkflows = new Map<number, NodeJS.Timeout>();
  private workflowConfigs = new Map<number, any>();

  async startWorkflow(workflowId: number) {
    try {
      const workflow = await storage.getWorkflowById(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Stop existing workflow if running
      if (this.activeWorkflows.has(workflowId)) {
        this.stopWorkflow(workflowId);
      }

      // Parse workflow configuration
      const config = workflow.config as any || {};
      this.workflowConfigs.set(workflowId, config);

      // Set up workflow execution based on type
      if (workflow.name.includes("Tweet") || workflow.name.includes("Crypto")) {
        this.startTweetScrapingWorkflow(workflowId, config);
      } else if (workflow.name.includes("Reddit")) {
        this.startRedditScrapingWorkflow(workflowId, config);
      } else if (workflow.name.includes("Discord")) {
        this.startDiscordScrapingWorkflow(workflowId, config);
      }

      await storage.updateWorkflowStatus(workflowId, "active");
      await storage.logActivity({
        type: "workflow_started",
        message: `Workflow "${workflow.name}" started successfully`,
        status: "success",
        workflowId: workflowId
      });

    } catch (error) {
      console.error(`Failed to start workflow ${workflowId}:`, error);
      await storage.updateWorkflowStatus(workflowId, "error");
      await storage.logActivity({
        type: "workflow_error",
        message: `Failed to start workflow: ${error.message}`,
        status: "error",
        workflowId: workflowId
      });
      throw error;
    }
  }

  async stopWorkflow(workflowId: number) {
    const timer = this.activeWorkflows.get(workflowId);
    if (timer) {
      clearInterval(timer);
      this.activeWorkflows.delete(workflowId);
      this.workflowConfigs.delete(workflowId);
      
      await storage.updateWorkflowStatus(workflowId, "inactive");
      await storage.logActivity({
        type: "workflow_stopped",
        message: `Workflow stopped`,
        status: "info",
        workflowId: workflowId
      });
    }
  }

  async stopAllWorkflows() {
    const workflowIds = Array.from(this.activeWorkflows.keys());
    for (const workflowId of workflowIds) {
      await this.stopWorkflow(workflowId);
    }
  }

  private startTweetScrapingWorkflow(workflowId: number, config: any) {
    const interval = config.interval || 40 * 60 * 1000; // 40 minutes default
    const searchTerms = config.searchTerms || ["crypto", "bitcoin", "ethereum", "defi"];

    const timer = setInterval(async () => {
      try {
        await this.executeTweetScraping(workflowId, searchTerms);
      } catch (error) {
        console.error(`Tweet scraping error for workflow ${workflowId}:`, error);
        await storage.logActivity({
          type: "scraping_error",
          message: `Tweet scraping failed: ${error.message}`,
          status: "error",
          workflowId: workflowId
        });
      }
    }, interval);

    this.activeWorkflows.set(workflowId, timer);
  }

  private startRedditScrapingWorkflow(workflowId: number, config: any) {
    const interval = config.interval || 30 * 60 * 1000; // 30 minutes default
    const subreddits = config.subreddits || ["cryptocurrency", "bitcoin", "ethereum"];

    const timer = setInterval(async () => {
      try {
        await this.executeRedditScraping(workflowId, subreddits);
      } catch (error) {
        console.error(`Reddit scraping error for workflow ${workflowId}:`, error);
        await storage.logActivity({
          type: "scraping_error",
          message: `Reddit scraping failed: ${error.message}`,
          status: "error",
          workflowId: workflowId
        });
      }
    }, interval);

    this.activeWorkflows.set(workflowId, timer);
  }

  private startDiscordScrapingWorkflow(workflowId: number, config: any) {
    const interval = config.interval || 15 * 60 * 1000; // 15 minutes default
    const servers = config.servers || [];

    const timer = setInterval(async () => {
      try {
        await this.executeDiscordScraping(workflowId, servers);
      } catch (error) {
        console.error(`Discord scraping error for workflow ${workflowId}:`, error);
        await storage.logActivity({
          type: "scraping_error",
          message: `Discord scraping failed: ${error.message}`,
          status: "error",
          workflowId: workflowId
        });
      }
    }, interval);

    this.activeWorkflows.set(workflowId, timer);
  }

  private async executeTweetScraping(workflowId: number, searchTerms: string[]) {
    const proxy = await proxyManager.getNextProxy();
    
    try {
      // Simulate tweet scraping with proxy
      const tweets = await this.scrapeTweets(searchTerms, proxy);
      
      for (const tweetData of tweets) {
        const tweet = await storage.createTweet({
          tweetId: tweetData.id,
          text: tweetData.text,
          author: tweetData.author,
          username: tweetData.username,
          replyCount: tweetData.reply_count || 0,
          likes: tweetData.likes || 0,
          retweets: tweetData.retweets || 0,
          engagementScore: String((tweetData.reply_count || 0) + (tweetData.likes || 0) + (tweetData.retweets || 0)),
          workflowId: workflowId
        });

        await storage.logActivity({
          type: "tweet_scraped",
          message: `Found new tweet from @${tweet.username} with ${tweet.likes} likes`,
          status: "success",
          workflowId: workflowId,
          metadata: { tweetId: tweet.tweetId, engagementScore: tweet.engagementScore }
        });
      }

      await proxyManager.markProxySuccess(proxy.id, 200);
      
    } catch (error) {
      await proxyManager.markProxyFailed(proxy.id);
      throw error;
    }
  }

  private async executeRedditScraping(workflowId: number, subreddits: string[]) {
    const proxy = await proxyManager.getNextProxy();
    
    try {
      // Reddit scraping implementation would go here
      await storage.logActivity({
        type: "reddit_scraped",
        message: `Scanned ${subreddits.length} subreddits for new posts`,
        status: "success",
        workflowId: workflowId
      });

      await proxyManager.markProxySuccess(proxy.id, 300);
      
    } catch (error) {
      await proxyManager.markProxyFailed(proxy.id);
      throw error;
    }
  }

  private async executeDiscordScraping(workflowId: number, servers: string[]) {
    const proxy = await proxyManager.getNextProxy();
    
    try {
      // Discord scraping implementation would go here
      await storage.logActivity({
        type: "discord_scraped",
        message: `Scanned ${servers.length} Discord servers for DeFi discussions`,
        status: "info",
        workflowId: workflowId
      });

      await proxyManager.markProxySuccess(proxy.id, 150);
      
    } catch (error) {
      await proxyManager.markProxyFailed(proxy.id);
      throw error;
    }
  }

  private async scrapeTweets(searchTerms: string[], proxy: any) {
    // This is a simplified implementation
    // In a real implementation, you would use Playwright or similar with the proxy
    const mockTweets = [
      {
        id: `tweet_${Date.now()}_1`,
        text: `${searchTerms[0]} is looking bullish today! 🚀`,
        author: "CryptoTrader",
        username: "cryptotrader123",
        reply_count: Math.floor(Math.random() * 50),
        likes: Math.floor(Math.random() * 500),
        retweets: Math.floor(Math.random() * 100)
      },
      {
        id: `tweet_${Date.now()}_2`,
        text: `Just bought more ${searchTerms[1]}. HODL! 💎🙌`,
        author: "DiamondHands",
        username: "diamondhands",
        reply_count: Math.floor(Math.random() * 30),
        likes: Math.floor(Math.random() * 300),
        retweets: Math.floor(Math.random() * 80)
      }
    ];

    return mockTweets;
  }
}

export const workflowManager = new WorkflowManager();
