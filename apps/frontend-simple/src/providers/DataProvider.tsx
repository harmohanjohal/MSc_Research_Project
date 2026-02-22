"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiService, type HealthStatus, type ModelInfo } from '@/lib/api'
import { weatherService, type CurrentWeather, type WeatherForecast } from '@/lib/weather'

interface DataContextType {
    health: HealthStatus | null
    modelInfo: ModelInfo | null
    currentWeather: CurrentWeather | null
    forecast: WeatherForecast[] | null
    isConnected: boolean
    lastCheck: Date | null
    loading: boolean
    error: string | null
    refreshAll: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [health, setHealth] = useState<HealthStatus | null>(null)
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
    const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null)
    const [forecast, setForecast] = useState<WeatherForecast[] | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [lastCheck, setLastCheck] = useState<Date | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)

            // Parallel fetch for core metadata
            const [healthData, infoData, weatherData, forecastData] = await Promise.all([
                apiService.checkHealth().catch(() => null),
                apiService.getModelInfo().catch(() => null),
                weatherService.getCurrentWeather().catch(() => null),
                weatherService.getWeatherForecast().catch(() => ({ forecast: [] }))
            ])

            setHealth(healthData)
            setModelInfo(infoData)
            setCurrentWeather(weatherData)
            setForecast(forecastData.forecast)
            setIsConnected(!!healthData)
            setLastCheck(new Date())
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Data synchronization failed')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()

        // Periodic sync every 2 minutes
        const interval = setInterval(fetchData, 120000)
        return () => clearInterval(interval)
    }, [fetchData])

    return (
        <DataContext.Provider value={{
            health,
            modelInfo,
            currentWeather,
            forecast,
            isConnected,
            lastCheck,
            loading,
            error,
            refreshAll: fetchData
        }}>
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider')
    }
    return context
}
