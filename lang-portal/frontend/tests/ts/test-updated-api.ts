// Simple test script for updated API
console.log('Starting updated API test...');

// Get the API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log('Using API base URL:', API_BASE_URL);

// Test updated API endpoint
async function testUpdatedEndpoint() {
  try {
    console.log('Testing updated API endpoint...');
    const response = await fetch(`${API_BASE_URL}/updated`);
    const data = await response.json();
    console.log('Updated API endpoint response:', data);
    return data;
  } catch (error) {
    console.error('Updated API endpoint test failed:', error);
    return null;
  }
}

// Run tests
async function runTests() {
  const updatedResult = await testUpdatedEndpoint();
  
  console.log('Test summary:');
  console.log('- Updated API endpoint:', updatedResult ? 'SUCCESS' : 'FAILED');
}

runTests(); 