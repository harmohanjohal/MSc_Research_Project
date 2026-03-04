// Weather API Service using WeatherAPI.com

export interface WeatherForecast {
    hour: number
    temperature: number
    humidity: number
    windSpeed: number
    cloudCover: number
    solarRadiation: number
    pressure: number
    precipitation: number
    timestamp?: string
}

export interface CurrentWeather {
    temperature: number
    humidity: number
    windSpeed: number
    cloudCover: number
    solarRadiation: number
    pressure: number
    precipitation: number
    condition: string
    icon: string
    locationName?: string
    locationCountry?: string
}

export type WeatherData = Omit<CurrentWeather, 'condition' | 'icon'> & { timestamp?: string }

class WeatherService {
    private apiKey: string | undefined
    private defaultLocation: string = 'London'
    private baseUrl: string = 'https://api.weatherapi.com/v1'
    private cache: Map<string, { data: any, timestamp: number }> = new Map()
    private CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache

    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY?.trim()
        const envLoc = process.env.NEXT_PUBLIC_WEATHER_LOCATION?.trim()

        // Anti-corruption check: if location looks like a hex string/API key, it's corrupted
        const isCorrupted = envLoc && /^[a-f0-9]{10,}$/i.test(envLoc)

        this.defaultLocation = (envLoc && envLoc !== 'undefined' && !isCorrupted) ? envLoc : 'London,UK'

        if (!this.apiKey) {
            console.error('[WeatherService] CRITICAL: NEXT_PUBLIC_WEATHER_API_KEY is missing from environment.')
        }

        if (isCorrupted) {
            console.error(`[WeatherService] CORRUPTED_LOCATION_DETECTED: "${envLoc}". Falling back to "${this.defaultLocation}"`)
        }

        console.log('--- WEATHER_SERVICE_INIT ---')
        console.log(`API_KEY_LOADED: ${!!this.apiKey}`)
        console.log(`LOCATION_LOADED: ${this.defaultLocation}`)
        console.log('---------------------------')
    }

    async isAvailable(): Promise<boolean> {
        return !!this.apiKey
    }

    async getStatus(): Promise<{ available: boolean; lastUpdate: string }> {
        const available = await this.isAvailable()
        return {
            available,
            lastUpdate: available ? new Date().toISOString() : ''
        }
    }

    async getCurrentWeather(location?: string): Promise<CurrentWeather> {
        let query = (location || this.defaultLocation || 'London,UK').trim()

        // Remove trailing commas/special chars that often break APIs
        query = query.replace(/[,/\s]+$/, '').trim()

        // Final safety check: if query looks like hex/API key, fallback
        if (query === 'undefined' || query === '' || /^[a-f0-9]{15,}$/i.test(query)) {
            query = 'London,UK'
        }

        if (!this.apiKey) {
            throw new Error('Weather API key not configured')
        }

        const cacheKey = `current_${query}`
        const cached = this.cache.get(cacheKey)
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            console.log(`[WeatherService] Serving Current Weather from cache: ${query}`)
            return cached.data
        }

        const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(query)}&aqi=no`
        console.log(`[WeatherService] Fetching: ${url.replace(this.apiKey, '***')}`)

        const response = await fetch(url)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const apiMessage = errorData.error?.message || response.statusText;
            throw new Error(`API_ERROR: ${response.status} - ${apiMessage}`);
        }

        const data = await response.json()

        const result = {
            temperature: Number(data.current.temp_c.toFixed(2)),
            humidity: Number(data.current.humidity.toFixed(2)),
            windSpeed: Number((data.current.wind_kph / 3.6).toFixed(2)), // Convert to m/s
            cloudCover: Number(data.current.cloud.toFixed(2)),
            solarRadiation: Number(this.estimateSolarRadiation(data.current.cloud, data.current.is_day).toFixed(2)),
            pressure: Number((data.current.pressure_mb * 100).toFixed(2)), // Convert to Pa
            precipitation: Number(data.current.precip_mm.toFixed(2)),
            condition: data.current.condition.text,
            icon: data.current.condition.icon,
            locationName: data.location.name,
            locationCountry: data.location.country,
        }

        this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
        return result
    }

    async getWeatherForecast(
        location?: string,
        hours: number = 48
    ): Promise<{ forecast: WeatherForecast[], locationName?: string, locationCountry?: string }> {
        let query = (location || this.defaultLocation || 'London,UK').trim()

        // Final safety check: if query looks like hex/API key, fallback
        if (query === 'undefined' || query === '' || /^[a-f0-9]{15,}$/i.test(query)) {
            query = 'London,UK'
        }

        if (!this.apiKey) {
            throw new Error('Weather API key not configured')
        }

        const cacheKey = `forecast_${query}_${hours}`
        const cached = this.cache.get(cacheKey)
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            console.log(`[WeatherService] Serving Forecast from cache: ${query} (${hours}H)`)
            return cached.data
        }

        const days = Math.ceil(hours / 24)
        const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(query)}&days=${days}&aqi=no`
        console.log(`[WeatherService] Fetching Forecast: ${url.replace(this.apiKey, '***')}`)

        const response = await fetch(url)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const apiMessage = errorData.error?.message || response.statusText;
            throw new Error(`API_ERROR: ${response.status} - ${apiMessage}`);
        }

        const data = await response.json()
        const forecast: WeatherForecast[] = []

        let hourCount = 0
        for (const day of data.forecast.forecastday) {
            for (const hour of day.hour) {
                if (hourCount >= hours) break

                forecast.push({
                    hour: hourCount + 1,
                    temperature: Number(hour.temp_c.toFixed(2)),
                    humidity: Number(hour.humidity.toFixed(2)),
                    windSpeed: Number((hour.wind_kph / 3.6).toFixed(2)), // Convert to m/s
                    cloudCover: Number(hour.cloud.toFixed(2)),
                    solarRadiation: Number(this.estimateSolarRadiation(hour.cloud, hour.is_day).toFixed(2)),
                    pressure: Number((hour.pressure_mb * 100).toFixed(2)), // Convert to Pa
                    precipitation: Number(hour.precip_mm.toFixed(2)),
                    timestamp: hour.time,
                })

                hourCount++
            }
            if (hourCount >= hours) break
        }

        const result = {
            forecast,
            locationName: data.location.name,
            locationCountry: data.location.country
        }

        this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
        return result
    }

    private estimateSolarRadiation(cloudCover: number, isDay: number): number {
        // Estimate solar radiation based on cloud cover and time of day
        // Max solar radiation ~1000 W/m² on clear day
        if (!isDay) return 0

        const maxRadiation = 1000
        const cloudFactor = (100 - cloudCover) / 100
        return maxRadiation * cloudFactor
    }
}

export const weatherService = new WeatherService()
