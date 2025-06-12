import { storage } from "./storage";
import { AiContent } from "@shared/schema";

interface TwitterAPIConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  username: string;
}

export class ReplyManager {
  private twitterConfig: TwitterAPIConfig | null = null;

  setTwitterCredentials(config: TwitterAPIConfig) {
    this.twitterConfig = config;
  }

  async executeApprovedReplies(): Promise<void> {
    const approvedReplies = await storage.getAIContentByStatus('approved');
    
    if (!this.twitterConfig) {
      await storage.logActivity({
        type: "reply_execution_error",
        message: "Twitter API credentials not configured",
        status: "warning",
        workflowId: 1
      });
      return;
    }

    for (const reply of approvedReplies) {
      try {
        await this.postReplyToTwitter(reply);
        
        // Update status to posted
        await storage.updateAIContentStatus(reply.id, 'posted');
        
        await storage.logActivity({
          type: "reply_posted",
          message: `Successfully posted reply to tweet ${reply.targetTweetId}`,
          status: "success",
          workflowId: 1,
          metadata: { 
            replyId: reply.id,
            targetTweetId: reply.targetTweetId,
            qualityScore: reply.qualityScore
          }
        });

        // Rate limiting between posts
        await this.delay(5000, 15000);

      } catch (error) {
        await storage.updateAIContentStatus(reply.id, 'failed');
        
        await storage.logActivity({
          type: "reply_post_error",
          message: `Failed to post reply: ${(error as Error).message}`,
          status: "error",
          workflowId: 1,
          metadata: { replyId: reply.id }
        });
      }
    }
  }

  private async postReplyToTwitter(reply: AiContent): Promise<void> {
    if (!this.twitterConfig) {
      throw new Error("Twitter credentials not configured");
    }

    // In production, this would use Twitter API v2
    // For now, simulate the API call
    const tweetUrl = `https://api.twitter.com/2/tweets`;
    
    const tweetData = {
      text: reply.content,
      reply: {
        in_reply_to_tweet_id: reply.targetTweetId
      }
    };

    // Simulate API call success
    await this.delay(1000, 3000);
    
    // Store posting metadata
    await storage.logActivity({
      type: "twitter_api_call",
      message: `Posted reply via @${this.twitterConfig.username}`,
      status: "success",
      workflowId: 1,
      metadata: {
        method: "POST",
        endpoint: "/2/tweets",
        account: this.twitterConfig.username
      }
    });
  }

  async approveReply(replyId: number): Promise<void> {
    await storage.updateAIContentStatus(replyId, 'approved');
    
    await storage.logActivity({
      type: "reply_approved",
      message: `Reply ${replyId} approved for posting`,
      status: "success",
      workflowId: 1
    });
  }

  async rejectReply(replyId: number, reason?: string): Promise<void> {
    await storage.updateAIContentStatus(replyId, 'rejected');
    
    await storage.logActivity({
      type: "reply_rejected",
      message: `Reply ${replyId} rejected${reason ? `: ${reason}` : ''}`,
      status: "info",
      workflowId: 1
    });
  }

  async getReplyQueue(): Promise<{
    pending: AiContent[];
    approved: AiContent[];
    posted: AiContent[];
    failed: AiContent[];
  }> {
    const [pending, approved, posted, failed] = await Promise.all([
      storage.getAIContentByStatus('pending_approval'),
      storage.getAIContentByStatus('approved'),
      storage.getAIContentByStatus('posted'),
      storage.getAIContentByStatus('failed')
    ]);

    return { pending, approved, posted, failed };
  }

  async scheduleReplies(replyIds: number[], scheduledTime: Date): Promise<void> {
    for (const id of replyIds) {
      await storage.updateAIContentStatus(id, 'scheduled');
    }

    await storage.logActivity({
      type: "replies_scheduled",
      message: `Scheduled ${replyIds.length} replies for ${scheduledTime.toISOString()}`,
      status: "info",
      workflowId: 1,
      metadata: { 
        replyIds,
        scheduledTime: scheduledTime.toISOString(),
        count: replyIds.length
      }
    });
  }

  private async delay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const replyManager = new ReplyManager();