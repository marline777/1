import fetch from 'node-fetch';

async function testCompleteWorkflow() {
  console.log('Testing Complete Social Media Automation Workflow');
  console.log('================================================');
  
  // Clear previous data for clean test
  await fetch('http://localhost:5000/api/tweets', { method: 'DELETE' });
  await fetch('http://localhost:5000/api/ai-content', { method: 'DELETE' });
  
  // Step 1: Discover trending cryptocurrency topics
  console.log('\n1. DISCOVERING TRENDING TOPICS FROM REDDIT');
  console.log('-------------------------------------------');
  
  const keywordsResponse = await fetch('http://localhost:5000/api/trending/keywords');
  const trendingKeywords = await keywordsResponse.json();
  
  console.log('Live trending crypto keywords from CoinGecko:');
  trendingKeywords.slice(0, 5).forEach((k, i) => {
    console.log(`   ${i+1}. ${k.keyword.toUpperCase()} - Volume: ${k.volume}, Growth: ${k.growth.toFixed(1)}%`);
  });
  
  // Step 2: Execute complete workflow (Reddit trends → Twitter posts → Replies)
  console.log('\n2. EXECUTING REDDIT → TWITTER WORKFLOW');
  console.log('--------------------------------------');
  
  const workflowResponse = await fetch('http://localhost:5000/api/trending/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minEngagement: 10 // Target posts with 10+ replies
    })
  });
  
  if (workflowResponse.ok) {
    const result = await workflowResponse.json();
    console.log('Workflow initiated for keywords:', result.keywords?.slice(0, 5).join(', '));
  }
  
  // Wait for processing
  console.log('\nProcessing Reddit trends and finding Twitter posts...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // Step 3: Check results
  console.log('\n3. WORKFLOW RESULTS');
  console.log('-------------------');
  
  const metricsResponse = await fetch('http://localhost:5000/api/metrics');
  const metrics = await metricsResponse.json();
  
  console.log(`Posts processed: ${metrics.tweetsProcessed}`);
  console.log(`Replies generated: ${metrics.aiResponses}`);
  console.log(`Pending approvals: ${metrics.pendingApprovals}`);
  
  // Step 4: Examine generated replies
  const queueResponse = await fetch('http://localhost:5000/api/replies/queue');
  const queue = await queueResponse.json();
  
  console.log('\n4. GENERATED TWITTER REPLIES');
  console.log('-----------------------------');
  console.log(`Pending approval: ${queue.pending?.length || 0}`);
  console.log(`Auto-approved: ${queue.approved?.length || 0}`);
  
  const allReplies = [...(queue.pending || []), ...(queue.approved || [])];
  if (allReplies.length > 0) {
    console.log('\nFollower-attracting replies generated:');
    
    allReplies.slice(0, 3).forEach((reply, i) => {
      console.log(`\n   ${i+1}. Quality Score: ${reply.qualityScore}% | Status: ${reply.status}`);
      console.log(`      Target Tweet: ${reply.targetTweetId}`);
      console.log(`      Reply: "${reply.content}"`);
    });
    
    // Approve highest quality reply
    if (queue.pending?.length > 0) {
      const bestReply = queue.pending.reduce((best, current) => 
        parseInt(current.qualityScore) > parseInt(best.qualityScore) ? current : best
      );
      
      console.log(`\n   Approving best reply (${bestReply.qualityScore}%) for Twitter posting...`);
      
      await fetch(`http://localhost:5000/api/replies/${bestReply.id}/approve`, {
        method: 'POST'
      });
      
      console.log('   Reply approved and queued for Twitter API execution');
    }
  } else {
    console.log('\nNo replies generated yet - checking system activity...');
  }
  
  // Step 5: System activity log
  const activitiesResponse = await fetch('http://localhost:5000/api/activities');
  const activities = await activitiesResponse.json();
  
  console.log('\n5. SYSTEM ACTIVITY LOG');
  console.log('----------------------');
  activities.slice(0, 5).forEach((activity, i) => {
    const timestamp = new Date(activity.createdAt).toLocaleTimeString();
    console.log(`   ${timestamp} - ${activity.type}: ${activity.message}`);
  });
  
  // Step 6: Final status
  console.log('\n6. SYSTEM STATUS SUMMARY');
  console.log('========================');
  
  const systemStatus = {
    trendDiscovery: trendingKeywords.length > 0 ? 'OPERATIONAL' : 'OFFLINE',
    dataCollection: metrics.tweetsProcessed > 0 ? 'ACTIVE' : 'READY',
    replyGeneration: metrics.aiResponses > 0 ? 'GENERATING' : 'STANDBY',
    approvalQueue: metrics.pendingApprovals > 0 ? 'PROCESSING' : 'READY',
    twitterIntegration: 'READY FOR API KEYS'
  };
  
  Object.entries(systemStatus).forEach(([component, status]) => {
    const statusIcon = status.includes('OPERATIONAL') || status.includes('ACTIVE') || status.includes('GENERATING') ? '✓' : '→';
    console.log(`   ${statusIcon} ${component}: ${status}`);
  });
  
  console.log('\nWorkflow Explanation:');
  console.log('1. Reddit cryptocurrency communities → Discover trending topics');
  console.log('2. Search Twitter for posts about those trending topics');  
  console.log('3. Generate follower-attracting replies for Twitter posts');
  console.log('4. Queue replies for manual approval to avoid detection');
  console.log('5. Ready for Twitter API integration to post approved replies');
  
  if (allReplies.length === 0) {
    console.log('\nNote: No replies generated in this test run.');
    console.log('This could indicate Twitter post discovery needs refinement or');
    console.log('the engagement thresholds are too high for current test data.');
  }
}

testCompleteWorkflow();