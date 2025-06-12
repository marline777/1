import fetch from 'node-fetch';

async function collectRealData() {
  console.log('Collecting real crypto data...');
  
  // Test multiple Reddit crypto subreddits
  const subreddits = ['CryptoCurrency', 'Bitcoin', 'ethereum', 'CryptoMarkets'];
  let totalFound = 0;
  
  for (const sub of subreddits) {
    try {
      const url = `https://www.reddit.com/r/${sub}/new.json?limit=10`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CryptoScraper/1.0)'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const posts = data.data?.children || [];
        
        console.log(`r/${sub}: Found ${posts.length} posts`);
        
        for (const post of posts.slice(0, 3)) {
          const p = post.data;
          console.log(`- "${p.title}" (${p.ups} ups, ${p.num_comments} comments)`);
          
          // Store in database
          try {
            await fetch('http://localhost:5000/api/tweets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tweetId: `reddit_${p.id}`,
                text: p.title,
                author: p.author,
                username: p.author,
                replyCount: p.num_comments,
                likes: p.ups,
                retweets: 0,
                engagementScore: String(p.ups + p.num_comments),
                mediaUrls: [],
                workflowId: 1
              })
            });
            totalFound++;
          } catch (err) {
            console.log(`Failed to store: ${err.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`Failed r/${sub}: ${error.message}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\nStored ${totalFound} real posts in database`);
  
  // Check what we actually collected
  setTimeout(async () => {
    const metrics = await fetch('http://localhost:5000/api/metrics');
    const data = await metrics.json();
    console.log('Database now contains:', data);
  }, 2000);
}

collectRealData();