import fetch from 'node-fetch';

async function testTrendingKeywords() {
  console.log('Testing trending crypto keyword discovery...');
  
  // Get trending keywords
  const keywordsResponse = await fetch('http://localhost:5000/api/trending/keywords');
  const keywords = await keywordsResponse.json();
  
  console.log(`Found ${keywords.length} trending crypto keywords:`);
  
  // Show top keywords by category
  const bullish = keywords.filter(k => k.sentiment === 'bullish').slice(0, 8);
  const highGrowth = keywords.filter(k => k.growth > 15).slice(0, 5);
  
  console.log('\nTop Bullish Keywords:');
  bullish.forEach((k, i) => {
    console.log(`${i+1}. ${k.keyword.toUpperCase()} - Volume: ${k.volume}, Growth: ${k.growth.toFixed(1)}%`);
  });
  
  console.log('\nHigh Growth Keywords:');
  highGrowth.forEach((k, i) => {
    console.log(`${i+1}. ${k.keyword.toUpperCase()} - Growth: ${k.growth.toFixed(1)}%, Source: ${k.source}`);
  });
  
  // Test scraping with trending keywords
  console.log('\nStarting targeted scraping with trending keywords...');
  
  const scrapeResponse = await fetch('http://localhost:5000/api/trending/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minEngagement: 200
    })
  });
  
  const scrapeResult = await scrapeResponse.json();
  console.log(`Scraping initiated with keywords: ${scrapeResult.keywords?.join(', ')}`);
  
  // Wait and check results
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const metricsResponse = await fetch('http://localhost:5000/api/metrics');
  const metrics = await metricsResponse.json();
  
  console.log(`\nScraping Results:`);
  console.log(`- Tweets processed: ${metrics.tweetsProcessed}`);
  console.log(`- AI responses generated: ${metrics.aiResponses}`);
  
  // Check reply queue
  const queueResponse = await fetch('http://localhost:5000/api/replies/queue');
  const queue = await queueResponse.json();
  
  console.log(`- Pending replies: ${queue.pending?.length || 0}`);
  console.log(`- Approved replies: ${queue.approved?.length || 0}`);
  
  if (queue.pending?.length > 0) {
    console.log('\nSample AI-generated replies:');
    queue.pending.slice(0, 2).forEach((reply, i) => {
      console.log(`${i+1}. Score: ${reply.qualityScore}% - "${reply.content.substring(0, 120)}..."`);
    });
  }
}

testTrendingKeywords();