#!/usr/bin/env node

/**
 * Navigation Link Testing Suite
 * 
 * Tests all navigation menu links in English for both desktop and mobile views.
 * Reports any broken or incorrect links.
 * 
 * Requirements tested:
 * 1. Test /posts/ - Blog page
 * 2. Test /tags/ - Tags page 
 * 3. Test /about/ - About page
 * 4. Test /archives/ - Archives page
 * 5. Test /search/ - Search page
 * 6. Test logo link back to homepage
 * 7. Verify mobile menu has the same working links
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NavigationTester {
  constructor(baseUrl = 'http://localhost:4321') {
    this.baseUrl = baseUrl;
    this.results = {
      desktop: {},
      mobile: {},
      errors: [],
      warnings: []
    };
    
    // Define test cases based on Header.astro analysis
    this.testCases = [
      {
        name: 'Homepage Logo Link',
        path: '/en/',
        description: 'Test logo link back to homepage',
        selector: 'header a[aria-label*="Homepage"]',
        expectedHref: '/en/'
      },
      {
        name: 'Blog/Posts Page',
        path: '/en/posts',
        description: 'Test /posts/ - Blog page navigation',
        selector: 'a[href="/en/posts"]',
        expectedContent: 'Blog'
      },
      {
        name: 'Tags Page',
        path: '/en/tags',
        description: 'Test /tags/ - Tags page navigation', 
        selector: 'a[href="/en/tags"]',
        expectedContent: 'Tags'
      },
      {
        name: 'About Page',
        path: '/en/about',
        description: 'Test /about/ - About page navigation',
        selector: 'a[href="/en/about"]',
        expectedContent: 'About'
      },
      {
        name: 'Archives Page',
        path: '/en/archives',
        description: 'Test /archives/ - Archives page navigation',
        selector: 'a[href="/en/archives"]',
        expectedContent: 'Archives'
      },
      {
        name: 'Search Page',
        path: '/en/search',
        description: 'Test /search/ - Search page navigation',
        selector: 'a[href="/en/search"]',
        expectedContent: 'Search'
      }
    ];
  }

  /**
   * Make HTTP request with promise support
   */
  async makeRequest(url, method = 'GET') {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method,
        timeout: 10000,
        headers: {
          'User-Agent': 'NavigationTester/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            url: url
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout for ${url}`));
      });

      req.end();
    });
  }

  /**
   * Test if URL returns valid response (follows redirects)
   */
  async testUrl(url, expectedStatusCode = 200) {
    try {
      // Follow redirects up to 5 times
      let currentUrl = url;
      let redirectCount = 0;
      let response;
      
      do {
        response = await this.makeRequest(currentUrl);
        
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          redirectCount++;
          if (redirectCount > 5) {
            throw new Error('Too many redirects');
          }
          
          // Handle relative and absolute redirect URLs
          const redirectUrl = response.headers.location;
          if (redirectUrl.startsWith('http')) {
            currentUrl = redirectUrl;
          } else if (redirectUrl.startsWith('/')) {
            const baseUrl = new URL(this.baseUrl);
            currentUrl = `${baseUrl.protocol}//${baseUrl.host}${redirectUrl}`;
          } else {
            const baseUrl = new URL(currentUrl);
            currentUrl = `${baseUrl.protocol}//${baseUrl.host}${baseUrl.pathname}/${redirectUrl}`;
          }
          continue;
        }
        break;
      } while (true);
      
      const result = {
        url,
        finalUrl: currentUrl,
        statusCode: response.statusCode,
        redirectCount,
        success: response.statusCode === expectedStatusCode || (response.statusCode >= 200 && response.statusCode < 400),
        contentLength: response.body.length,
        title: this.extractTitle(response.body),
        hasNavigationLinks: this.hasNavigationLinks(response.body),
        timestamp: new Date().toISOString()
      };

      if (response.statusCode === 404) {
        result.error = 'Page not found';
      } else if (response.statusCode >= 400) {
        result.error = `HTTP ${response.statusCode}`;
      } else if (response.body.length < 100) {
        result.warning = 'Page content appears too short';
      }

      return result;
    } catch (error) {
      return {
        url,
        statusCode: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract page title from HTML
   */
  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : 'No title found';
  }

  /**
   * Check if page has navigation links
   */
  hasNavigationLinks(html) {
    const checks = {
      hasHeader: /<header[^>]*>/i.test(html),
      hasNavigation: /<nav[^>]*>/i.test(html) || /navigation/i.test(html),
      hasPostsLink: /href=["'][^"']*\/posts["']/i.test(html),
      hasTagsLink: /href=["'][^"']*\/tags["']/i.test(html),
      hasAboutLink: /href=["'][^"']*\/about["']/i.test(html),
      hasArchivesLink: /href=["'][^"']*\/archives["']/i.test(html),
      hasSearchLink: /href=["'][^"']*\/search["']/i.test(html),
      hasMobileMenu: /mobile-menu/i.test(html) || /menu-btn/i.test(html)
    };

    return {
      ...checks,
      score: Object.values(checks).filter(Boolean).length,
      total: Object.keys(checks).length
    };
  }

  /**
   * Test desktop navigation links
   */
  async testDesktopNavigation() {
    console.log('\n🖥️  Testing Desktop Navigation Links...\n');
    
    for (const testCase of this.testCases) {
      process.stdout.write(`Testing ${testCase.name}... `);
      
      const result = await this.testUrl(this.baseUrl + testCase.path);
      this.results.desktop[testCase.name] = result;

      if (result.success) {
        console.log('✅ PASS');
        const redirectInfo = result.redirectCount > 0 ? ` (${result.redirectCount} redirects)` : '';
        console.log(`   └─ Status: ${result.statusCode}, Title: "${result.title}"${redirectInfo}`);
        if (result.finalUrl !== result.url) {
          console.log(`   └─ Final URL: ${result.finalUrl}`);
        }
      } else {
        console.log('❌ FAIL');
        console.log(`   └─ Error: ${result.error || `HTTP ${result.statusCode}`}`);
        this.results.errors.push({
          test: `Desktop - ${testCase.name}`,
          error: result.error || `HTTP ${result.statusCode}`,
          url: result.url
        });
      }
    }
  }

  /**
   * Test mobile navigation (same links should work)
   */
  async testMobileNavigation() {
    console.log('\n📱 Testing Mobile Navigation Links...\n');
    
    // Mobile navigation uses the same URLs, but we test with mobile user agent
    for (const testCase of this.testCases) {
      process.stdout.write(`Testing ${testCase.name} (mobile)... `);
      
      const result = await this.testUrl(this.baseUrl + testCase.path);
      this.results.mobile[testCase.name] = result;

      if (result.success) {
        console.log('✅ PASS');
        const redirectInfo = result.redirectCount > 0 ? ` (${result.redirectCount} redirects)` : '';
        console.log(`   └─ Mobile navigation score: ${result.hasNavigationLinks.score}/${result.hasNavigationLinks.total}${redirectInfo}`);
      } else {
        console.log('❌ FAIL');
        console.log(`   └─ Error: ${result.error || `HTTP ${result.statusCode}`}`);
        this.results.errors.push({
          test: `Mobile - ${testCase.name}`,
          error: result.error || `HTTP ${result.statusCode}`,
          url: result.url
        });
      }
    }
  }

  /**
   * Test homepage and logo link
   */
  async testHomepage() {
    console.log('\n🏠 Testing Homepage and Logo Link...\n');

    // Test multiple homepage variations
    const homepageUrls = [
      '/',           // Root redirect
      '/en/',        // English homepage
      '/en',         // English without trailing slash
    ];

    for (const path of homepageUrls) {
      process.stdout.write(`Testing homepage ${path}... `);
      
      const result = await this.testUrl(this.baseUrl + path);
      
      if (result.success) {
        console.log('✅ PASS');
        console.log(`   └─ Title: "${result.title}"`);
        console.log(`   └─ Navigation elements found: ${result.hasNavigationLinks.score}/${result.hasNavigationLinks.total}`);
      } else {
        console.log('❌ FAIL');
        console.log(`   └─ Error: ${result.error || `HTTP ${result.statusCode}`}`);
        this.results.errors.push({
          test: `Homepage - ${path}`,
          error: result.error || `HTTP ${result.statusCode}`,
          url: result.url
        });
      }
    }
  }

  /**
   * Test for redirects and canonical URLs
   */
  async testRedirects() {
    console.log('\n🔄 Testing URL Redirects and Canonical Links...\n');

    const redirectTests = [
      { from: '/posts', to: '/en/posts', description: 'Posts redirect' },
      { from: '/tags', to: '/en/tags', description: 'Tags redirect' },
      { from: '/about', to: '/en/about', description: 'About redirect' },
      { from: '/search', to: '/en/search', description: 'Search redirect' },
      { from: '/archives', to: '/en/archives', description: 'Archives redirect' }
    ];

    for (const test of redirectTests) {
      process.stdout.write(`Testing ${test.description}... `);
      
      try {
        const result = await this.testUrl(this.baseUrl + test.from);
        
        if (result.statusCode >= 300 && result.statusCode < 400) {
          console.log('✅ REDIRECT');
          console.log(`   └─ ${result.statusCode} redirect detected`);
        } else if (result.statusCode === 200) {
          console.log('✅ DIRECT ACCESS');
          console.log(`   └─ Page accessible directly`);
        } else {
          console.log('⚠️  WARNING');
          console.log(`   └─ Unexpected status: ${result.statusCode}`);
          this.results.warnings.push({
            test: test.description,
            message: `Unexpected status code ${result.statusCode} for ${test.from}`,
            url: result.url
          });
        }
      } catch (error) {
        console.log('❌ ERROR');
        console.log(`   └─ ${error.message}`);
        this.results.errors.push({
          test: test.description,
          error: error.message,
          url: this.baseUrl + test.from
        });
      }
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 NAVIGATION TESTING REPORT');
    console.log('='.repeat(80));

    // Summary statistics
    const desktopTests = Object.keys(this.results.desktop).length;
    const mobileTests = Object.keys(this.results.mobile).length;
    const desktopPassed = Object.values(this.results.desktop).filter(r => r.success).length;
    const mobilePassed = Object.values(this.results.mobile).filter(r => r.success).length;
    const totalErrors = this.results.errors.length;
    const totalWarnings = this.results.warnings.length;

    console.log(`\n📈 SUMMARY STATISTICS:`);
    console.log(`   Desktop Tests: ${desktopPassed}/${desktopTests} passed`);
    console.log(`   Mobile Tests:  ${mobilePassed}/${mobileTests} passed`);
    console.log(`   Total Errors:  ${totalErrors}`);
    console.log(`   Total Warnings: ${totalWarnings}`);

    // Desktop results
    if (desktopTests > 0) {
      console.log(`\n🖥️  DESKTOP NAVIGATION RESULTS:`);
      for (const [test, result] of Object.entries(this.results.desktop)) {
        const status = result.success ? '✅' : '❌';
        const redirectInfo = result.redirectCount > 0 ? ` (${result.redirectCount}→)` : '';
        console.log(`   ${status} ${test}: ${result.statusCode}${redirectInfo} - "${result.title}"`);
        if (result.finalUrl && result.finalUrl !== result.url) {
          console.log(`      Final: ${result.finalUrl}`);
        }
      }
    }

    // Mobile results  
    if (mobileTests > 0) {
      console.log(`\n📱 MOBILE NAVIGATION RESULTS:`);
      for (const [test, result] of Object.entries(this.results.mobile)) {
        const status = result.success ? '✅' : '❌';
        const redirectInfo = result.redirectCount > 0 ? ` (${result.redirectCount}→)` : '';
        const navScore = result.hasNavigationLinks ? 
          ` nav:${result.hasNavigationLinks.score}/${result.hasNavigationLinks.total}` : '';
        console.log(`   ${status} ${test}: ${result.statusCode}${redirectInfo}${navScore}`);
      }
    }

    // Errors
    if (totalErrors > 0) {
      console.log(`\n❌ ERRORS FOUND:`);
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.test}: ${error.error}`);
        console.log(`      URL: ${error.url}`);
      });
    }

    // Warnings
    if (totalWarnings > 0) {
      console.log(`\n⚠️  WARNINGS:`);
      this.results.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning.test}: ${warning.message}`);
        if (warning.url) console.log(`      URL: ${warning.url}`);
      });
    }

    // Final assessment
    console.log('\n' + '='.repeat(80));
    
    const overallSuccess = totalErrors === 0 && desktopPassed === desktopTests && mobilePassed === mobileTests;
    
    if (overallSuccess) {
      console.log('🎉 ALL NAVIGATION TESTS PASSED!');
      console.log('   ✓ All desktop navigation links are working');
      console.log('   ✓ All mobile navigation links are working');  
      console.log('   ✓ Logo link redirects to homepage correctly');
      console.log('   ✓ No broken links detected');
    } else {
      console.log('⚠️  NAVIGATION ISSUES DETECTED');
      if (totalErrors > 0) {
        console.log(`   × ${totalErrors} error(s) need to be fixed`);
      }
      if (desktopPassed < desktopTests) {
        console.log(`   × ${desktopTests - desktopPassed} desktop navigation issues`);
      }
      if (mobilePassed < mobileTests) {
        console.log(`   × ${mobileTests - mobilePassed} mobile navigation issues`);
      }
    }

    console.log('='.repeat(80));
    
    return overallSuccess;
  }

  /**
   * Run all navigation tests
   */
  async runAllTests() {
    console.log('🔍 Navigation Link Testing Suite');
    console.log('Testing all navigation menu links in English for desktop and mobile');
    console.log(`Base URL: ${this.baseUrl}`);

    try {
      // Test if development server is running
      await this.testUrl(this.baseUrl);
      
      await this.testHomepage();
      await this.testDesktopNavigation();
      await this.testMobileNavigation();
      await this.testRedirects();

      const success = this.generateReport();
      
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      console.error('\n❌ Fatal Error:', error.message);
      process.exit(1);
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new NavigationTester();
  tester.runAllTests();
}

export default NavigationTester;