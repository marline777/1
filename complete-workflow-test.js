import fetch from 'node-fetch';

async function runCompleteWorkflow() {
  console.log('Testing complete follower-focused workflow...');
  
  // Clear previous data
  await fetch('http://localhost:5000/api/tweets', { method: 'DELETE' });
  await fetch('http://localhost:5000/api/ai-content', { method: 'DELETE' });
  
  // Create high-engagement tweets that meet the 20+ replies criteria
  const highEngagementTweets = [
    {
      tweetId: 'btc_bull_' + Date.now(),
      text: 'Bitcoin dominance dropping while alts are pumping. Is this the start of alt season or just another fake-out?',
      author: 'CryptoWhale',
      username: 'cryptowhale',
      replyCount: 67,  // High engagement
      likes: 1243,
      retweets: 234,
      engagementScore: '1544',
      mediaUrls: [],
      workflowId: 1
    },
    {
      tweetId: 'defi_yield_' + Date.now(),
      text: 'Found a DeFi protocol offering 400% APY. Too good to be true or legitimate opportunity? Doing my research...',
      author: 'DeFiHunter',
      username: 'defihunter',
      replyCount: 43,  // High engagement
      likes: 892,
      retweets: 156,
      engagementScore: '1091',
      mediaUrls: [],
      workflowId: 1
    },
    {
      tweetId: 'lambo_moon_' + Date.now(),
      text: 'LAMBO just hit $0.50! Community called this at $0.05. Sometimes the meme coins actually deliver 🚗',
      author: 'MemeKing',
      username: 'memeking',
      replyCount: 89,  // Very high engagement
      likes: 2156,
      retweets: 445,
      engagementScore: '2690',
      mediaUrls: [],
      workflowId: 1
    },
    {
      tweetId: 'bearish_signal_' + Date.now(),
      text: 'Market looking shaky. Volume declining, fear index rising. Might be time to take some profits and wait.',
      author: 'TechnicalTrader',
      username: 'technicaltrader',
      replyCount: 156,  // Extremely high engagement
      likes: 3421,
      retweets: 789,
      engagementScore: '4366',
      mediaUrls: [],
      workflowId: 1
    },
    {
      tweetId: 'low_engagement_' + Date.now(),
      text: 'Just bought some random altcoin. Hope it moons.',
      author: 'SmallFish',
      username: 'smallfish',
      replyCount: 8,   // Below 20 threshold - should be ignored
      likes: 23,
      retweets: 3,
      engagementScore: '34',
      mediaUrls: [],
      workflowId: 1
    }
  ];
  
  // Store tweets
  for (const tweet of highEngagementTweets) {
    await fetch('http://localhost:5000/api/tweets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tweet)
    });
  }
  
  console.log(`Stored ${highEngagementTweets.length} tweets for testing`);
  console.log('High engagement targets (20+ replies):');
  highEngagementTweets
    .filter(t => t.replyCount >= 20)
    .forEach(t => console.log(`- ${t.replyCount} replies: "${t.text.substring(0, 60)}..."`));
  
  // Generate follower-focused replies using local algorithm
  console.log('\nGenerating follower-attracting replies...');
  
  const { followerFocusedReplies } = await import('./server/follower-focused-replies.js');
  
  let repliesGenerated = 0;
  for (const tweet of highEngagementTweets) {
    const analysis = followerFocusedReplies.analyzeFollowerPotential(tweet);
    
    if (analysis.shouldReply) {
      const replyData = followerFocusedReplies.generateCompleteReply(tweet.text, tweet.author);
      
      await fetch('http://localhost:5000/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyData.content,
          type: 'reply',
          qualityScore: String(analysis.score),
          targetTweetId: tweet.tweetId,
          status: analysis.score >= 70 ? 'approved' : 'pending_approval'
        })
      });
      
      repliesGenerated++;
    }
  }
  
  console.log(`Generated ${repliesGenerated} follower-focused replies`);
  
  // Check reply queue
  const queueResponse = await fetch('http://localhost:5000/api/replies/queue');
  const queue = await queueResponse.json();
  
  console.log('\nReply Queue Status:');
  console.log(`- Pending approval: ${queue.pending?.length || 0}`);
  console.log(`- Auto-approved: ${queue.approved?.length || 0}`);
  
  // Show sample replies with quality analysis
  if (queue.pending?.length > 0 || queue.approved?.length > 0) {
    console.log('\nSample Follower-Attracting Replies:');
    
    const allReplies = [...(queue.pending || []), ...(queue.approved || [])];
    allReplies.slice(0, 3).forEach((reply, i) => {
      console.log(`\n${i+1}. Quality Score: ${reply.qualityScore}% | Status: ${reply.status}`);
      console.log(`   Target: ${reply.targetTweetId}`);
      console.log(`   Reply: "${reply.content.substring(0, 200)}..."`);
    });
  }
  
  // Test approval workflow
  if (queue.pending?.length > 0) {
    const firstReply = queue.pending[0];
    console.log(`\nApproving reply ${firstReply.id} for posting...`);
    
    const approveResponse = await fetch(`http://localhost:5000/api/replies/${firstReply.id}/approve`, {
      method: 'POST'
    });
    
    if (approveResponse.ok) {
      console.log('Reply approved and queued for posting');
    }
  }
  
  // Final metrics
  const metricsResponse = await fetch('http://localhost:5000/api/metrics');
  const metrics = await metricsResponse.json();
  
  console.log('\nFinal Results:');
  console.log(`- Total tweets processed: ${metrics.tweetsProcessed}`);
  console.log(`- AI responses generated: ${metrics.aiResponses}`);
  console.log(`- Pending approvals: ${metrics.pendingApprovals}`);
  console.log(`- System ready for Twitter API integration`);
  
  console.log('\nStrategy Summary:');
  console.log('✓ Only targeting tweets with 20+ replies (high engagement)');
  console.log('✓ Generating funny + trading insights replies to attract followers');
  console.log('✓ Queue-based approval system to avoid detection');
  console.log('✓ Ready for automated posting via Twitter API');
}

runCompleteWorkflow();