// Test the modern scraper functionality
import fetch from 'node-fetch';

async function testScrapingWorkflow() {
  try {
    console.log('🚀 Starting crypto Twitter scraping workflow...');
    
    // Start the workflow
    const startResponse = await fetch('http://localhost:5000/api/workflows/1/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✓ Workflow started');
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get updated metrics
    const metricsResponse = await fetch('http://localhost:5000/api/metrics');
    const metrics = await metricsResponse.json();
    console.log('📊 Current Metrics:', metrics);
    
    // Get recent activities
    const activitiesResponse = await fetch('http://localhost:5000/api/activities');
    const activities = await activitiesResponse.json();
    console.log('\n📋 Recent Activities:');
    activities.slice(0, 5).forEach((activity, i) => {
      console.log(`${i + 1}. [${activity.status.toUpperCase()}] ${activity.message}`);
    });
    
    // Get AI content queue
    const aiResponse = await fetch('http://localhost:5000/api/ai-content');
    const aiContent = await aiResponse.json();
    console.log(`\n🤖 AI Generated Content: ${aiContent.length} items`);
    
    // Get proxy stats
    const proxyResponse = await fetch('http://localhost:5000/api/proxies/stats');
    const proxyStats = await proxyResponse.json();
    console.log('\n🌐 Proxy Status:', proxyStats);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testScrapingWorkflow();