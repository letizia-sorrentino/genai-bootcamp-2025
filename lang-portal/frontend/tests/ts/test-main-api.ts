// Simple test script for main API
console.log('Starting main API test...');

// Get the API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log('Using API base URL:', API_BASE_URL);

// Test main API endpoint
async function testMainEndpoint() {
  try {
    console.log('Testing main API endpoint...');
    const response = await fetch(`${API_BASE_URL}/main`);
    const data = await response.json();
    console.log('Main API endpoint response:', data);
    return data;
  } catch (error) {
    console.error('Main API endpoint test failed:', error);
    return null;
  }
}

// Run tests
async function runTests() {
  const mainResult = await testMainEndpoint();
  
  console.log('Test summary:');
  console.log('- Main API endpoint:', mainResult ? 'SUCCESS' : 'FAILED');
}

runTests(); 