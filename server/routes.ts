import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { insertWorkflowSchema, insertTweetSchema, insertAiContentSchema, insertProxySchema, insertActivitySchema, tweets, aiContent } from "@shared/schema";
import { db } from "./db";
import { workflowManager } from "./workflow-manager";
import { proxyManager } from "./proxy-manager";
import { generateAIContent, analyzeContentQuality } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // WebSocket connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Attach io to app for use in routes
  app.set("io", io);

  // Dashboard metrics endpoint
  app.get("/api/metrics", async (req, res) => {
    try {
      const activeWorkflows = await storage.getActiveWorkflowsCount();
      const tweetsProcessed = await storage.getTweetsProcessedToday();
      const proxySuccessRate = await storage.getProxySuccessRate();
      const aiResponses = await storage.getAIResponsesToday();
      const pendingApprovals = await storage.getPendingApprovalsCount();

      res.json({
        activeWorkflows,
        tweetsProcessed,
        proxySuccessRate,
        aiResponses,
        pendingApprovals
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Workflows endpoints
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows = await storage.getAllWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const workflowData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(workflowData);
      
      // Emit real-time update
      io.emit("workflow_created", workflow);
      
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/workflows/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const workflow = await storage.updateWorkflowStatus(parseInt(id), status);
      
      if (status === "active") {
        await workflowManager.startWorkflow(parseInt(id));
      } else if (status === "paused" || status === "inactive") {
        await workflowManager.stopWorkflow(parseInt(id));
      }
      
      // Emit real-time update
      io.emit("workflow_status_changed", { workflowId: parseInt(id), status });
      
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Tweets endpoints
  app.get("/api/tweets", async (req, res) => {
    try {
      const { limit = 50, processed } = req.query;
      const tweets = await storage.getTweets(parseInt(limit as string), processed === "true");
      res.json(tweets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tweets" });
    }
  });

  app.post("/api/tweets", async (req, res) => {
    try {
      const tweetData = insertTweetSchema.parse(req.body);
      const tweet = await storage.createTweet(tweetData);
      
      // Emit real-time update
      io.emit("tweet_scraped", tweet);
      
      res.json(tweet);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // AI Content endpoints
  app.get("/api/ai-content", async (req, res) => {
    try {
      const { status = "pending" } = req.query;
      const content = await storage.getAIContentByStatus(status as string);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI content" });
    }
  });

  app.post("/api/ai-content/generate", async (req, res) => {
    try {
      const { tweetId, type = "reply" } = req.body;
      const tweet = await storage.getTweetById(tweetId);
      
      if (!tweet) {
        return res.status(404).json({ error: "Tweet not found" });
      }

      const aiResponse = await generateAIContent(tweet.text, tweet.author, type);
      const qualityScore = await analyzeContentQuality(aiResponse.content);

      const contentData = insertAiContentSchema.parse({
        tweetId,
        type,
        content: aiResponse.content,
        qualityScore: qualityScore.score,
        targetTweetId: tweet.tweetId,
        mediaId: aiResponse.mediaId
      });

      const aiContent = await storage.createAIContent(contentData);
      
      // Emit real-time update
      io.emit("ai_content_generated", aiContent);
      
      res.json(aiContent);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/ai-content/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const aiContent = await storage.updateAIContentStatus(parseInt(id), "approved");
      
      // Emit real-time update
      io.emit("content_approved", aiContent);
      
      res.json(aiContent);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/ai-content/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const aiContent = await storage.updateAIContentStatus(parseInt(id), "rejected");
      
      // Emit real-time update
      io.emit("content_rejected", aiContent);
      
      res.json(aiContent);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Proxy endpoints
  app.get("/api/proxies", async (req, res) => {
    try {
      const proxies = await storage.getAllProxies();
      res.json(proxies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proxies" });
    }
  });

  app.post("/api/proxies/sync", async (req, res) => {
    try {
      const syncResult = await proxyManager.syncFromGitHub();
      
      // Emit real-time update
      io.emit("proxies_synced", syncResult);
      
      res.json(syncResult);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync proxies from GitHub" });
    }
  });

  app.post("/api/proxies/sync-replit", async (req, res) => {
    try {
      const syncResult = await proxyManager.syncFromReplitValidator();
      
      // Emit real-time update
      io.emit("proxies_synced", syncResult);
      
      res.json(syncResult);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync proxies from Replit validator" });
    }
  });

  app.get("/api/proxies/stats", async (req, res) => {
    try {
      const stats = await storage.getProxyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proxy stats" });
    }
  });

  // Activities endpoint
  app.get("/api/activities", async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const activities = await storage.getRecentActivities(parseInt(limit as string));
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // System settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      const setting = await storage.updateSetting(key, value);
      
      // Emit real-time update
      io.emit("setting_updated", setting);
      
      res.json(setting);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Proxy synchronization endpoint
  app.post("/api/proxies/sync", async (req, res) => {
    try {
      await proxyManager.syncFromGitHub();
      const stats = await storage.getProxyStats();
      
      // Emit real-time update
      io.emit("proxies_synced", stats);
      
      res.json({ 
        message: "Proxy sync completed successfully", 
        stats 
      });
    } catch (error) {
      console.error("Error syncing proxies:", error);
      res.status(500).json({ 
        message: "Failed to sync proxies from GitHub",
        error: (error as Error).message 
      });
    }
  });

  // Reply management endpoints
  app.get("/api/replies/queue", async (req, res) => {
    try {
      const { replyManager } = await import("./reply-manager");
      const queue = await replyManager.getReplyQueue();
      res.json(queue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reply queue" });
    }
  });

  app.post("/api/replies/:id/approve", async (req, res) => {
    try {
      const { replyManager } = await import("./reply-manager");
      await replyManager.approveReply(parseInt(req.params.id));
      res.json({ message: "Reply approved" });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve reply" });
    }
  });

  app.post("/api/replies/:id/reject", async (req, res) => {
    try {
      const { replyManager } = await import("./reply-manager");
      const { reason } = req.body;
      await replyManager.rejectReply(parseInt(req.params.id), reason);
      res.json({ message: "Reply rejected" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject reply" });
    }
  });

  app.post("/api/replies/execute", async (req, res) => {
    try {
      const { replyManager } = await import("./reply-manager");
      await replyManager.executeApprovedReplies();
      res.json({ message: "Approved replies executed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute replies" });
    }
  });

  app.get("/api/trending/keywords", async (req, res) => {
    try {
      const { trendingKeywordFinder } = await import("./trending-keywords");
      const keywords = await trendingKeywordFinder.findTrendingCryptoKeywords();
      res.json(keywords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending keywords" });
    }
  });

  app.post("/api/trending/scrape", async (req, res) => {
    try {
      const { realDataScraper } = await import("./real-data-scraper");
      const { trendingKeywordFinder } = await import("./trending-keywords");
      
      // Get dynamic trending keywords
      const trendingKeywords = await trendingKeywordFinder.getTopKeywordsForScraping(8);
      const { minEngagement } = req.body;
      
      await realDataScraper.executeRealWorkflow(
        trendingKeywords, 
        minEngagement || 20
      );
      
      res.json({ 
        message: "Real data collection completed",
        keywords: trendingKeywords
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute real data collection" });
    }
  });

  // Emergency stop endpoint
  app.post("/api/emergency-stop", async (req, res) => {
    try {
      await workflowManager.stopAllWorkflows();
      await storage.logActivity({
        type: "system",
        message: "Emergency stop activated - All workflows stopped",
        status: "warning",
        metadata: { timestamp: new Date().toISOString() }
      });
      
      // Emit real-time update
      io.emit("emergency_stop_activated");
      
      res.json({ message: "Emergency stop activated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute emergency stop" });
    }
  });

  // Delete endpoints for testing
  app.delete("/api/tweets", async (req, res) => {
    try {
      await db.delete(tweets);
      res.json({ message: "Tweets cleared" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear tweets" });
    }
  });

  app.delete("/api/ai-content", async (req, res) => {
    try {
      await db.delete(aiContent);
      res.json({ message: "AI content cleared" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear AI content" });
    }
  });

  return httpServer;
}
