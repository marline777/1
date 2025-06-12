import fetch from 'node-fetch';

async function testTrendingWorkflow() {
  console.log('Testing trending tweet scraping and reply generation...');
  
  // Clear existing data
  await fetch('http://localhost:5000/api/tweets', { method: 'DELETE' });
  await fetch('http://localhost:5000/api/ai-content', { method: 'DELETE' });
  
  // Test the trending scraping workflow
  const response = await fetch('http://localhost:5000/api/trending/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchTerms: ['bitcoin', 'ethereum', 'defi', 'solana', 'altcoin'],
      minEngagement: 150
    })
  });
  
  if (response.ok) {
    console.log('Trending scrape initiated successfully');
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check results
    const metricsResponse = await fetch('http://localhost:5000/api/metrics');
    const metrics = await metricsResponse.json();
    
    const queueResponse = await fetch('http://localhost:5000/api/replies/queue');
    const queue = await queueResponse.json();
    
    console.log(`\nResults:`);
    console.log(`- Tweets scraped: ${metrics.tweetsProcessed}`);
    console.log(`- Replies generated: ${queue.pending?.length || 0} pending approval`);
    console.log(`- High-quality replies: ${queue.approved?.length || 0} ready to post`);
    
    // Show sample content
    if (queue.pending?.length > 0) {
      console.log('\nSample generated replies:');
      queue.pending.slice(0, 3).forEach((reply, i) => {
        console.log(`${i+1}. Quality: ${reply.qualityScore}% - "${reply.content.substring(0, 100)}..."`);
      });
    }
    
    // Test approval workflow
    if (queue.pending?.length > 0) {
      const firstReply = queue.pending[0];
      const approveResponse = await fetch(`http://localhost:5000/api/replies/${firstReply.id}/approve`, {
        method: 'POST'
      });
      
      if (approveResponse.ok) {
        console.log(`\nApproved reply ${firstReply.id} for posting`);
      }
    }
    
  } else {
    console.log('Failed to start trending scrape');
  }
}

testTrendingWorkflow();