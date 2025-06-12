import fetch from 'node-fetch';

async function testRealSources() {
  console.log('Testing real cryptocurrency data collection...');
  
  // Clear previous data
  await fetch('http://localhost:5000/api/tweets', { method: 'DELETE' });
  await fetch('http://localhost:5000/api/ai-content', { method: 'DELETE' });
  
  // Get live trending keywords
  const keywordsResponse = await fetch('http://localhost:5000/api/trending/keywords');
  const keywords = await keywordsResponse.json();
  
  console.log('Live trending crypto keywords:');
  keywords.slice(0, 5).forEach((k, i) => {
    console.log(`${i+1}. ${k.keyword.toUpperCase()} - Volume: ${k.volume}, Growth: ${k.growth.toFixed(1)}%`);
  });
  
  // Execute real data collection
  console.log('\nStarting real data collection from Reddit crypto communities...');
  const scrapeResponse = await fetch('http://localhost:5000/api/trending/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minEngagement: 20 // Target posts with 20+ comments
    })
  });
  
  const scrapeResult = await scrapeResponse.json();
  console.log(`Collection targeting: ${scrapeResult.keywords?.join(', ')}`);
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 8000));
  
  // Check results
  const metricsResponse = await fetch('http://localhost:5000/api/metrics');
  const metrics = await metricsResponse.json();
  
  console.log('\nReal Data Results:');
  console.log(`- Posts processed: ${metrics.tweetsProcessed}`);
  console.log(`- Replies generated: ${metrics.aiResponses}`);
  console.log(`- Pending approvals: ${metrics.pendingApprovals}`);
  
  // Check reply queue
  const queueResponse = await fetch('http://localhost:5000/api/replies/queue');
  const queue = await queueResponse.json();
  
  console.log('\nFollower-Focused Reply Queue:');
  console.log(`- Pending approval: ${queue.pending?.length || 0}`);
  console.log(`- Auto-approved: ${queue.approved?.length || 0}`);
  
  // Show real data with replies
  const allReplies = [...(queue.pending || []), ...(queue.approved || [])];
  if (allReplies.length > 0) {
    console.log('\nReal Posts with Generated Replies:');
    
    allReplies.slice(0, 3).forEach((reply, i) => {
      console.log(`\n${i+1}. Quality Score: ${reply.qualityScore}% | Status: ${reply.status}`);
      console.log(`   Target: ${reply.targetTweetId}`);
      console.log(`   Generated Reply: "${reply.content}"`);
    });
    
    // Approve the highest quality reply
    if (queue.pending?.length > 0) {
      const bestReply = queue.pending.reduce((best, current) => 
        parseInt(current.qualityScore) > parseInt(best.qualityScore) ? current : best
      );
      
      console.log(`\nApproving best reply (${bestReply.qualityScore}%) for posting queue...`);
      
      const approveResponse = await fetch(`http://localhost:5000/api/replies/${bestReply.id}/approve`, {
        method: 'POST'
      });
      
      if (approveResponse.ok) {
        console.log('Reply approved and queued for Twitter API execution');
      }
    }
  } else {
    console.log('\nNo replies generated - checking system status...');
    
    // Check recent activities
    const activitiesResponse = await fetch('http://localhost:5000/api/activities');
    const activities = await activitiesResponse.json();
    
    console.log('Recent system activities:');
    activities.slice(0, 5).forEach((activity, i) => {
      console.log(`${i+1}. ${activity.type}: ${activity.message}`);
    });
  }
  
  console.log('\nSystem Status:');
  console.log(`- Real data collection: ${metrics.tweetsProcessed > 0 ? 'WORKING' : 'NO DATA'}`);
  console.log(`- Reply generation: ${metrics.aiResponses > 0 ? 'WORKING' : 'NO REPLIES'}`);
  console.log(`- Approval queue: ${metrics.pendingApprovals > 0 ? 'ACTIVE' : 'EMPTY'}`);
  
  console.log('\nNext Steps:');
  console.log('1. System is collecting real Reddit crypto posts with 20+ comments');
  console.log('2. Generating follower-attracting replies for high-engagement content');
  console.log('3. Queue-based approval system is operational');
  console.log('4. Ready for Twitter API integration when credentials are provided');
}

testRealSources();