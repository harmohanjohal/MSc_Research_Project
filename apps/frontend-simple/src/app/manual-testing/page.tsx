"use client"

import { NavigationHeader } from '@/components/navigation-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Gauge,
  Calendar,
  Layers,
  BarChart3
} from 'lucide-react'
import { useApiHealth, useModelInfo } from '@/hooks/useApi'
import { useManualPrediction } from '@/hooks/useManualPrediction'
import { BuildingSpecsCard } from '@/components/building-specs-card'
import { HourlyWeatherInputCard } from '@/components/hourly-weather-input-card'
import { HourlyPredictionCard } from '@/components/hourly-prediction-card'

export default function ManualTestingPage() {
  const { health: apiHealthData } = useApiHealth()
  const apiHealth = apiHealthData?.status === 'healthy'

  const { modelInfo } = useModelInfo()

  const {
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
  } = useManualPrediction()

  const getTotalDemand = () => {
    return hourlyPredictions.reduce((sum, pred) => sum + pred.prediction.heat_demand_kw, 0)
  }

  const getAverageDemand = () => {
    return hourlyPredictions.length > 0 ? getTotalDemand() / hourlyPredictions.length : 0
  }

  return (
    <div className="flex-1 w-full">
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
                <BuildingSpecsCard buildingData={buildingData} onBuildingChange={handleBuildingChange} />

                {Array.from({ length: predictionHorizon }, (_, i) => i + 1).map((hour) => (
                  <HourlyWeatherInputCard
                    key={hour}
                    hour={hour}
                    weatherData={hourlyWeatherData[hour] || {}}
                    onWeatherChange={handleWeatherChange}
                  />
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
              <Card className="h-fit lg:sticky lg:top-24 shadow-xl shadow-indigo-100/10">
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

                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Hourly Breakdown
                        </h4>
                        {hourlyPredictions.map((hourlyPred) => (
                          <HourlyPredictionCard key={hourlyPred.hour} hourlyPred={hourlyPred} />
                        ))}
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
                        <div className="text-2xl font-bold">{modelInfo?.performance?.test_r2?.toFixed(3) ?? "N/A"}</div>
                        <div className="text-sm text-muted-foreground">R² Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{modelInfo?.performance?.test_mape?.toFixed(1) ?? "N/A"}%</div>
                        <div className="text-sm text-muted-foreground">MAPE</div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3">Top Features by Importance</h4>
                      <div className="space-y-2">
                        {modelInfo?.top_features?.slice(0, 10).map((feature, index) => (
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
                  Understanding the features used by the model
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
