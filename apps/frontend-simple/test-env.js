// Test environment variable loading
console.log('🔍 Testing Environment Variable Loading...');
console.log('='.repeat(50));

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('🌐 Browser Environment Detected');
  console.log('Environment variables in browser:', {
    NEXT_PUBLIC_WEATHER_API_KEY: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
    NODE_ENV: process.env.NODE_ENV
  });
} else {
  console.log('🖥️ Node.js Environment Detected');
  console.log('Environment variables in Node.js:', {
    NEXT_PUBLIC_WEATHER_API_KEY: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
    NODE_ENV: process.env.NODE_ENV
  });
}

// Test the actual API call with the environment variable
const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
console.log('\n🔑 API Key Check:');
console.log(`API Key exists: ${!!apiKey}`);
console.log(`API Key length: ${apiKey ? apiKey.length : 0}`);
console.log(`API Key preview: ${apiKey ? apiKey.substring(0, 8) + '...' : 'NOT FOUND'}`);

if (apiKey) {
  console.log('\n✅ Environment variable is loaded correctly!');
} else {
  console.log('\n❌ Environment variable is NOT loaded!');
  console.log('Possible issues:');
  console.log('- .env.local file not in correct location');
  console.log('- Development server not restarted');
  console.log('- Environment variable name incorrect');
}
