"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Thermometer, Cloud, Wind, Droplets, Sun, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { weatherService, type WeatherData } from '@/lib/weather'

interface WeatherStatusProps {
  className?: string
}

export function WeatherStatus({ className }: WeatherStatusProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const status = await weatherService.getStatus()
      setIsAvailable(status.available)
      setLastUpdate(status.lastUpdate)
      
      if (status.available) {
        const currentWeather = await weatherService.getCurrentWeather()
        setWeatherData(currentWeather)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
      setIsAvailable(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const handleRefresh = () => {
    fetchWeatherData()
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Weather Status</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Real-time weather data from WeatherAPI.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API Status:</span>
          <Badge variant={isAvailable ? "default" : "destructive"} className="flex items-center gap-1">
            {isAvailable ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Update:</span>
            <span className="text-sm text-muted-foreground">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* Current Weather Data */}
        {weatherData && isAvailable && (
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-sm font-medium">Current Weather (London)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-sm">{weatherData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{weatherData.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{weatherData.windSpeed.toFixed(1)} m/s</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{weatherData.cloudCover}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{weatherData.solarRadiation.toFixed(0)} W/m²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Pressure:</span>
                <span className="text-sm">{(weatherData.pressure / 100).toFixed(0)} hPa</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Loading weather data...</p>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && !weatherData && !error && (
          <div className="text-center py-4">
            <Cloud className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">No weather data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
