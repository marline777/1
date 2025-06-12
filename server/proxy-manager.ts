import { storage } from "./storage";
import { InsertProxy } from "@shared/schema";

export class ProxyManager {
  private githubRepo = "marline777/proxscr_repli";
  private githubToken = process.env.GITHUB_TOKEN;
  private currentProxyIndex = 0;
  private proxies: any[] = [];

  async syncFromGitHub() {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/contents/proxies.json`, {
        headers: this.githubToken ? {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        } : {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const proxyList = JSON.parse(content);

      const syncedProxies = [];
      for (const proxyData of proxyList.proxies || []) {
        const proxyInfo: InsertProxy = {
          host: proxyData.host,
          port: proxyData.port,
          username: proxyData.username,
          password: proxyData.password,
          type: proxyData.type || 'http',
          country: proxyData.country,
          status: 'active'
        };

        const existingProxy = await storage.getProxyByHost(proxyData.host, proxyData.port);
        if (!existingProxy) {
          const proxy = await storage.createProxy(proxyInfo);
          syncedProxies.push(proxy);
        }
      }

      this.proxies = await storage.getAllProxies();
      
      return {
        synced: syncedProxies.length,
        total: this.proxies.length,
        message: `Synced ${syncedProxies.length} new proxies from GitHub`
      };
    } catch (error) {
      console.error('Failed to sync proxies from GitHub:', error);
      throw new Error(`Proxy sync failed: ${error.message}`);
    }
  }

  async getNextProxy() {
    if (this.proxies.length === 0) {
      this.proxies = await storage.getAllProxies();
    }

    if (this.proxies.length === 0) {
      throw new Error('No proxies available');
    }

    // Round-robin proxy selection
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;

    // Update last used timestamp
    await storage.updateProxyLastUsed(proxy.id);

    return proxy;
  }

  async markProxyFailed(proxyId: number) {
    await storage.incrementProxyFailures(proxyId);
    const proxy = await storage.getProxyById(proxyId);
    
    if (proxy && proxy.failureCount >= 5) {
      await storage.updateProxyStatus(proxyId, 'failed');
      // Remove from active rotation
      this.proxies = this.proxies.filter(p => p.id !== proxyId);
    }
  }

  async markProxySuccess(proxyId: number, responseTime: number) {
    await storage.updateProxyStats(proxyId, responseTime);
  }

  async testProxy(proxy: any): Promise<boolean> {
    try {
      const proxyUrl = `${proxy.type}://${proxy.username ? `${proxy.username}:${proxy.password}@` : ''}${proxy.host}:${proxy.port}`;
      
      // Test with a simple HTTP request
      const response = await fetch('https://httpbin.org/ip', {
        // @ts-ignore
        agent: proxyUrl,
        timeout: 10000
      });

      return response.ok;
    } catch (error) {
      console.error(`Proxy test failed for ${proxy.host}:${proxy.port}:`, error);
      return false;
    }
  }

  async rotateProxies() {
    const activeProxies = await storage.getActiveProxies();
    const healthyProxies = [];

    for (const proxy of activeProxies) {
      const isHealthy = await this.testProxy(proxy);
      if (isHealthy) {
        healthyProxies.push(proxy);
        await this.markProxySuccess(proxy.id, 0);
      } else {
        await this.markProxyFailed(proxy.id);
      }
    }

    this.proxies = healthyProxies;
    return {
      healthy: healthyProxies.length,
      total: activeProxies.length,
      rotated: Date.now()
    };
  }

  async getProxyStats() {
    return await storage.getProxyStats();
  }
}

export const proxyManager = new ProxyManager();
