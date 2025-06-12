import fetch from 'node-fetch';

async function testRealScraping() {
  console.log('Running follower-focused system with live crypto data...');
  
  // Clear existing data
  await fetch('http://localhost:5000/api/tweets', { method: 'DELETE' });
  await fetch('http://localhost:5000/api/ai-content', { method: 'DELETE' });
  
  // Get real trending keywords from live APIs
  const keywordsResponse = await fetch('http://localhost:5000/api/trending/keywords');
  const keywords = await keywordsResponse.json();
  
  console.log(`\nLive Trending Keywords (${keywords.length} found):`);
  keywords.slice(0, 8).forEach((k, i) => {
    console.log(`${i+1}. ${k.keyword.toUpperCase()} - Volume: ${k.volume}, Growth: ${k.growth.toFixed(1)}%, Sentiment: ${k.sentiment}`);
  });
  
  // Execute real scraping workflow with trending keywords
  console.log('\nStarting real scraping with 20+ replies targeting...');
  const scrapeResponse = await fetch('http://localhost:5000/api/trending/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minEngagement: 20 // Target tweets with at least 20 replies
    })
  });
  
  const scrapeResult = await scrapeResponse.json();
  console.log(`Targeting keywords: ${scrapeResult.keywords?.join(', ')}`);
  
  // Wait for the scraping to process
  console.log('Processing tweets and generating follower-attracting replies...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check what was found and processed
  const metricsResponse = await fetch('http://localhost:5000/api/metrics');
  const metrics = await metricsResponse.json();
  
  console.log(`\nProcessing Results:`);
  console.log(`- Tweets processed: ${metrics.tweetsProcessed}`);
  console.log(`- AI responses generated: ${metrics.aiResponses}`);
  console.log(`- Pending approvals: ${metrics.pendingApprovals}`);
  
  // Check the reply queue
  const queueResponse = await fetch('http://localhost:5000/api/replies/queue');
  const queue = await queueResponse.json();
  
  console.log(`\nReply Queue Status:`);
  console.log(`- Pending approval: ${queue.pending?.length || 0}`);
  console.log(`- Auto-approved: ${queue.approved?.length || 0}`);
  
  // Show generated replies
  const allReplies = [...(queue.pending || []), ...(queue.approved || [])];
  if (allReplies.length > 0) {
    console.log('\nGenerated Follower-Attracting Replies:');
    allReplies.forEach((reply, i) => {
      console.log(`\n${i+1}. Quality Score: ${reply.qualityScore}% | Status: ${reply.status}`);
      console.log(`   Target Tweet: ${reply.targetTweetId}`);
      console.log(`   Reply: "${reply.content}"`);
    });
    
    // Approve the best reply for demonstration
    if (queue.pending?.length > 0) {
      const bestReply = queue.pending[0];
      console.log(`\nApproving reply ${bestReply.id} for posting queue...`);
      
      const approveResponse = await fetch(`http://localhost:5000/api/replies/${bestReply.id}/approve`, {
        method: 'POST'
      });
      
      if (approveResponse.ok) {
        console.log('Reply approved and ready for Twitter API posting');
      }
    }
  } else {
    console.log('\nNo replies generated. This could be due to:');
    console.log('- No tweets found with 20+ replies in the scraped data');
    console.log('- OpenAI quota exceeded (system uses fallback reply generation)');
    console.log('- Rate limiting from target platforms');
  }
  
  // Check recent activities
  const activitiesResponse = await fetch('http://localhost:5000/api/activities');
  const activities = await activitiesResponse.json();
  
  console.log('\nRecent System Activities:');
  activities.slice(0, 5).forEach((activity, i) => {
    console.log(`${i+1}. ${activity.type}: ${activity.message}`);
  });
  
  // Final system status
  console.log('\nSystem Status:');
  console.log(`- Active workflows: ${metrics.activeWorkflows}`);
  console.log(`- Proxy success rate: ${metrics.proxySuccessRate}%`);
  console.log(`- Total system health: ${metrics.proxySuccessRate > 50 ? 'GOOD' : 'NEEDS ATTENTION'}`);
  
  console.log('\nNext Steps:');
  console.log('1. Add Twitter API credentials to enable automatic posting');
  console.log('2. Monitor reply queue for approval/rejection');
  console.log('3. Adjust targeting criteria based on results');
  console.log('4. Scale up with more proxy endpoints if needed');
}

testRealScraping();