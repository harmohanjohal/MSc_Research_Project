// Simple test script to verify backend API is working
// Run this with: node test-backend.js

const API_BASE = 'http://localhost:5000'

async function testBackend() {
  console.log('🧪 Testing Backend API...')
  console.log('=' * 50)

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...')
    const healthResponse = await fetch(`${API_BASE}/api/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health Check:', healthData.status)
    console.log('   Model Loaded:', healthData.model_loaded)
    console.log('   Scaler Loaded:', healthData.scaler_loaded)
    console.log('')

    // Test 2: Model Info
    console.log('2. Testing Model Info...')
    const modelResponse = await fetch(`${API_BASE}/api/model-info`)
    const modelData = await modelResponse.json()
    console.log('✅ Model Type:', modelData.model_type)
    console.log('   Features:', modelData.feature_count)
    console.log('   MAE:', modelData.performance.mae)
    console.log('')

    // Test 3: Test Prediction
    console.log('3. Testing Sample Prediction...')
    const testResponse = await fetch(`${API_BASE}/api/test`)
    const testData = await testResponse.json()
    console.log('✅ Test Prediction:', testData.prediction)
    console.log('   Sample Weather:', testData.sample_weather)
    console.log('')

    // Test 4: Single Prediction
    console.log('4. Testing Single Prediction...')
    const predictionResponse = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weatherData: {
          temperature: 15,
          windSpeed: 10,
          humidity: 70,
          solarRadiation: 300,
          cloudCover: 60,
          pressure: 101325,
          precipitation: 0
        }
      })
    })
    const predictionData = await predictionResponse.json()
    console.log('✅ Prediction Result:')
    console.log('   Demand:', predictionData.demand)
    console.log('   Confidence:', predictionData.confidence)
    console.log('   Trend:', predictionData.trend)
    console.log('')

    console.log('🎉 All tests passed! Backend is ready for integration.')
    console.log('')
    console.log('Next steps:')
    console.log('1. Start the frontend: npm run dev')
    console.log('2. Navigate to http://localhost:3000')
    console.log('3. Test the Manual Testing page')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('')
    console.log('Troubleshooting:')
    console.log('1. Make sure the Flask backend is running: python backend/app.py')
    console.log('2. Check that the model files exist in backend/')
    console.log('3. Verify the backend is running on http://localhost:5000')
  }
}

// Run the test
testBackend()
