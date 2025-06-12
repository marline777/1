import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.API_KEY 
});

export interface AIContentResponse {
  content: string;
  memeSuggestion?: string;
  mediaId?: string;
  type: "reply" | "meme" | "post";
}

export interface ContentQualityAnalysis {
  score: number;
  confidence: number;
  factors: {
    relevance: number;
    engagement: number;
    safety: number;
    creativity: number;
  };
}

export async function generateAIContent(
  tweetText: string, 
  author: string, 
  type: "reply" | "meme" | "post" = "reply"
): Promise<AIContentResponse> {
  try {
    const systemPrompt = `You are a witty, crypto-community-oriented AI assistant that generates engaging social media content. You understand crypto culture, memes, and slang. Always be:
- Politically neutral and non-controversial
- Respectful and positive
- Use appropriate crypto slang (HODL, to the moon, diamond hands, etc.)
- Keep replies under 280 characters
- Generate engaging, authentic-sounding responses

Respond with JSON in this exact format:
{
  "content": "your response text here",
  "memeSuggestion": "description for meme if applicable",
  "type": "${type}"
}`;

    let userPrompt = "";
    if (type === "reply") {
      userPrompt = `Generate a witty, engaging reply to this tweet from @${author}: "${tweetText}"`;
    } else if (type === "meme") {
      userPrompt = `Generate a funny meme idea related to this tweet: "${tweetText}". Provide both the text content and a meme description.`;
    } else {
      userPrompt = `Generate an original crypto-related post inspired by the sentiment of: "${tweetText}"`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      content: result.content || "HODL strong! 🚀",
      memeSuggestion: result.memeSuggestion,
      type: type
    };

  } catch (error) {
    console.error("Failed to generate AI content:", error);
    throw new Error(`AI content generation failed: ${error.message}`);
  }
}

export async function analyzeContentQuality(content: string): Promise<ContentQualityAnalysis> {
  try {
    const systemPrompt = `You are a content quality analyst for social media posts. Analyze the given content and rate it on various factors. 

Respond with JSON in this exact format:
{
  "score": number_between_1_and_10,
  "confidence": number_between_0_and_1,
  "factors": {
    "relevance": number_between_1_and_10,
    "engagement": number_between_1_and_10,
    "safety": number_between_1_and_10,
    "creativity": number_between_1_and_10
  }
}

Rate based on:
- Relevance: How well it fits crypto/social media context
- Engagement: Likelihood to get likes, replies, shares
- Safety: Appropriateness, non-controversial nature
- Creativity: Originality and wit`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this content: "${content}"` }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure all values are within expected ranges
    const factors = {
      relevance: Math.max(1, Math.min(10, result.factors?.relevance || 5)),
      engagement: Math.max(1, Math.min(10, result.factors?.engagement || 5)),
      safety: Math.max(1, Math.min(10, result.factors?.safety || 8)),
      creativity: Math.max(1, Math.min(10, result.factors?.creativity || 5))
    };

    const averageScore = (factors.relevance + factors.engagement + factors.safety + factors.creativity) / 4;

    return {
      score: Math.max(1, Math.min(10, result.score || averageScore)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
      factors
    };

  } catch (error) {
    console.error("Failed to analyze content quality:", error);
    // Return default moderate scores on error
    return {
      score: 6.0,
      confidence: 0.5,
      factors: {
        relevance: 6,
        engagement: 6,
        safety: 8,
        creativity: 5
      }
    };
  }
}

export async function generateMemeImage(prompt: string): Promise<{ url: string }> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a crypto-themed meme image: ${prompt}. Style should be internet meme format, high contrast, bold text, suitable for social media sharing.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return { url: response.data[0].url };
  } catch (error) {
    console.error("Failed to generate meme image:", error);
    throw new Error(`Meme generation failed: ${error.message}`);
  }
}

export async function moderateContent(content: string): Promise<{
  safe: boolean;
  categories: string[];
  confidence: number;
}> {
  try {
    const response = await openai.moderations.create({
      input: content,
    });

    const result = response.results[0];
    const flaggedCategories = Object.entries(result.categories)
      .filter(([_, flagged]) => flagged)
      .map(([category, _]) => category);

    return {
      safe: !result.flagged,
      categories: flaggedCategories,
      confidence: Math.max(...Object.values(result.category_scores))
    };
  } catch (error) {
    console.error("Failed to moderate content:", error);
    // Default to safe if moderation fails
    return {
      safe: true,
      categories: [],
      confidence: 0.5
    };
  }
}

export async function enhanceContentForEngagement(content: string, platform: string = "twitter"): Promise<string> {
  try {
    const systemPrompt = `You are a social media engagement expert. Take the given content and enhance it to maximize engagement while keeping the core message. Add appropriate:
- Emojis (but not too many)
- Crypto slang where relevant
- Call-to-action elements
- Hashtags (maximum 2-3 relevant ones)
- Format for ${platform}

Keep under 280 characters. Return only the enhanced content, no explanations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0].message.content?.trim() || content;
  } catch (error) {
    console.error("Failed to enhance content:", error);
    return content; // Return original on failure
  }
}
