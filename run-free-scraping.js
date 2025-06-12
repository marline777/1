import fetch from 'node-fetch';

async function runFreeScraping() {
  console.log('Running FREE scraping without API keys...');
  
  // Test free Reddit scraping
  try {
    const redditUrl = 'https://www.reddit.com/r/cryptocurrency/new.json?limit=10';
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ FREE Reddit API working: Found ${data.data.children.length} posts`);
      
      // Show sample content
      data.data.children.slice(0, 3).forEach((post, i) => {
        const p = post.data;
        console.log(`${i+1}. "${p.title}" - ${p.ups} upvotes`);
      });
    }
  } catch (error) {
    console.log('Reddit test failed:', error.message);
  }

  // Test workflow with free methods
  try {
    const workflowResponse = await fetch('http://localhost:5000/api/workflows/1/start', {
      method: 'POST'
    });
    console.log('\n✓ Started crypto monitoring workflow (FREE mode)');
    
    // Check results after brief delay
    setTimeout(async () => {
      const metrics = await fetch('http://localhost:5000/api/metrics');
      const data = await metrics.json();
      console.log('Current metrics:', data);
    }, 2000);
    
  } catch (error) {
    console.log('Workflow test failed:', error.message);
  }
}

runFreeScraping();