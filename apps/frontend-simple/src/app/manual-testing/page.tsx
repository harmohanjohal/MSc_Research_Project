"use client"

import { useState, useEffect } from 'react'
import { NavigationHeader } from '@/components/navigation-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Home, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Zap,
  Building,
  Layers,
  Gauge,
  Calendar,
  BarChart3
} from 'lucide-react'
import { apiService, type WeatherData, type BuildingData, type PredictionResult, type ModelInfo } from '@/lib/api'
import { weatherService } from '@/lib/weather'

interface HourlyWeatherData {
  [hour: number]: WeatherData
}

interface HourlyPrediction {
  hour: number
  weather: WeatherData
  prediction: PredictionResult
  timestamp: string
}

export default function ManualTestingPage() {
  const [predictionHorizon, setPredictionHorizon] = useState<1 | 3 | 6>(1)
  const [hourlyWeatherData, setHourlyWeatherData] = useState<HourlyWeatherData>({})
  const [buildingData, setBuildingData] = useState<BuildingData>({
    floorArea: 120,
    numFloors: 2,
    infiltrationRate: 0.5,
    buildingType: 'detached',
    constructionType: 'standard'
  })

  const [hourlyPredictions, setHourlyPredictions] = useState<HourlyPrediction[]>([])
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiHealth, setApiHealth] = useState<boolean>(false)

  // Initialize weather data for selected horizon
  useEffect(() => {
    const initializeWeatherData = async () => {
      const newHourlyWeather: HourlyWeatherData = {}
      
      try {
        // Try to get real weather data for the selected horizon
        const isAvailable = await weatherService.isAvailable()
        if (isAvailable) {
          const forecast = await weatherService.getWeatherForecast('London', predictionHorizon)
          for (let hour = 1; hour <= predictionHorizon; hour++) {
            if (!hourlyWeatherData[hour]) {
              const hourData = forecast[hour - 1] // Convert to 0-based index
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
          // Fallback to mock data if weather API is not available
          for (let hour = 1; hour <= predictionHorizon; hour++) {
            if (!hourlyWeatherData[hour]) {
              newHourlyWeather[hour] = {
                temperature: 5 + (hour * 2), // Slightly different for each hour
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
        // Fallback to mock data
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

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth()
    loadModelInfo()
  }, [])

  const checkApiHealth = async () => {
    try {
      const health = await apiService.checkHealth()
      setApiHealth(health.status === 'healthy')
    } catch (error) {
      setApiHealth(false)
      console.error('API health check failed:', error)
    }
  }

  const loadModelInfo = async () => {
    try {
      const info = await apiService.getModelInfo()
      setModelInfo(info)
    } catch (error) {
      console.error('Failed to load model info:', error)
    }
  }

  const handleWeatherChange = (hour: number, field: keyof WeatherData, value: number) => {
    setHourlyWeatherData(prev => ({
      ...prev,
      [hour]: {
        ...prev[hour],
        [field]: value
      }
    }))
  }

  const handleBuildingChange = (field: keyof BuildingData, value: any) => {
    setBuildingData(prev => ({ ...prev, [field]: value }))
  }

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    setHourlyPredictions([])

    try {
      const predictions: HourlyPrediction[] = []
      
      for (let hour = 1; hour <= predictionHorizon; hour++) {
        const weatherData = hourlyWeatherData[hour]
        if (!weatherData) {
          throw new Error(`Missing weather data for hour ${hour}`)
        }

        const result = await apiService.predictSingle(weatherData, buildingData)
        predictions.push({
          hour,
          weather: weatherData,
          prediction: result,
          timestamp: result.timestamp
        })
      }

      setHourlyPredictions(predictions)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const getPredictionStatus = (demand: number) => {
    if (demand < 1) return { status: 'low', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    if (demand < 3) return { status: 'moderate', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
    return { status: 'high', color: 'bg-red-100 text-red-800', icon: AlertCircle }
  }

  const getTotalDemand = () => {
    return hourlyPredictions.reduce((sum, pred) => sum + pred.prediction.heat_demand_kw, 0)
  }

  const getAverageDemand = () => {
    return hourlyPredictions.length > 0 ? getTotalDemand() / hourlyPredictions.length : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationHeader title="Manual Testing" showBackButton />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* API Status */}
        <div className="flex justify-end mb-6">
          <Badge variant={apiHealth ? "default" : "destructive"} className="flex items-center gap-2">
            {apiHealth ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {apiHealth ? "API Connected" : "API Disconnected"}
          </Badge>
        </div>

      <Tabs defaultValue="prediction" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prediction">Multi-Hour Prediction</TabsTrigger>
          <TabsTrigger value="model">Model Info</TabsTrigger>
          <TabsTrigger value="features">Feature Details</TabsTrigger>
        </TabsList>

        <TabsContent value="prediction" className="space-y-6">
          {/* Prediction Horizon Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Prediction Horizon
              </CardTitle>
              <CardDescription>
                Select how many hours ahead you want to predict
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label htmlFor="horizon" className="text-sm font-medium">
                  Prediction Hours:
                </Label>
                <Select
                  value={predictionHorizon.toString()}
                  onValueChange={(value) => setPredictionHorizon(parseInt(value) as 1 | 3 | 6)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="3">3 Hours</SelectItem>
                    <SelectItem value="6">6 Hours</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {predictionHorizon} hour{predictionHorizon > 1 ? 's' : ''} ahead
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Forms */}
            <div className="space-y-6">
              {/* Building Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Building Specifications
                  </CardTitle>
                  <CardDescription>
                    Building characteristics (same for all hours)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="floorArea">Floor Area (m²)</Label>
                      <Input
                        id="floorArea"
                        type="number"
                        value={buildingData.floorArea}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBuildingChange('floorArea', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="numFloors">Number of Floors</Label>
                      <Input
                        id="numFloors"
                        type="number"
                        value={buildingData.numFloors}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBuildingChange('numFloors', parseInt(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="infiltrationRate">Infiltration Rate (ACH)</Label>
                      <Input
                        id="infiltrationRate"
                        type="number"
                        value={buildingData.infiltrationRate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBuildingChange('infiltrationRate', parseFloat(e.target.value))}
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="buildingType">Building Type</Label>
                      <Select
                        value={buildingData.buildingType}
                        onValueChange={(value) => handleBuildingChange('buildingType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="detached">Detached House</SelectItem>
                          <SelectItem value="end_terrace">End Terrace</SelectItem>
                          <SelectItem value="mid_terrace">Mid Terrace</SelectItem>
                          <SelectItem value="bungalow">Bungalow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="constructionType">Construction Type</Label>
                      <Select
                        value={buildingData.constructionType}
                        onValueChange={(value) => handleBuildingChange('constructionType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="terrace">Terrace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hourly Weather Inputs */}
              {Array.from({ length: predictionHorizon }, (_, i) => i + 1).map((hour) => (
                <Card key={hour}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      Hour {hour} Weather Conditions
                    </CardTitle>
                    <CardDescription>
                      Weather parameters for hour {hour}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`temp-${hour}`}>Temperature (°C)</Label>
                        <Input
                          id={`temp-${hour}`}
                          type="number"
                          value={hourlyWeatherData[hour]?.temperature || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeatherChange(hour, 'temperature', parseFloat(e.target.value))}
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`humidity-${hour}`}>Humidity (%)</Label>
                        <Input
                          id={`humidity-${hour}`}
                          type="number"
                          value={hourlyWeatherData[hour]?.humidity || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeatherChange(hour, 'humidity', parseFloat(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`wind-${hour}`}>Wind Speed (m/s)</Label>
                        <Input
                          id={`wind-${hour}`}
                          type="number"
                          value={hourlyWeatherData[hour]?.windSpeed || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeatherChange(hour, 'windSpeed', parseFloat(e.target.value))}
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`solar-${hour}`}>Solar Radiation (W/m²)</Label>
                        <Input
                          id={`solar-${hour}`}
                          type="number"
                          value={hourlyWeatherData[hour]?.solarRadiation || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeatherChange(hour, 'solarRadiation', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`cloud-${hour}`}>Cloud Cover (0-10)</Label>
                        <Input
                          id={`cloud-${hour}`}
                          type="number"
                          value={hourlyWeatherData[hour]?.cloudCover || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeatherChange(hour, 'cloudCover', parseFloat(e.target.value))}
                          min="0"
                          max="10"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`precip-${hour}`}>Precipitation (mm)</Label>
                        <Input
                          id={`precip-${hour}`}
                          type="number"
                          value={hourlyWeatherData[hour]?.precipitation || 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeatherChange(hour, 'precipitation', parseFloat(e.target.value))}
                          step="0.1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button 
                onClick={handlePredict} 
                disabled={loading || !apiHealth}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Making Predictions...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Predict Heat Demand for {predictionHorizon} Hour{predictionHorizon > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Prediction Results
                </CardTitle>
                <CardDescription>
                  AI-generated heat demand forecast for {predictionHorizon} hour{predictionHorizon > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {hourlyPredictions.length > 0 && (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {getTotalDemand().toFixed(3)} kW
                        </div>
                        <div className="text-sm text-muted-foreground">Total Demand</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {getAverageDemand().toFixed(3)} kW
                        </div>
                        <div className="text-sm text-muted-foreground">Average/Hour</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Hourly Predictions */}
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Hourly Breakdown
                      </h4>
                      {hourlyPredictions.map((hourlyPred) => {
                        const predictionStatus = getPredictionStatus(hourlyPred.prediction.heat_demand_kw)
                        return (
                          <Card key={hourlyPred.hour} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">Hour {hourlyPred.hour}</Badge>
                                  <Badge className={predictionStatus.color}>
                                    <predictionStatus.icon className="mr-1 h-3 w-3" />
                                    {predictionStatus.status}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-primary">
                                    {hourlyPred.prediction.heat_demand_kw.toFixed(3)} kW
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(hourlyPred.timestamp).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Temp:</span>
                                  <span className="font-medium">{hourlyPred.weather.temperature}°C</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Humidity:</span>
                                  <span className="font-medium">{hourlyPred.weather.humidity}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Wind:</span>
                                  <span className="font-medium">{hourlyPred.weather.windSpeed} m/s</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </>
                )}

                {!hourlyPredictions.length && !loading && (
                  <div className="text-center text-muted-foreground py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter parameters and click "Predict Heat Demand" to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Model Information
              </CardTitle>
              <CardDescription>
                Details about the CatBoost heat demand prediction model
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelInfo ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{modelInfo.model_type}</div>
                      <div className="text-sm text-muted-foreground">Model Type</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{modelInfo.total_features}</div>
                      <div className="text-sm text-muted-foreground">Features</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{modelInfo.performance.test_r2.toFixed(3)}</div>
                      <div className="text-sm text-muted-foreground">R² Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{modelInfo.performance.test_mape.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">MAPE</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Top Features by Importance</h4>
                    <div className="space-y-2">
                      {modelInfo.top_features.slice(0, 10).map((feature, index) => (
                        <div key={feature.feature} className="flex items-center justify-between">
                          <span className="text-sm">{feature.feature}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={feature.importance * 100} className="w-20" />
                            <span className="text-sm font-medium">{(feature.importance * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Training Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Training Date:</span>
                        <div className="font-medium">{modelInfo.training_date}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model Version:</span>
                        <div className="font-medium">CatBoost-v1.0</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                  <p>Loading model information...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Feature Engineering
              </CardTitle>
              <CardDescription>
                Understanding the 44 features used by the model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Weather Features</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <Badge variant="outline">Temperature (°C)</Badge>
                    <Badge variant="outline">Relative Humidity (%)</Badge>
                    <Badge variant="outline">Wind Speed (m/s)</Badge>
                    <Badge variant="outline">Direct Normal Radiation</Badge>
                    <Badge variant="outline">Diffuse Horizontal Radiation</Badge>
                    <Badge variant="outline">Total Sky Cover</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Building Features</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <Badge variant="outline">Floor Area (m²)</Badge>
                    <Badge variant="outline">Number of Floors</Badge>
                    <Badge variant="outline">Infiltration Rate (ACH)</Badge>
                    <Badge variant="outline">Building Type (One-hot)</Badge>
                    <Badge variant="outline">Construction Type (One-hot)</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Temporal Features</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <Badge variant="outline">Hour of Day</Badge>
                    <Badge variant="outline">Day of Month</Badge>
                    <Badge variant="outline">Month</Badge>
                    <Badge variant="outline">Day of Week</Badge>
                    <Badge variant="outline">Is Weekend</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Derived Features</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <Badge variant="outline">Heating Degree Hours (HDD)</Badge>
                    <Badge variant="outline">Is Cold</Badge>
                    <Badge variant="outline">Is Freezing</Badge>
                    <Badge variant="outline">Temperature Lags (1h, 3h, 6h, 12h)</Badge>
                    <Badge variant="outline">HDD Lags (1h, 3h, 6h, 12h)</Badge>
                    <Badge variant="outline">Rolling Means & Sums</Badge>
                    <Badge variant="outline">Temperature Trends</Badge>
                    <Badge variant="outline">Interaction Features</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  )
}
