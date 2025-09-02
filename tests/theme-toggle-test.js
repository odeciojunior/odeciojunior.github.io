/**
 * Theme Toggle Functionality Test
 * Tests the theme toggle button behavior and functionality
 */

const puppeteer = require('puppeteer');

async function testThemeToggle() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`🔍 Console [${msg.type()}]:`, msg.text());
    });
    
    // Enable error logging
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message);
    });
    
    // Navigate to the local development server
    console.log('🚀 Navigating to http://localhost:4326/');
    await page.goto('http://localhost:4326/', {
      waitUntil: 'networkidle0'
    });
    
    console.log('✅ Page loaded successfully');
    
    // Check if theme toggle button exists
    const themeButton = await page.$('#theme-btn');
    if (!themeButton) {
      console.error('❌ Theme toggle button not found!');
      return;
    }
    console.log('✅ Theme toggle button found');
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    console.log(`🎨 Initial theme: ${initialTheme}`);
    
    // Test button click
    console.log('🖱️ Clicking theme toggle button...');
    await themeButton.click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Get theme after click
    const newTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    console.log(`🎨 Theme after click: ${newTheme}`);
    
    // Test multiple clicks to verify cycling
    console.log('🔄 Testing theme cycling...');
    for (let i = 0; i < 3; i++) {
      await themeButton.click();
      await page.waitForTimeout(300);
      
      const currentTheme = await page.evaluate(() => {
        return document.documentElement.getAttribute('data-theme') || 'light';
      });
      console.log(`🎨 Cycle ${i + 1}: ${currentTheme}`);
    }
    
    // Test keyboard accessibility
    console.log('⌨️ Testing keyboard accessibility...');
    await themeButton.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    const keyboardTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    console.log(`⌨️ Theme after keyboard press: ${keyboardTheme}`);
    
    // Test localStorage persistence
    console.log('💾 Testing localStorage persistence...');
    const storedTheme = await page.evaluate(() => {
      return localStorage.getItem('theme');
    });
    console.log(`💾 Stored theme: ${storedTheme}`);
    
    // Test page reload persistence
    console.log('🔄 Testing theme persistence on reload...');
    await page.reload({ waitUntil: 'networkidle0' });
    
    const reloadedTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') || 'light';
    });
    console.log(`🔄 Theme after reload: ${reloadedTheme}`);
    
    // Test accessibility attributes
    console.log('♿ Testing accessibility attributes...');
    const ariaLabel = await themeButton.evaluate(btn => btn.getAttribute('aria-label'));
    const title = await themeButton.evaluate(btn => btn.getAttribute('title'));
    
    console.log(`♿ aria-label: ${ariaLabel}`);
    console.log(`♿ title: ${title}`);
    
    console.log('✅ Theme toggle test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Check if running directly
if (require.main === module) {
  testThemeToggle().catch(console.error);
}

module.exports = { testThemeToggle };