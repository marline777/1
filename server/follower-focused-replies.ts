import { storage } from "./storage";

export class FollowerFocusedReplies {
  
  // Generate replies designed to attract followers
  generateFollowerAttractivReply(originalTweet: string, tweetAuthor: string): string {
    const replyTemplates = [
      // Funny + Trading Insights
      {
        pattern: /bitcoin|btc/i,
        replies: [
          "Bitcoin doing Bitcoin things again 😄 My TA says we're entering the 'hopium phase' - check my charts for the full breakdown!",
          "Plot twist: Bitcoin doesn't care about your portfolio anxiety 📈 Following my signals has been... educational 😅",
          "Bitcoin: *exists* | My portfolio: 'It's free real estate' 🏠 Drop a follow for more questionable financial advice!",
          "Fun fact: 73% of my predictions are right 60% of the time 🤓 The other 27% are pure comedy gold - follow for both!"
        ]
      },
      {
        pattern: /ethereum|eth/i,
        replies: [
          "ETH is basically the Swiss Army knife of crypto - it does everything except my laundry 🧺 Follow for more tech + memes!",
          "Ethereum gas fees: Making my coffee budget look reasonable since 2015 ☕ Check my bio for gas-saving strategies!",
          "ETH staking rewards vs my bank savings account... it's not even close 😂 Follow for DeFi reality checks!",
          "Vitalik probably didn't expect ETH to become this addictive 🎮 Following my updates = staying ahead of trends!"
        ]
      },
      {
        pattern: /defi|yield|farming/i,
        replies: [
          "DeFi yield farming: Where 'high APY' meets 'what could go wrong?' 🚜 Follow for risk-adjusted reality!",
          "Yield farming taught me more about risk management than any textbook 📚 Sharing lessons learned daily!",
          "DeFi protocols: Making traditional banks look like dial-up internet 📞 Follow for protocol deep dives!",
          "That moment when your yield farm yields... experience 😅 Follow for both wins and learning moments!"
        ]
      },
      {
        pattern: /altcoin|alt season|pump/i,
        replies: [
          "Altcoin research: 20% fundamentals, 80% meme potential 🧬 Follow for my 'scientific' selection process!",
          "Alt season is like Christmas morning but with more volatility 🎄 Sharing my watchlist daily!",
          "Remember: Not financial advice, just expensive entertainment 🎪 Follow for market comedy + insights!",
          "Altcoins: Teaching patience and humility since... forever 🧘 Follow for the full emotional journey!"
        ]
      },
      {
        pattern: /bullish|moon|rocket|pump/i,
        replies: [
          "Sir, this is a Wendy's... but yes, very bullish 🚀 Follow for more professional analysis like this!",
          "Bullish on your optimism! 📈 My contrarian plays have been... interesting. Follow for the full story!",
          "To the moon? I'd settle for 'to the profit' first 🌙 Follow for realistic targets + memes!",
          "Rocket fuel or rocket science? Why not both! 🚀 Follow for technical analysis with personality!"
        ]
      },
      {
        pattern: /bearish|dump|crash|down/i,
        replies: [
          "Bear markets build character (and buying opportunities) 🐻 Follow for accumulation strategies!",
          "Dips are just sales with extra steps 🛒 Sharing my shopping list daily!",
          "Market down? Time to zoom out and touch grass 🌱 Follow for perspective + tactical moves!",
          "Crash course in crypto: Literally every crash is a course 📖 Follow for the curriculum!"
        ]
      }
    ];

    // Find matching pattern
    for (const template of replyTemplates) {
      if (template.pattern.test(originalTweet)) {
        const randomReply = template.replies[Math.floor(Math.random() * template.replies.length)];
        return randomReply;
      }
    }

    // Default engaging replies
    const defaultReplies = [
      "This take hits different 💯 Following my analysis has been a wild ride - join the chaos!",
      "Plot twist incoming? 🎬 I called this movement last week - check my timeline for proof!",
      "Quality content right here! 🔥 Drop a follow if you want more alpha mixed with comedy!",
      "Facts! 📊 Been tracking this trend for weeks - my followers get the early signals!",
      "This aged well! ⏰ Following my calls = staying ahead of the curve (most of the time 😅)",
      "Big brain energy! 🧠 Follow for more insights that occasionally make sense!",
      "Narrator: 'It was indeed about to get interesting' 📚 Follow for live commentary!",
      "Screenshot this tweet 📸 Calling it now - follow to see how this prediction ages!"
    ];

    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
  }

  // Generate contextual hooks to attract followers
  generateFollowerHook(tweetContent: string): string {
    const hooks = [
      "Follow for daily market takes that age like fine wine (or milk) 🍷",
      "Hit follow if you enjoy technical analysis with a side of chaos 📈",
      "Following = getting early access to my next '10x gem' discovery 💎",
      "Drop a follow for more content that your portfolio will thank you for 📊",
      "Follow button = subscribe to financial education with comedy 🎭",
      "Following my account = joining the 'realistic expectations' gang 🎯",
      "Hit follow for market insights that don't put you to sleep 😴",
      "Follow for crypto content that's actually useful (and occasionally funny) 🔥"
    ];

    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  // Check if tweet meets engagement criteria (20+ replies)
  isHighEngagementTweet(tweetData: any): boolean {
    const replies = tweetData.replyCount || tweetData.replies || 0;
    return replies >= 20;
  }

  // Generate complete follower-attracting reply
  generateCompleteReply(originalTweet: string, tweetAuthor: string): {
    content: string;
    cta: string;
    tone: 'funny' | 'insightful' | 'mixed';
  } {
    const mainReply = this.generateFollowerAttractivReply(originalTweet, tweetAuthor);
    const hook = this.generateFollowerHook(originalTweet);
    
    // Combine for maximum follower attraction
    const content = mainReply + "\n\n" + hook;
    
    return {
      content,
      cta: hook,
      tone: 'mixed'
    };
  }

  // Analyze reply potential for follower growth
  analyzeFollowerPotential(tweet: any): {
    score: number;
    reasons: string[];
    shouldReply: boolean;
  } {
    let score = 0;
    const reasons: string[] = [];

    // High reply count (target: 20+)
    if (tweet.replyCount >= 20) {
      score += 40;
      reasons.push(`High engagement: ${tweet.replyCount} replies`);
    }

    // Viral potential (likes + retweets)
    const totalEngagement = (tweet.likes || 0) + (tweet.retweets || 0);
    if (totalEngagement > 500) {
      score += 30;
      reasons.push(`Viral potential: ${totalEngagement} total engagement`);
    }

    // Crypto-related content
    const cryptoKeywords = ['bitcoin', 'crypto', 'ethereum', 'defi', 'altcoin', 'trading'];
    const hasCryptoContent = cryptoKeywords.some(keyword => 
      tweet.text.toLowerCase().includes(keyword)
    );
    if (hasCryptoContent) {
      score += 20;
      reasons.push('Crypto-related content');
    }

    // Recent tweet (better for engagement)
    const tweetAge = Date.now() - new Date(tweet.timestamp).getTime();
    if (tweetAge < 24 * 60 * 60 * 1000) { // Less than 24 hours
      score += 10;
      reasons.push('Recent tweet (< 24h)');
    }

    return {
      score,
      reasons,
      shouldReply: score >= 50 // Minimum threshold for replying
    };
  }
}

export const followerFocusedReplies = new FollowerFocusedReplies();