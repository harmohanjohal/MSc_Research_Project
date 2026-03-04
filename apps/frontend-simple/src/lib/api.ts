// API Service for Heat Demand Prediction Backend

export interface WeatherData {
  temperature: number
  windSpeed: number
  humidity: number
  solarRadiation: number
  cloudCover: number
  pressure?: number
  precipitation?: number
}

export interface BuildingData {
  buildingType?: string
  floorArea?: number
  occupancy?: number
  [key: string]: any
}

export interface PredictionResult {
  heat_demand_kw: number
  timestamp: string
  features_used: Record<string, number>
  confidence?: number
}

export interface ModelInfo {
  model_type: string
  features?: string[]
  top_features?: Array<{ feature: string; importance: number }>
  total_features?: number
  performance: {
    r2_score?: number
    test_r2?: number
    mae?: number
    test_mae?: number
    rmse?: number
    test_rmse?: number
    test_mape?: number
    test_mape_standard?: number
    test_mape_threshold?: number
    test_mape_non_zero?: number
    test_smape?: number
  }
  training_date?: string
  version?: string
  confidence?: {
    rating?: string
  }
}

export interface HealthStatus {
  status: string
  model_loaded: boolean
  timestamp: string
  backend_version?: string
}

class ApiService {
  private baseUrl: string
  private maxRetries: number = 3
  private retryDelay: number = 1000

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://127.0.0.1:5000')
  }

  // Retry wrapper for API calls
  async withRetry<T>(fn: () => Promise<T>, retries: number = this.maxRetries): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        return this.withRetry(fn, retries - 1)
      }
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`)
      return response.ok
    } catch {
      return false
    }
  }

  async checkHealth(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseUrl}/api/health`)
    if (!response.ok) throw new Error('Health check failed')
    return response.json()
  }

  async getModelInfo(): Promise<ModelInfo> {
    const response = await fetch(`${this.baseUrl}/api/model-info`)
    if (!response.ok) throw new Error('Failed to get model info')
    return response.json()
  }

  async predictSingle(
    weatherData: WeatherData,
    buildingData?: BuildingData,
    timestamp?: string
  ): Promise<PredictionResult> {
    const response = await fetch(`${this.baseUrl}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weatherData,
        buildingData,
        timestamp,
      }),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Prediction failed: ${error}`)
    }
    return response.json()
  }

  async predictHorizon(
    currentWeather: WeatherData,
    forecast: WeatherData[],
    horizon: number = 24,
    buildingData?: BuildingData
  ): Promise<{ predictions: any[] }> {
    const response = await fetch(`${this.baseUrl}/api/predict-horizon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weatherData: currentWeather,
        weatherForecast: forecast,
        horizon,
        buildingData
      }),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Horizon prediction failed: ${error}`)
    }
    return response.json()
  }
}

export const apiService = new ApiService()
