"use client"

import { useState, useEffect } from 'react'

export default function WeatherTestPage() {
  const [status, setStatus] = useState<string>('Loading...')
  const [weatherData, setWeatherData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testWeatherAPI = async () => {
      try {
        setStatus('Testing weather API...')
        
        // Use environment variable for the API key instead of hardcoding
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY
        if (!apiKey) {
            setError('API key is not configured')
            setStatus('Failed')
            return
        }
        const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=London&aqi=no`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setWeatherData(data)
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
      <h1 className="text-2xl font-bold mb-6">Weather API Direct Test</h1>
      
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
            <div className="text-sm space-y-2">
              <div><strong>Location:</strong> {weatherData.location?.name}, {weatherData.location?.country}</div>
              <div><strong>Temperature:</strong> {weatherData.current?.temp_c}°C</div>
              <div><strong>Humidity:</strong> {weatherData.current?.humidity}%</div>
              <div><strong>Wind Speed:</strong> {weatherData.current?.wind_kph} km/h</div>
              <div><strong>Cloud Cover:</strong> {weatherData.current?.cloud}%</div>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Full Response</summary>
              <pre className="text-xs bg-white p-3 rounded border mt-2 overflow-auto">
                {JSON.stringify(weatherData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
