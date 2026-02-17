import { useState, useEffect, useCallback } from 'react'
import { apiService, type WeatherData, type BuildingData, type PredictionResult, type ModelInfo, type HealthStatus } from '@/lib/api'

// Custom hook for API health check
export function useApiHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const healthData = await apiService.withRetry(() => apiService.checkHealth())
      setHealth(healthData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed')
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth()
  }, []) // Remove checkHealth from dependencies

  return { health, loading, error, refetch: checkHealth }
}

// Custom hook for model information
export function useModelInfo() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModelInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const info = await apiService.withRetry(() => apiService.getModelInfo())
      setModelInfo(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch model info')
      setModelInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModelInfo()
  }, []) // Remove fetchModelInfo from dependencies

  return { modelInfo, loading, error, refetch: fetchModelInfo }
}

// Custom hook for single prediction
export function usePrediction() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const makePrediction = useCallback(async (
    weatherData: WeatherData, 
    buildingData?: BuildingData,
    timestamp?: string
  ) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.withRetry(() => 
        apiService.predictSingle(weatherData, buildingData, timestamp)
      )
      setPrediction(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Prediction failed'
      setError(errorMessage)
      setPrediction(null)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearPrediction = useCallback(() => {
    setPrediction(null)
    setError(null)
  }, [])

  return { 
    prediction, 
    loading, 
    error, 
    makePrediction, 
    clearPrediction 
  }
}

// Custom hook for weather data management
export function useWeatherData() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData>({
    temperature: 18.5,
    windSpeed: 8.3,
    humidity: 72,
    solarRadiation: 450,
    cloudCover: 65,
    pressure: 101325,
    precipitation: 0.2
  })

  const updateWeather = useCallback((updates: Partial<WeatherData>) => {
    setCurrentWeather(prev => {
      const newWeather = { ...prev, ...updates }
      
      // Ensure no NaN values
      Object.keys(newWeather).forEach(key => {
        const value = newWeather[key as keyof WeatherData]
        if (typeof value === 'number' && isNaN(value)) {
          // Reset to default value if NaN
          const defaults = {
            temperature: 18.5,
            windSpeed: 8.3,
            humidity: 72,
            solarRadiation: 450,
            cloudCover: 65,
            pressure: 101325,
            precipitation: 0.2
          }
          newWeather[key as keyof WeatherData] = defaults[key as keyof WeatherData]
        }
      })
      
      return newWeather
    })
  }, [])

  const resetWeather = useCallback(() => {
    setCurrentWeather({
      temperature: 18.5,
      windSpeed: 8.3,
      humidity: 72,
      solarRadiation: 450,
      cloudCover: 65,
      pressure: 101325,
      precipitation: 0.2
    })
  }, [])

  return {
    currentWeather,
    updateWeather,
    resetWeather
  }
}

// Custom hook for API connection status
export function useApiConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkConnection = useCallback(async () => {
    try {
      await apiService.testConnection()
      setIsConnected(true)
      setLastCheck(new Date())
    } catch (error) {
      setIsConnected(false)
      setLastCheck(new Date())
    }
  }, [])

  useEffect(() => {
    checkConnection()
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, []) // Remove checkConnection from dependencies

  return { isConnected, lastCheck, checkConnection }
}

// Custom hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (force = false) => {
    // Check cache first
    if (!force) {
      try {
        const cached = localStorage.getItem(key)
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < ttl) {
            setData(cachedData)
            return cachedData
          }
        }
      } catch (error) {
        console.warn('Failed to read cached data:', error)
      }
    }

    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      setData(result)
      
      // Cache the result
      try {
        localStorage.setItem(key, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.warn('Failed to cache data:', error)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [key, ttl]) // Remove fetcher from dependencies to prevent infinite loops

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: () => fetchData(true) }
}
