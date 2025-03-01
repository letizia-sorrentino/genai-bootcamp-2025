// Simple test script for API
console.log('Starting API test...');

// Get the API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log('Using API base URL:', API_BASE_URL);

// Test health endpoint
async function testHealthEndpoint() {
  try {
    console.log('Testing health endpoint...');
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('Health endpoint response:', data);
    return data;
  } catch (error) {
    console.error('Health endpoint test failed:', error);
    return null;
  }
}

// Run tests
async function runTests() {
  const healthResult = await testHealthEndpoint();
  
  console.log('Test summary:');
  console.log('- Health endpoint:', healthResult ? 'SUCCESS' : 'FAILED');
}

runTests(); 