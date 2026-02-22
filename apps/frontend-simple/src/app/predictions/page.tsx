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
import {
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Home,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  Table,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { weatherService, type WeatherData, type WeatherForecast } from '@/lib/weather'
import { apiService } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface BuildingSpecs {
  buildingType: string
  floorArea: number
  numFloors: number
  constructionYear: number
  insulationLevel: string
  occupancy: number
  heatingSystem: string
}

interface PredictionResult {
  hour: number
  heatDemand: number
  temperature: number
  humidity: number
  windSpeed: number
  solarRadiation: number
  timestamp: string
}

interface PredictionSummary {
  totalDemand: number
  peakDemand: number
  averageDemand: number
  peakHour: number
  totalHours: number
}

const timeHorizons = [
  { value: 1, label: "1 Hour" },
  { value: 3, label: "3 Hours" },
  { value: 6, label: "6 Hours" },
  { value: 12, label: "12 Hours" },
  { value: 24, label: "24 Hours" }
]

const buildingTypes = [
  { value: "detached", label: "Detached House" },
  { value: "semi_detached", label: "Semi-Detached House" },
  { value: "terraced", label: "Terraced House" },
  { value: "bungalow", label: "Bungalow" },
  { value: "apartment", label: "Apartment" }
]

const insulationLevels = [
  { value: "poor", label: "Poor (Pre-1980)" },
  { value: "basic", label: "Basic (1980-2000)" },
  { value: "good", label: "Good (2000-2010)" },
  { value: "excellent", label: "Excellent (Post-2010)" }
]

const heatingSystems = [
  { value: "gas_boiler", label: "Gas Boiler" },
  { value: "electric", label: "Electric Heating" },
  { value: "heat_pump", label: "Heat Pump" },
  { value: "district_heating", label: "District Heating" }
]

export default function PredictionsPage() {
  const [buildingSpecs, setBuildingSpecs] = useState<BuildingSpecs>({
    buildingType: "detached",
    floorArea: 120,
    numFloors: 2,
    constructionYear: 2000,
    insulationLevel: "good",
    occupancy: 4,
    heatingSystem: "gas_boiler"
  })

  const [timeHorizon, setTimeHorizon] = useState(24)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [summary, setSummary] = useState<PredictionSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherForecast[]>([])

  const fetchWeatherForecast = async () => {
    try {
      const forecast = await weatherService.getWeatherForecast('London', timeHorizon)
      setWeatherData(forecast)
    } catch (err) {
      console.error('Failed to fetch weather forecast:', err)
      setError('Failed to fetch weather data')
    }
  }

  const generatePredictions = async () => {
    if (!weatherData.length) {
      setError('Weather data not available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results: PredictionResult[] = []

      for (let i = 0; i < timeHorizon; i++) {
        const weather = weatherData[i]
        const timestamp = new Date()
        timestamp.setHours(timestamp.getHours() + i)

        // Build clean API payloads
        const weatherPayload = {
          temperature: weather.temperature,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          solarRadiation: weather.solarRadiation,
          cloudCover: weather.cloudCover,
          pressure: weather.pressure,
          precipitation: weather.precipitation
        }

        const buildingPayload = {
          floorArea: buildingSpecs.floorArea,
          insulationLevel: buildingSpecs.insulationLevel,
          buildingType: buildingSpecs.buildingType,
          occupancy: buildingSpecs.occupancy
        }

        // Make prediction using the API
        const prediction = await apiService.predictSingle(weatherPayload, buildingPayload, timestamp.toISOString())

        results.push({
          hour: i + 1,
          heatDemand: prediction.heat_demand_kw,
          temperature: weather.temperature,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          solarRadiation: weather.solarRadiation,
          timestamp: timestamp.toISOString()
        })
      }

      setPredictions(results)

      // Calculate summary
      const demands = results.map(r => r.heatDemand)
      const totalDemand = demands.reduce((sum, demand) => sum + demand, 0)
      const peakDemand = Math.max(...demands)
      const averageDemand = totalDemand / demands.length
      const peakHour = results.find(r => r.heatDemand === peakDemand)?.hour || 1

      setSummary({
        totalDemand,
        peakDemand,
        averageDemand,
        peakHour,
        totalHours: timeHorizon
      })

    } catch (err) {
      console.error('Prediction failed:', err)
      setError('Failed to generate predictions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherForecast()
  }, [timeHorizon])

  const handlePredict = () => {
    generatePredictions()
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDemandColor = (demand: number) => {
    if (demand > 15) return 'text-red-600'
    if (demand > 10) return 'text-orange-600'
    if (demand > 5) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="flex-1 w-full">
      <NavigationHeader title="Heat Demand Predictions" showBackButton />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Building Specifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Building Specifications
            </CardTitle>
            <CardDescription>
              Configure your building parameters for heat demand prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="buildingType">Building Type</Label>
                <Select
                  value={buildingSpecs.buildingType}
                  onValueChange={(value) => setBuildingSpecs(prev => ({ ...prev, buildingType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floorArea">Floor Area (m²)</Label>
                <Input
                  type="number"
                  value={buildingSpecs.floorArea}
                  onChange={(e) => setBuildingSpecs(prev => ({ ...prev, floorArea: Number(e.target.value) }))}
                  onBlur={(e) => setBuildingSpecs(prev => ({ ...prev, floorArea: Number(Number(e.target.value).toFixed(2)) }))}
                  min="20"
                  max="500"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numFloors">Number of Floors</Label>
                <Input
                  type="number"
                  value={buildingSpecs.numFloors}
                  onChange={(e) => setBuildingSpecs(prev => ({ ...prev, numFloors: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constructionYear">Construction Year</Label>
                <Input
                  type="number"
                  value={buildingSpecs.constructionYear}
                  onChange={(e) => setBuildingSpecs(prev => ({ ...prev, constructionYear: Number(e.target.value) }))}
                  min="1900"
                  max="2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insulationLevel">Insulation Level</Label>
                <Select
                  value={buildingSpecs.insulationLevel}
                  onValueChange={(value) => setBuildingSpecs(prev => ({ ...prev, insulationLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {insulationLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupancy">Occupancy</Label>
                <Input
                  type="number"
                  value={buildingSpecs.occupancy}
                  onChange={(e) => setBuildingSpecs(prev => ({ ...prev, occupancy: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heatingSystem">Heating System</Label>
                <Select
                  value={buildingSpecs.heatingSystem}
                  onValueChange={(value) => setBuildingSpecs(prev => ({ ...prev, heatingSystem: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {heatingSystems.map(system => (
                      <SelectItem key={system.value} value={system.value}>
                        {system.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Prediction Settings
            </CardTitle>
            <CardDescription>
              Configure prediction time horizon and generate heat demand forecasts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeHorizon">Time Horizon</Label>
                <Select value={timeHorizon.toString()} onValueChange={(value) => setTimeHorizon(Number(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeHorizons.map(horizon => (
                      <SelectItem key={horizon.value} value={horizon.value.toString()}>
                        {horizon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handlePredict}
                disabled={loading || !weatherData.length}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Generate Predictions
                  </>
                )}
              </Button>

              {error && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {predictions.length > 0 && summary && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Demand</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalDemand.toFixed(1)} kWh</div>
                  <p className="text-xs text-muted-foreground">
                    Over {summary.totalHours} hours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peak Demand</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.peakDemand.toFixed(1)} kW</div>
                  <p className="text-xs text-muted-foreground">
                    At hour {summary.peakHour}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Demand</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.averageDemand.toFixed(1)} kW</div>
                  <p className="text-xs text-muted-foreground">
                    Per hour
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weather Status</CardTitle>
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{predictions[0].temperature.toFixed(1)}°C</div>
                  <p className="text-xs text-muted-foreground">
                    Current temperature
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Tables */}
            <Tabs defaultValue="chart" className="space-y-4">
              <TabsList>
                <TabsTrigger value="chart">Chart View</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Heat Demand Forecast</CardTitle>
                    <CardDescription>
                      Hourly heat demand predictions based on weather forecast
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={predictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="hour"
                          label={{ value: 'Hour', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis
                          label={{ value: 'Heat Demand (kW)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value.toFixed(1)} kW`, 'Heat Demand']}
                          labelFormatter={(label) => `Hour ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="heatDemand"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Temperature vs Demand</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={predictions}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#ef4444" />
                          <Line yAxisId="right" type="monotone" dataKey="heatDemand" stroke="#3b82f6" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Demand Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={predictions}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kW`, 'Heat Demand']} />
                          <Bar dataKey="heatDemand" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="table">
                <Card>
                  <CardHeader>
                    <CardTitle>Hourly Breakdown</CardTitle>
                    <CardDescription>
                      Detailed hourly predictions with weather conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Hour</th>
                            <th className="text-left p-2">Time</th>
                            <th className="text-left p-2">Heat Demand</th>
                            <th className="text-left p-2">Temperature</th>
                            <th className="text-left p-2">Humidity</th>
                            <th className="text-left p-2">Wind Speed</th>
                            <th className="text-left p-2">Solar Radiation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictions.map((prediction, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-medium">{prediction.hour}</td>
                              <td className="p-2">{formatTime(prediction.timestamp)}</td>
                              <td className={`p-2 font-bold ${getDemandColor(prediction.heatDemand)}`}>
                                {prediction.heatDemand.toFixed(1)} kW
                              </td>
                              <td className="p-2">{prediction.temperature.toFixed(1)}°C</td>
                              <td className="p-2">{prediction.humidity}%</td>
                              <td className="p-2">{prediction.windSpeed.toFixed(1)} m/s</td>
                              <td className="p-2">{prediction.solarRadiation.toFixed(0)} W/m²</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
