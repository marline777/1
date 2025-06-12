import fetch from 'node-fetch';

async function testFollowerStrategy() {
  console.log('Testing follower-focused reply generation without OpenAI...');
  
  // Clear data and test with real trending keywords
  await fetch('http://localhost:5000/api/tweets', { method: 'DELETE' });
  await fetch('http://localhost:5000/api/ai-content', { method: 'DELETE' });
  
  // Create sample high-engagement tweets based on real trending keywords
  const highEngagementTweets = [
    {
      tweetId: 'trending_btc_' + Date.now(),
      text: 'Bitcoin just broke through $50k resistance again! This bull run feels different - institutional adoption is real this time',
      author: 'CryptoBull2024',
      username: 'cryptobull2024',
      replyCount: 45,  // Above 20 threshold
      likes: 289,
      retweets: 67,
      engagementScore: '401',
      mediaUrls: [],
      workflowId: 1
    },
    {
      tweetId: 'trending_lambo_' + Date.now(),
      text: 'LAMBO token is pumping 80% today! Community is going crazy. Anyone else riding this wave?',
      author: 'LamboMoonBoy',
      username: 'lambomoonboy',
      replyCount: 32,  // Above 20 threshold
      likes: 567,
      retweets: 134,
      engagementScore: '733',
      mediaUrls: [],
      workflowId: 1
    },
    {
      tweetId: 'trending_defi_' + Date.now(),
      text: 'DeFi yield farming just hit different when you find that 300% APY gem. Risk management is key but the rewards...',
      author: 'DeFiDegen',
      username: 'defidegen',
      replyCount: 28,  // Above 20 threshold
      likes: 445,
      retweets: 89,
      engagementScore: '562',
      mediaUrls: [],
      workflowId: 1
    }
  ];
  
  // Store tweets and test follower-focused reply generation
  for (const tweet of highEngagementTweets) {
    await fetch('http://localhost:5000/api/tweets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tweet)
    });
  }
  
  // Trigger follower-focused scraping
  const scrapeResponse = await fetch('http://localhost:5000/api/trending/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minEngagement: 20  // Focus on 20+ replies
    })
  });
  
  const scrapeResult = await scrapeResponse.json();
  console.log(`Initiated scraping with keywords: ${scrapeResult.keywords?.join(', ')}`);
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check reply queue
  const queueResponse = await fetch('http://localhost:5000/api/replies/queue');
  const queue = await queueResponse.json();
  
  console.log(`\nFollower Strategy Results:`);
  console.log(`- High-engagement tweets targeted: ${highEngagementTweets.length}`);
  console.log(`- Replies generated: ${queue.pending?.length || 0} pending`);
  console.log(`- Auto-approved: ${queue.approved?.length || 0} ready to post`);
  
  // Show sample follower-attracting replies
  if (queue.pending?.length > 0) {
    console.log('\nSample follower-attracting replies:');
    queue.pending.forEach((reply, i) => {
      console.log(`\n${i+1}. Target: Tweet ${reply.targetTweetId}`);
      console.log(`   Quality: ${reply.qualityScore}%`);
      console.log(`   Reply: "${reply.content.substring(0, 150)}..."`);
    });
  }
  
  // Test approval workflow
  if (queue.pending?.length > 0) {
    const firstReply = queue.pending[0];
    const approveResponse = await fetch(`http://localhost:5000/api/replies/${firstReply.id}/approve`, {
      method: 'POST'
    });
    
    if (approveResponse.ok) {
      console.log(`\nApproved reply ${firstReply.id} for posting queue`);
    }
  }
  
  // Final metrics
  const metricsResponse = await fetch('http://localhost:5000/api/metrics');
  const metrics = await metricsResponse.json();
  
  console.log(`\nPlatform Status:`);
  console.log(`- Total tweets processed: ${metrics.tweetsProcessed}`);
  console.log(`- AI responses: ${metrics.aiResponses}`);
  console.log(`- System ready for Twitter API integration`);
}

testFollowerStrategy();