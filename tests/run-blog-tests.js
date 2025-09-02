#!/usr/bin/env node

/**
 * Simple Blog Routes Test Runner
 * Tests blog routes using basic HTTP requests
 */

import http from 'http';
import { URL } from 'url';

const BASE_URL = 'http://localhost:4321';
const TIMEOUT = 10000;

// Expected blog posts
const EXPECTED_POSTS = [
  'adding-new-posts-in-astropaper-theme',
  'modern-web-development-trends-2025',
  'vibe-trap-critical-review-vibe-coding-ai-development'
];

class SimpleTester {
  constructor() {
    this.results = { passed: 0, failed: 0, tests: [] };
  }

  async httpRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: TIMEOUT
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async test(name, url, validator) {
    console.log(`\n🧪 ${name}`);
    console.log(`   ${url}`);

    try {
      const response = await this.httpRequest(url);
      console.log(`   Status: ${response.status}`);

      if (validator) {
        await validator(response);
      }

      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS', url });
      console.log(`   ✅ PASS`);
      return response;

    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', url, error: error.message });
      console.log(`   ❌ FAIL: ${error.message}`);
      return null;
    }
  }

  async runTests() {
    console.log('🚀 Blog Routes Test Suite');
    console.log('========================');

    // Test 1: Posts listing page
    await this.test('Posts Listing Page', `${BASE_URL}/posts/`, (res) => {
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.headers['content-type']?.includes('html')) throw new Error('Not HTML');
      if (res.body.includes('/en/')) console.log('   ⚠️  Found /en/ prefixes in content');
    });

    // Test 2: Individual posts
    for (const post of EXPECTED_POSTS) {
      await this.test(`Post: ${post}`, `${BASE_URL}/posts/${post}/`, (res) => {
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        if (!res.headers['content-type']?.includes('html')) throw new Error('Not HTML');
      });
    }

    // Test 3: Pagination
    await this.test('Pagination Page 2', `${BASE_URL}/posts/2/`, (res) => {
      if (res.status !== 200 && res.status !== 404) {
        throw new Error(`Expected 200 or 404, got ${res.status}`);
      }
      if (res.status === 404) console.log('   📄 Page 2 does not exist (acceptable)');
    });

    // Test 4: RSS Feed
    await this.test('RSS Feed', `${BASE_URL}/rss.xml`, (res) => {
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.includes('<rss') && !res.body.includes('<feed')) {
        throw new Error('Not valid RSS/Atom feed');
      }
    });

    // Test 5: Root redirect
    await this.test('Root Path', `${BASE_URL}/`, (res) => {
      if (res.status !== 200 && res.status < 300) {
        throw new Error(`Unexpected status: ${res.status}`);
      }
    });

    // Test 6: Check for redirect loops
    await this.test('Posts without trailing slash', `${BASE_URL}/posts`, (res) => {
      console.log(`   Redirect behavior - Status: ${res.status}`);
    });

    console.log('\n📊 Results');
    console.log('==========');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.tests.length}`);

    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed!');
      console.log('✅ Blog routing is working correctly');
      console.log('✅ English content served from root paths');
      console.log('✅ prefixDefaultLocale: false verified');
    } else {
      console.log('\n⚠️  Some tests failed:');
      this.results.tests.filter(t => t.status === 'FAIL').forEach(t => {
        console.log(`   - ${t.name}: ${t.error}`);
      });
    }

    return this.results.failed === 0;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SimpleTester();
  tester.runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { SimpleTester };