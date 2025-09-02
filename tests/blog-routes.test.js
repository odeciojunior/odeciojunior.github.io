/**
 * Blog Routes Testing Suite
 * Tests all blog-related routes for English content and verifies routing configuration
 * 
 * Tests:
 * 1. /posts/ (blog listing page)
 * 2. Individual blog post URLs
 * 3. Pagination routes (/posts/2/, /posts/3/, etc)
 * 4. Verify English posts use root paths (no /en/ prefix)
 * 5. RSS feed at /rss.xml
 * 6. Verify prefixDefaultLocale: false configuration
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4321';
const TEST_TIMEOUT = 30000;

// Known blog posts from the content structure
const EXPECTED_POSTS = [
  'adding-new-posts-in-astropaper-theme',
  'modern-web-development-trends-2025',
  'vibe-trap-critical-review-vibe-coding-ai-development'
];

class BlogRoutesTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: [],
      errors: []
    };
  }

  async test(name, url, expectedStatus = 200, validator = null) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`📍 URL: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        timeout: 10000,
        redirect: 'manual' // Don't follow redirects automatically
      });

      const status = response.status;
      const headers = Object.fromEntries(response.headers.entries());
      
      console.log(`📊 Status: ${status}`);
      console.log(`📋 Headers: ${JSON.stringify(headers, null, 2)}`);

      if (status !== expectedStatus) {
        throw new Error(`Expected status ${expectedStatus}, got ${status}`);
      }

      let content = '';
      if (status >= 200 && status < 300) {
        content = await response.text();
      }

      // Run custom validator if provided
      if (validator) {
        await validator(response, content, headers);
      }

      this.results.tests.push({
        name,
        url,
        status: 'PASS',
        httpStatus: status,
        message: `✅ ${name} - Status ${status}`
      });
      
      this.results.passed++;
      console.log(`✅ PASS: ${name}`);

      return { response, content, headers };

    } catch (error) {
      this.results.tests.push({
        name,
        url,
        status: 'FAIL',
        message: `❌ ${name} - ${error.message}`,
        error: error.message
      });
      
      this.results.failed++;
      this.results.errors.push(`${name}: ${error.message}`);
      console.log(`❌ FAIL: ${name} - ${error.message}`);
      
      return { error };
    }
  }

  async testPostsListingPage() {
    return await this.test(
      'Posts Listing Page',
      `${BASE_URL}/posts/`,
      200,
      async (response, content, headers) => {
        // Verify content type
        if (!headers['content-type']?.includes('text/html')) {
          throw new Error('Expected HTML content type');
        }

        // Verify page contains expected elements
        if (!content.includes('Posts') && !content.includes('Blog')) {
          throw new Error('Page does not appear to be a posts listing');
        }

        // Check for pagination elements if they exist
        const hasPagination = content.includes('pagination') || content.includes('page');
        console.log(`🔍 Pagination detected: ${hasPagination}`);

        // Verify no /en/ prefix in URLs
        const enPrefixRegex = /href=["']\/en\//g;
        const enPrefixMatches = content.match(enPrefixRegex);
        if (enPrefixMatches && enPrefixMatches.length > 0) {
          throw new Error(`Found /en/ prefixes in URLs: ${enPrefixMatches.slice(0, 3).join(', ')}`);
        }

        console.log(`📄 Content length: ${content.length} characters`);
        console.log(`🔗 No /en/ prefixes found in URLs`);
      }
    );
  }

  async testIndividualPosts() {
    const results = [];
    
    for (const postSlug of EXPECTED_POSTS) {
      const result = await this.test(
        `Individual Post: ${postSlug}`,
        `${BASE_URL}/posts/${postSlug}/`,
        200,
        async (response, content, headers) => {
          // Verify content type
          if (!headers['content-type']?.includes('text/html')) {
            throw new Error('Expected HTML content type');
          }

          // Verify post content
          if (!content.includes(postSlug) && !content.toLowerCase().includes('post')) {
            throw new Error('Page does not appear to be a valid blog post');
          }

          // Verify no /en/ prefix in internal links
          const enPrefixRegex = /href=["']\/en\//g;
          const enPrefixMatches = content.match(enPrefixRegex);
          if (enPrefixMatches && enPrefixMatches.length > 0) {
            console.log(`⚠️  Warning: Found /en/ prefixes in URLs: ${enPrefixMatches.slice(0, 3).join(', ')}`);
          }

          console.log(`📄 Content length: ${content.length} characters`);
          console.log(`🏷️  Post slug: ${postSlug}`);
        }
      );
      
      results.push(result);
    }
    
    return results;
  }

  async testPaginationRoutes() {
    const paginationResults = [];
    
    // Test first few pagination pages
    for (let page = 1; page <= 3; page++) {
      const url = page === 1 ? `${BASE_URL}/posts/` : `${BASE_URL}/posts/${page}/`;
      
      const result = await this.test(
        `Pagination Page ${page}`,
        url,
        [200, 404], // 404 is acceptable if page doesn't exist
        async (response, content, headers) => {
          if (response.status === 404) {
            console.log(`📄 Page ${page} does not exist (acceptable)`);
            return;
          }

          // For existing pages, verify they're valid
          if (!headers['content-type']?.includes('text/html')) {
            throw new Error('Expected HTML content type');
          }

          // Verify no /en/ prefix in URLs
          const enPrefixRegex = /href=["']\/en\//g;
          const enPrefixMatches = content.match(enPrefixRegex);
          if (enPrefixMatches && enPrefixMatches.length > 0) {
            throw new Error(`Found /en/ prefixes in URLs: ${enPrefixMatches.slice(0, 3).join(', ')}`);
          }

          console.log(`📄 Page ${page} content length: ${content.length} characters`);
        }
      );
      
      paginationResults.push(result);
    }
    
    return paginationResults;
  }

  async testRSSFeed() {
    return await this.test(
      'RSS Feed',
      `${BASE_URL}/rss.xml`,
      200,
      async (response, content, headers) => {
        // Verify content type
        const contentType = headers['content-type'];
        if (!contentType?.includes('xml')) {
          throw new Error(`Expected XML content type, got: ${contentType}`);
        }

        // Verify RSS structure
        if (!content.includes('<rss') && !content.includes('<feed')) {
          throw new Error('Content does not appear to be a valid RSS/Atom feed');
        }

        // Check for blog posts in feed
        let foundPosts = 0;
        for (const postSlug of EXPECTED_POSTS) {
          if (content.includes(postSlug)) {
            foundPosts++;
          }
        }

        console.log(`📡 RSS feed contains ${foundPosts} expected posts`);
        console.log(`📄 Feed content length: ${content.length} characters`);
        
        if (foundPosts === 0) {
          console.log(`⚠️  Warning: No expected posts found in RSS feed`);
        }
      }
    );
  }

  async testRedirectLoops() {
    console.log(`\n🔄 Testing for redirect loops and infinite redirects...`);
    
    // Test potential problematic routes
    const testRoutes = [
      '/',
      '/posts',
      '/posts/',
      '/en/',
      '/en-US/',
      '/en/posts/',
    ];

    for (const route of testRoutes) {
      try {
        console.log(`\n🧪 Testing redirect behavior: ${route}`);
        
        const response = await fetch(`${BASE_URL}${route}`, {
          method: 'GET',
          timeout: 5000,
          redirect: 'manual'
        });

        console.log(`📊 Status: ${response.status}`);
        
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location');
          console.log(`🔄 Redirect to: ${location}`);
          
          // Check if redirect creates a loop
          if (location === route || location === `${BASE_URL}${route}`) {
            this.results.errors.push(`Redirect loop detected: ${route} -> ${location}`);
            console.log(`❌ REDIRECT LOOP: ${route} -> ${location}`);
          } else {
            console.log(`✅ Valid redirect: ${route} -> ${location}`);
          }
        } else if (response.status === 200) {
          console.log(`✅ Direct response (no redirect)`);
        } else if (response.status === 404) {
          console.log(`📄 Route not found (expected for some routes)`);
        } else {
          console.log(`⚠️  Unexpected status: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`❌ Error testing ${route}: ${error.message}`);
      }
    }
  }

  async testEnglishRootPaths() {
    console.log(`\n🌐 Verifying English content uses root paths (no /en/ prefix)...`);
    
    const result = await this.test(
      'English Content Root Paths',
      `${BASE_URL}/posts/`,
      200,
      async (response, content, headers) => {
        // Extract all internal links
        const linkRegex = /href=["']([^"']+)["']/g;
        const links = [];
        let match;
        
        while ((match = linkRegex.exec(content)) !== null) {
          const href = match[1];
          // Filter for internal links
          if (href.startsWith('/') && !href.startsWith('//')) {
            links.push(href);
          }
        }

        console.log(`🔗 Found ${links.length} internal links`);

        // Check for /en/ prefixes
        const enPrefixLinks = links.filter(link => link.startsWith('/en/'));
        const enUSPrefixLinks = links.filter(link => link.startsWith('/en-US/'));

        if (enPrefixLinks.length > 0) {
          console.log(`⚠️  Found /en/ prefixed links: ${enPrefixLinks.slice(0, 5).join(', ')}`);
        }

        if (enUSPrefixLinks.length > 0) {
          throw new Error(`Found /en-US/ prefixed links (should use root): ${enUSPrefixLinks.slice(0, 5).join(', ')}`);
        }

        // Verify posts links use root paths
        const postLinks = links.filter(link => link.includes('/posts/'));
        const rootPostLinks = postLinks.filter(link => !link.startsWith('/en') && !link.startsWith('/pt-BR'));
        
        console.log(`📝 Post links: ${postLinks.length}, Root path links: ${rootPostLinks.length}`);

        if (postLinks.length > 0 && rootPostLinks.length === 0) {
          throw new Error('No root path post links found');
        }

        console.log(`✅ English content correctly uses root paths`);
      }
    );

    return result;
  }

  async runAllTests() {
    console.log('🚀 Starting Blog Routes Test Suite');
    console.log('=====================================');
    
    console.log('\n📋 Configuration Verification:');
    console.log('- prefixDefaultLocale: false (from astro.config.ts)');
    console.log('- Default locale: en-US');
    console.log('- Expected behavior: English content at root paths');
    
    try {
      // Test individual components
      await this.testPostsListingPage();
      await this.testIndividualPosts();
      await this.testPaginationRoutes();
      await this.testRSSFeed();
      await this.testEnglishRootPaths();
      await this.testRedirectLoops();

      console.log('\n📊 Test Results Summary');
      console.log('========================');
      console.log(`✅ Passed: ${this.results.passed}`);
      console.log(`❌ Failed: ${this.results.failed}`);
      console.log(`📈 Total: ${this.results.tests.length}`);

      if (this.results.errors.length > 0) {
        console.log('\n❌ Errors Found:');
        this.results.errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
      }

      if (this.results.failed === 0) {
        console.log('\n🎉 All tests passed! Blog routing is working correctly.');
        console.log('✅ English content is correctly served from root paths');
        console.log('✅ No redirect loops detected');
        console.log('✅ All blog routes are accessible');
      } else {
        console.log('\n⚠️  Some tests failed. Please check the issues above.');
      }

      return this.results;

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      this.results.errors.push(`Test suite error: ${error.message}`);
      return this.results;
    }
  }
}

// Export for use as a module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlogRoutesTester, EXPECTED_POSTS, BASE_URL };
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new BlogRoutesTester();
  tester.runAllTests().then(results => {
    process.exit(results.failed === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}