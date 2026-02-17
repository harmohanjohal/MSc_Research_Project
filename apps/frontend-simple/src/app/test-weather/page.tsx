"use client"

import { useState, useEffect } from 'react'
import { weatherService } from '@/lib/weather'

export default function TestWeatherPage() {
  const [status, setStatus] = useState<string>('Loading...')
  const [weatherData, setWeatherData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testWeatherAPI = async () => {
      try {
        setStatus('Testing API availability...')
        
        // Test 1: Check if API key is loaded
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY
        console.log('API Key in browser:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT FOUND')
        
        if (!apiKey) {
          setError('API key not found in environment variables')
          setStatus('Failed')
          return
        }

        setStatus('Testing current weather...')
        
        // Test 2: Get current weather
        const currentWeather = await weatherService.getCurrentWeather('London')
        setWeatherData(currentWeather)
        setStatus('Success!')
        
      } catch (err) {
        console.error('Weather API test failed:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('Failed')
      }
    }

    testWeatherAPI()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Weather API Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Status: {status}</h2>
          {error && (
            <div className="text-red-600 bg-red-50 p-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {weatherData && (
          <div className="p-4 border rounded bg-green-50">
            <h2 className="font-semibold mb-2 text-green-800">Weather Data Retrieved:</h2>
            <pre className="text-sm bg-white p-3 rounded border">
              {JSON.stringify(weatherData, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 border rounded bg-blue-50">
          <h2 className="font-semibold mb-2">Environment Variables:</h2>
          <div className="text-sm">
            <div>NEXT_PUBLIC_WEATHER_API_KEY: {process.env.NEXT_PUBLIC_WEATHER_API_KEY ? '✅ Found' : '❌ Not Found'}</div>
            <div>NODE_ENV: {process.env.NODE_ENV}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
