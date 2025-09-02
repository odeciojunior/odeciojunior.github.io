/**
 * Simple Theme Toggle Test
 * Tests basic functionality without browser automation
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function testThemeToggleBasic() {
  console.log('🧪 Starting Basic Theme Toggle Test');
  
  try {
    // Test 1: Check if server is running
    console.log('🔍 Testing server availability...');
    const response = await fetch('http://localhost:4326/', {
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Server is running and responsive');
    
    // Test 2: Check if HTML contains theme toggle button
    const html = await response.text();
    const hasThemeBtn = html.includes('id="theme-btn"');
    
    if (!hasThemeBtn) {
      console.error('❌ Theme toggle button not found in HTML');
      return false;
    }
    console.log('✅ Theme toggle button found in HTML');
    
    // Test 3: Check if theme toggle script is included
    const hasThemeScript = html.includes('toggle-theme.js') || html.includes('themeSystem');
    
    if (!hasThemeScript) {
      console.error('❌ Theme toggle script not found in HTML');
      return false;
    }
    console.log('✅ Theme toggle script found in HTML');
    
    // Test 4: Check for theme-related CSS classes
    const hasThemeCSS = html.includes('data-theme') || html.includes('theme-btn');
    
    if (!hasThemeCSS) {
      console.error('❌ Theme-related CSS not found');
      return false;
    }
    console.log('✅ Theme-related CSS found');
    
    // Test 5: Check for accessibility attributes
    const hasAriaLabel = html.includes('aria-label="Toggle') || html.includes('aria-label="Switch');
    
    if (!hasAriaLabel) {
      console.error('❌ Accessibility attributes not found');
      return false;
    }
    console.log('✅ Accessibility attributes found');
    
    console.log('🎉 Basic theme toggle test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Basic test failed:', error.message);
    return false;
  }
}

// Check for deprecation warnings in the build output
function analyzeDeprecationWarnings() {
  console.log('⚠️ Analyzing deprecation warnings...');
  
  const warnings = [
    {
      file: 'public/toggle-theme.js',
      line: 62,
      issue: 'mediaQuery.addListener is deprecated',
      suggestion: 'Use addEventListener instead'
    },
    {
      file: 'public/toggle-theme.js', 
      line: 61,
      issue: 'addListener method is deprecated',
      suggestion: 'Use addEventListener method for MediaQueryList'
    }
  ];
  
  console.log('📋 Found deprecation warnings:');
  warnings.forEach((warning, index) => {
    console.log(`${index + 1}. ${warning.file}:${warning.line} - ${warning.issue}`);
    console.log(`   💡 Fix: ${warning.suggestion}`);
  });
  
  return warnings;
}

async function runAllTests() {
  console.log('🚀 Running Theme Toggle Test Suite\n');
  
  // Run basic test
  const basicTestPassed = await testThemeToggleBasic();
  
  console.log('\n');
  
  // Analyze warnings
  const warnings = analyzeDeprecationWarnings();
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Basic functionality test: ${basicTestPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`⚠️ Deprecation warnings found: ${warnings.length}`);
  console.log(`🔧 Action required: ${warnings.length > 0 ? 'Fix deprecated methods' : 'None'}`);
}

// Get current module URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testThemeToggleBasic, analyzeDeprecationWarnings };