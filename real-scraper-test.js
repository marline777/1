import fetch from 'node-fetch';

async function testRealScraping() {
  console.log('Testing REAL scraping without demo content...');
  
  // Test Reddit cryptocurrency subreddit
  try {
    console.log('Scraping Reddit r/cryptocurrency...');
    const redditResponse = await fetch('https://www.reddit.com/r/cryptocurrency/new.json?limit=25', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (redditResponse.ok) {
      const redditData = await redditResponse.json();
      console.log(`Found ${redditData.data.children.length} posts on Reddit`);
      
      // Process actual Reddit posts
      const cryptoPosts = redditData.data.children
        .filter(post => {
          const title = post.data.title.toLowerCase();
          return title.includes('bitcoin') || title.includes('crypto') || title.includes('ethereum') || title.includes('defi');
        })
        .slice(0, 5);
      
      console.log('Relevant crypto posts found:');
      cryptoPosts.forEach((post, i) => {
        const p = post.data;
        console.log(`${i+1}. "${p.title}" (${p.ups} upvotes, ${p.num_comments} comments)`);
      });
      
      // Store real Reddit data
      for (const post of cryptoPosts) {
        const p = post.data;
        await fetch('http://localhost:5000/api/tweets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tweetId: `reddit_${p.id}`,
            text: p.title + (p.selftext ? ` ${p.selftext.substring(0, 200)}` : ''),
            author: p.author,
            username: p.author,
            replyCount: p.num_comments || 0,
            likes: p.ups || 0,
            retweets: 0,
            engagementScore: String(p.ups + p.num_comments),
            mediaUrls: [],
            workflowId: 1
          })
        });
      }
    }
  } catch (error) {
    console.error('Reddit scraping failed:', error.message);
  }

  // Test Twitter web scraping approach
  try {
    console.log('\nTesting Twitter web scraping...');
    const twitterSearchUrl = 'https://mobile.twitter.com/search?q=bitcoin&src=typed_query&f=live';
    
    const twitterResponse = await fetch(twitterSearchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    if (twitterResponse.ok) {
      const html = await twitterResponse.text();
      console.log(`Twitter response received (${html.length} characters)`);
      
      // Look for common Twitter patterns in HTML
      const hasTweets = html.includes('tweet') || html.includes('timeline') || html.includes('status');
      console.log(`Twitter content detected: ${hasTweets}`);
    }
  } catch (error) {
    console.error('Twitter scraping test failed:', error.message);
  }

  // Check final metrics
  setTimeout(async () => {
    try {
      const metrics = await fetch('http://localhost:5000/api/metrics');
      const data = await metrics.json();
      console.log('\nFinal metrics after real scraping:');
      console.log(`- Tweets processed: ${data.tweetsProcessed}`);
      console.log(`- AI responses: ${data.aiResponses}`);
      
      const activities = await fetch('http://localhost:5000/api/activities');
      const activityData = await activities.json();
      console.log(`- Activities logged: ${activityData.length}`);
    } catch (error) {
      console.error('Failed to get final metrics:', error.message);
    }
  }, 3000);
}

testRealScraping();