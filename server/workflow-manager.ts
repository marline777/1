import { storage } from "./storage";
import { proxyManager } from "./proxy-manager";
import { modernScraper, ScrapingTarget } from "./scraping/modern-scraper";
import { trendingKeywordFinder } from "./trending-keywords";
import { twitterPostFinder } from "./twitter-post-finder";

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
      if (workflow.name.includes("Crypto") || workflow.name.includes("Reddit")) {
        this.startCompleteWorkflow(workflowId, config);
      } else if (workflow.name.includes("Tweet") || workflow.name.includes("Twitter")) {
        this.startScrapingWorkflow(workflowId, config, "twitter");
      } else if (workflow.name.includes("Discord")) {
        this.startScrapingWorkflow(workflowId, config, "discord");
      } else {
        // Default to complete Reddit → Twitter workflow
        this.startCompleteWorkflow(workflowId, config);
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
        message: `Failed to start workflow: ${(error as Error).message}`,
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

  private startScrapingWorkflow(workflowId: number, config: any, platform: "twitter" | "reddit" | "discord") {
    const interval = config.interval || 40 * 60 * 1000; // 40 minutes default
    const searchTerms = config.searchTerms || ["crypto", "bitcoin", "ethereum", "defi", "HODL", "to the moon", "DeFi", "NFT"];

    const timer = setInterval(async () => {
      try {
        const target: ScrapingTarget = {
          platform,
          searchTerms,
          filters: {
            minEngagement: config.minEngagement || 5,
            language: config.language || "en"
          }
        };

        const scrapedContent = await modernScraper.scrapeContent(target, workflowId);
        
        await storage.logActivity({
          type: "scraping_success",
          message: `Successfully scraped ${scrapedContent.length} items from ${platform}`,
          status: "success",
          workflowId: workflowId,
          metadata: { 
            count: scrapedContent.length, 
            platform,
            searchTerms: searchTerms.slice(0, 3) // Log first 3 terms
          }
        });

      } catch (error) {
        console.error(`${platform} scraping error for workflow ${workflowId}:`, error);
        await storage.logActivity({
          type: "scraping_error",
          message: `${platform} scraping failed: ${(error as Error).message}`,
          status: "error",
          workflowId: workflowId
        });
      }
    }, interval);

    this.activeWorkflows.set(workflowId, timer);
  }

  private startCompleteWorkflow(workflowId: number, config: any) {
    const interval = config.interval || 30 * 60 * 1000; // 30 minutes default

    const timer = setInterval(async () => {
      try {
        // Step 1: Get trending crypto keywords from Reddit/CoinGecko
        const trendingKeywords = await trendingKeywordFinder.getTopKeywordsForScraping(5);
        
        if (trendingKeywords.length > 0) {
          await storage.logActivity({
            type: "trending_keywords_found",
            message: `Found ${trendingKeywords.length} trending crypto keywords`,
            status: "success",
            workflowId: workflowId,
            metadata: { 
              sources: ["coingecko_trending", "price_gainers", "crypto_culture"],
              keywordCount: trendingKeywords.length
            }
          });

          // Step 2: Execute complete Reddit → Twitter → AI replies workflow
          await twitterPostFinder.executeTwitterWorkflow(trendingKeywords, 5);
        }

      } catch (error) {
        console.error(`Complete workflow error for workflow ${workflowId}:`, error);
        await storage.logActivity({
          type: "workflow_error",
          message: `Complete workflow failed: ${(error as Error).message}`,
          status: "error",
          workflowId: workflowId
        });
      }
    }, interval);

    // Execute immediately on start
    setTimeout(async () => {
      try {
        const trendingKeywords = await trendingKeywordFinder.getTopKeywordsForScraping(5);
        if (trendingKeywords.length > 0) {
          await twitterPostFinder.executeTwitterWorkflow(trendingKeywords, 5);
        }
      } catch (error) {
        console.error('Initial workflow execution failed:', error);
      }
    }, 5000);

    this.activeWorkflows.set(workflowId, timer);
  }
}

export const workflowManager = new WorkflowManager();
