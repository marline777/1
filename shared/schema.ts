import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("inactive"), // active, inactive, paused, error
  n8nWorkflowId: text("n8n_workflow_id"),
  config: jsonb("config"),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const tweets = pgTable("tweets", {
  id: serial("id").primaryKey(),
  tweetId: text("tweet_id").notNull().unique(),
  text: text("text").notNull(),
  author: text("author").notNull(),
  username: text("username").notNull(),
  replyCount: integer("reply_count").default(0),
  likes: integer("likes").default(0),
  retweets: integer("retweets").default(0),
  engagementScore: decimal("engagement_score", { precision: 10, scale: 2 }),
  mediaUrls: text("media_urls").array(),
  processed: boolean("processed").default(false),
  workflowId: integer("workflow_id").references(() => workflows.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const aiContent = pgTable("ai_content", {
  id: serial("id").primaryKey(),
  tweetId: integer("tweet_id").references(() => tweets.id),
  type: text("type").notNull(), // reply, meme, post
  content: text("content").notNull(),
  qualityScore: decimal("quality_score", { precision: 3, scale: 1 }),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, posted
  targetTweetId: text("target_tweet_id"),
  mediaId: text("media_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  postedAt: timestamp("posted_at")
});

export const proxies = pgTable("proxies", {
  id: serial("id").primaryKey(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  username: text("username"),
  password: text("password"),
  type: text("type").notNull(), // http, socks5, residential
  country: text("country"),
  status: text("status").notNull().default("active"), // active, inactive, failed, rotating
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0"),
  avgResponseTime: integer("avg_response_time").default(0),
  lastUsed: timestamp("last_used"),
  failureCount: integer("failure_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // tweet_scraped, ai_generated, proxy_rotated, reply_posted, meme_created
  message: text("message").notNull(),
  status: text("status").notNull(), // success, warning, error, info
  metadata: jsonb("metadata"),
  workflowId: integer("workflow_id").references(() => workflows.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").notNull(), // string, number, boolean, json
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Insert schemas
export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTweetSchema = createInsertSchema(tweets).omit({
  id: true,
  createdAt: true
});

export const insertAiContentSchema = createInsertSchema(aiContent).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  postedAt: true
});

export const insertProxySchema = createInsertSchema(proxies).omit({
  id: true,
  createdAt: true
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export type InsertTweet = z.infer<typeof insertTweetSchema>;
export type Tweet = typeof tweets.$inferSelect;

export type InsertAiContent = z.infer<typeof insertAiContentSchema>;
export type AiContent = typeof aiContent.$inferSelect;

export type InsertProxy = z.infer<typeof insertProxySchema>;
export type Proxy = typeof proxies.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
