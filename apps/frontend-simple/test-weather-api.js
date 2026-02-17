// Test script for WeatherAPI.com
const API_KEY = '2e9833d1fe914f058af235413251108';
const LOCATION = 'London';

async function testWeatherAPI() {
  console.log('🌤️ Testing WeatherAPI.com...');
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`Location: ${LOCATION}`);
  console.log('='.repeat(50));

  try {
    // Test current weather
    console.log('1. Testing Current Weather...');
    const currentUrl = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${LOCATION}&aqi=no`;
    
    const currentResponse = await fetch(currentUrl);
    console.log(`Status: ${currentResponse.status} ${currentResponse.statusText}`);
    
    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      console.error('❌ Current Weather Error:', errorText);
      return;
    }
    
    const currentData = await currentResponse.json();
    console.log('✅ Current Weather Success!');
    console.log(`Temperature: ${currentData.current.temp_c}°C`);
    console.log(`Humidity: ${currentData.current.humidity}%`);
    console.log(`Wind Speed: ${currentData.current.wind_kph} km/h`);
    console.log(`Cloud Cover: ${currentData.current.cloud}%`);
    console.log(`Location: ${currentData.location.name}, ${currentData.location.country}`);

    // Test forecast
    console.log('\n2. Testing Weather Forecast...');
    const forecastUrl = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${LOCATION}&days=1&aqi=no`;
    
    const forecastResponse = await fetch(forecastUrl);
    console.log(`Status: ${forecastResponse.status} ${forecastResponse.statusText}`);
    
    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text();
      console.error('❌ Forecast Error:', errorText);
      return;
    }
    
    const forecastData = await forecastResponse.json();
    console.log('✅ Forecast Success!');
    console.log(`Forecast hours available: ${forecastData.forecast.forecastday[0].hour.length}`);
    console.log(`First hour temp: ${forecastData.forecast.forecastday[0].hour[0].temp_c}°C`);

    console.log('\n🎉 WeatherAPI.com is working perfectly!');
    console.log('The issue might be in the frontend integration.');

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('\nPossible issues:');
    console.log('- Network connectivity');
    console.log('- API key permissions');
    console.log('- Rate limiting');
  }
}

// Run the test
testWeatherAPI();
