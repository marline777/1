import { 
  users, workflows, tweets, aiContent, proxies, activities, systemSettings,
  type User, type InsertUser, type Workflow, type InsertWorkflow,
  type Tweet, type InsertTweet, type AiContent, type InsertAiContent,
  type Proxy, type InsertProxy, type Activity, type InsertActivity,
  type SystemSetting, type InsertSystemSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  // Workflow methods
  getAllWorkflows(): Promise<Workflow[]>;
  getWorkflowById(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflowStatus(id: number, status: string): Promise<Workflow>;
  getActiveWorkflowsCount(): Promise<number>;

  // Tweet methods
  getTweets(limit: number, processed?: boolean): Promise<Tweet[]>;
  getTweetById(id: number): Promise<Tweet | undefined>;
  createTweet(tweet: InsertTweet): Promise<Tweet>;
  getTweetsProcessedToday(): Promise<number>;

  // AI Content methods
  getAIContentByStatus(status: string): Promise<AiContent[]>;
  createAIContent(content: InsertAiContent): Promise<AiContent>;
  updateAIContentStatus(id: number, status: string): Promise<AiContent>;
  getAIResponsesToday(): Promise<number>;
  getPendingApprovalsCount(): Promise<number>;

  // Proxy methods
  getAllProxies(): Promise<Proxy[]>;
  getProxyById(id: number): Promise<Proxy | undefined>;
  getProxyByHost(host: string, port: number): Promise<Proxy | undefined>;
  createProxy(proxy: InsertProxy): Promise<Proxy>;
  updateProxyStatus(id: number, status: string): Promise<Proxy>;
  updateProxyLastUsed(id: number): Promise<void>;
  incrementProxyFailures(id: number): Promise<void>;
  updateProxyStats(id: number, responseTime: number): Promise<void>;
  getActiveProxies(): Promise<Proxy[]>;
  getProxyStats(): Promise<{ active: number; total: number; successRate: number; avgSpeed: number }>;
  getProxySuccessRate(): Promise<number>;

  // Activity methods
  getRecentActivities(limit: number): Promise<Activity[]>;
  logActivity(activity: InsertActivity): Promise<Activity>;

  // Settings methods
  getAllSettings(): Promise<SystemSetting[]>;
  updateSetting(key: string, value: string): Promise<SystemSetting>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Workflow methods
  async getAllWorkflows(): Promise<Workflow[]> {
    return await db.select().from(workflows).orderBy(desc(workflows.createdAt));
  }

  async getWorkflowById(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow || undefined;
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [newWorkflow] = await db
      .insert(workflows)
      .values(workflow)
      .returning();
    return newWorkflow;
  }

  async updateWorkflowStatus(id: number, status: string): Promise<Workflow> {
    const [workflow] = await db
      .update(workflows)
      .set({ status, updatedAt: new Date() })
      .where(eq(workflows.id, id))
      .returning();
    return workflow;
  }

  async getActiveWorkflowsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(workflows)
      .where(eq(workflows.status, "active"));
    return result.count;
  }

  // Tweet methods
  async getTweets(limit: number, processed?: boolean): Promise<Tweet[]> {
    let query = db.select().from(tweets).orderBy(desc(tweets.createdAt)).limit(limit);
    
    if (processed !== undefined) {
      query = db.select().from(tweets)
        .where(eq(tweets.processed, processed))
        .orderBy(desc(tweets.createdAt))
        .limit(limit);
    }
    
    return await query;
  }

  async getTweetById(id: number): Promise<Tweet | undefined> {
    const [tweet] = await db.select().from(tweets).where(eq(tweets.id, id));
    return tweet || undefined;
  }

  async createTweet(tweet: InsertTweet): Promise<Tweet> {
    const [newTweet] = await db
      .insert(tweets)
      .values(tweet)
      .returning();
    return newTweet;
  }

  async getTweetsProcessedToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [result] = await db
      .select({ count: count() })
      .from(tweets)
      .where(gte(tweets.createdAt, today));
    return result.count;
  }

  // AI Content methods
  async getAIContentByStatus(status: string): Promise<AiContent[]> {
    return await db
      .select()
      .from(aiContent)
      .where(eq(aiContent.status, status))
      .orderBy(desc(aiContent.createdAt));
  }

  async createAIContent(content: InsertAiContent): Promise<AiContent> {
    const [newContent] = await db
      .insert(aiContent)
      .values(content)
      .returning();
    return newContent;
  }

  async updateAIContentStatus(id: number, status: string): Promise<AiContent> {
    const [content] = await db
      .update(aiContent)
      .set({ 
        status, 
        approvedAt: status === "approved" ? new Date() : undefined,
        postedAt: status === "posted" ? new Date() : undefined
      })
      .where(eq(aiContent.id, id))
      .returning();
    return content;
  }

  async getAIResponsesToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [result] = await db
      .select({ count: count() })
      .from(aiContent)
      .where(gte(aiContent.createdAt, today));
    return result.count;
  }

  async getPendingApprovalsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(aiContent)
      .where(eq(aiContent.status, "pending"));
    return result.count;
  }

  // Proxy methods
  async getAllProxies(): Promise<Proxy[]> {
    return await db.select().from(proxies).orderBy(desc(proxies.createdAt));
  }

  async getProxyById(id: number): Promise<Proxy | undefined> {
    const [proxy] = await db.select().from(proxies).where(eq(proxies.id, id));
    return proxy || undefined;
  }

  async getProxyByHost(host: string, port: number): Promise<Proxy | undefined> {
    const [proxy] = await db
      .select()
      .from(proxies)
      .where(and(eq(proxies.host, host), eq(proxies.port, port)));
    return proxy || undefined;
  }

  async createProxy(proxy: InsertProxy): Promise<Proxy> {
    const [newProxy] = await db
      .insert(proxies)
      .values(proxy)
      .returning();
    return newProxy;
  }

  async updateProxyStatus(id: number, status: string): Promise<Proxy> {
    const [proxy] = await db
      .update(proxies)
      .set({ status })
      .where(eq(proxies.id, id))
      .returning();
    return proxy;
  }

  async updateProxyLastUsed(id: number): Promise<void> {
    await db
      .update(proxies)
      .set({ lastUsed: new Date() })
      .where(eq(proxies.id, id));
  }

  async incrementProxyFailures(id: number): Promise<void> {
    await db
      .update(proxies)
      .set({ failureCount: sql`${proxies.failureCount} + 1` })
      .where(eq(proxies.id, id));
  }

  async updateProxyStats(id: number, responseTime: number): Promise<void> {
    await db
      .update(proxies)
      .set({ 
        avgResponseTime: responseTime,
        successRate: sql`LEAST(${proxies.successRate} + 0.1, 100)`,
        failureCount: 0
      })
      .where(eq(proxies.id, id));
  }

  async getActiveProxies(): Promise<Proxy[]> {
    return await db
      .select()
      .from(proxies)
      .where(eq(proxies.status, "active"));
  }

  async getProxyStats(): Promise<{ active: number; total: number; successRate: number; avgSpeed: number }> {
    const [stats] = await db
      .select({
        total: count(),
        active: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
        avgSuccessRate: sql<number>`AVG(CASE WHEN status = 'active' THEN success_rate ELSE NULL END)`,
        avgSpeed: sql<number>`AVG(CASE WHEN status = 'active' THEN avg_response_time ELSE NULL END)`
      })
      .from(proxies);

    return {
      active: stats.active || 0,
      total: stats.total || 0,
      successRate: stats.avgSuccessRate || 0,
      avgSpeed: stats.avgSpeed || 0
    };
  }

  async getProxySuccessRate(): Promise<number> {
    const [result] = await db
      .select({
        avgSuccessRate: sql<number>`AVG(success_rate)`
      })
      .from(proxies)
      .where(eq(proxies.status, "active"));
    
    return result.avgSuccessRate || 0;
  }

  // Activity methods
  async getRecentActivities(limit: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async logActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Settings methods
  async getAllSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings);
  }

  async updateSetting(key: string, value: string): Promise<SystemSetting> {
    // Try to update first
    const [updated] = await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();

    if (updated) {
      return updated;
    }

    // If no rows updated, insert new setting
    const [newSetting] = await db
      .insert(systemSettings)
      .values({ key, value, type: "string" })
      .returning();
    
    return newSetting;
  }
}

export const storage = new DatabaseStorage();