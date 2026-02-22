import { useState, useEffect } from 'react'
import { apiService, type WeatherData, type BuildingData, type PredictionResult } from '@/lib/api'
import { weatherService } from '@/lib/weather'

export type { WeatherData, BuildingData, PredictionResult }

export interface HourlyWeatherData {
    [hour: number]: WeatherData
}

export interface HourlyPrediction {
    hour: number
    weather: WeatherData
    prediction: PredictionResult
    timestamp: string
}

export function useManualPrediction() {
    const [predictionHorizon, setPredictionHorizon] = useState<1 | 3 | 6>(1)
    const [hourlyWeatherData, setHourlyWeatherData] = useState<HourlyWeatherData>({})
    const [buildingData, setBuildingData] = useState<BuildingData>({
        floorArea: 120,
        numFloors: 2,
        infiltrationRate: 0.5,
        buildingType: 'Residential',
        constructionType: 'standard'
    })

    const [hourlyPredictions, setHourlyPredictions] = useState<HourlyPrediction[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const initializeWeatherData = async () => {
            const newHourlyWeather: HourlyWeatherData = {}

            try {
                const isAvailable = await weatherService.isAvailable()
                if (isAvailable) {
                    const { forecast } = await weatherService.getWeatherForecast(undefined, predictionHorizon)
                    for (let hour = 1; hour <= predictionHorizon; hour++) {
                        if (!hourlyWeatherData[hour]) {
                            const hourData = forecast[hour - 1]
                            newHourlyWeather[hour] = {
                                temperature: hourData.temperature,
                                windSpeed: hourData.windSpeed,
                                humidity: hourData.humidity,
                                solarRadiation: hourData.solarRadiation,
                                cloudCover: hourData.cloudCover,
                                pressure: hourData.pressure,
                                precipitation: hourData.precipitation
                            }
                        } else {
                            newHourlyWeather[hour] = hourlyWeatherData[hour]
                        }
                    }
                } else {
                    for (let hour = 1; hour <= predictionHorizon; hour++) {
                        if (!hourlyWeatherData[hour]) {
                            newHourlyWeather[hour] = {
                                temperature: 5 + (hour * 2),
                                windSpeed: 3 + (hour * 0.5),
                                humidity: 80 - (hour * 2),
                                solarRadiation: 100 + (hour * 50),
                                cloudCover: 8 - (hour * 1),
                                pressure: 101325,
                                precipitation: 0
                            }
                        } else {
                            newHourlyWeather[hour] = hourlyWeatherData[hour]
                        }
                    }
                }
            } catch (error) {
                console.warn('Failed to get real weather data, using fallback:', error)
                for (let hour = 1; hour <= predictionHorizon; hour++) {
                    if (!hourlyWeatherData[hour]) {
                        newHourlyWeather[hour] = {
                            temperature: 5 + (hour * 2),
                            windSpeed: 3 + (hour * 0.5),
                            humidity: 80 - (hour * 2),
                            solarRadiation: 100 + (hour * 50),
                            cloudCover: 8 - (hour * 1),
                            pressure: 101325,
                            precipitation: 0
                        }
                    } else {
                        newHourlyWeather[hour] = hourlyWeatherData[hour]
                    }
                }
            }

            setHourlyWeatherData(newHourlyWeather)
        }

        initializeWeatherData()
    }, [predictionHorizon])

    const handlePredict = async () => {
        setLoading(true)
        setError(null)
        setHourlyPredictions([])

        try {
            const forecastSlice = Object.values(hourlyWeatherData).slice(0, predictionHorizon)
            const currentWeather = forecastSlice[0]
            const weatherForecast = forecastSlice.slice(1)

            const { predictions: horizonResult } = await apiService.predictHorizon(
                currentWeather,
                weatherForecast,
                predictionHorizon,
                buildingData
            )

            const predictions: HourlyPrediction[] = horizonResult.map((p: any, i: number) => ({
                hour: i + 1,
                weather: forecastSlice[i],
                prediction: {
                    heat_demand_kw: p.demand,
                    confidence_interval: p.confidence,
                    accuracy_score: p.accuracy,
                    timestamp: p.timestamp,
                    model_version: p.model_version
                } as any, // Cast to PredictionResult
                timestamp: p.timestamp
            }))

            setHourlyPredictions(predictions)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Prediction failed')
        } finally {
            setLoading(false)
        }
    }

    const handleWeatherChange = (hour: number, data: Partial<WeatherData>) => {
        setHourlyWeatherData(prev => ({
            ...prev,
            [hour]: {
                ...prev[hour],
                ...data
            }
        }))
    }

    const handleBuildingChange = (data: Partial<BuildingData>) => {
        setBuildingData(prev => ({ ...prev, ...data }))
    }

    return {
        predictionHorizon,
        setPredictionHorizon,
        hourlyWeatherData,
        buildingData,
        hourlyPredictions,
        loading,
        error,
        handlePredict,
        handleWeatherChange,
        handleBuildingChange
    }
}

