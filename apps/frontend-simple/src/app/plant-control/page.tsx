"use client"

import { useState } from 'react'
import { NavigationHeader } from '@/components/navigation-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner, ErrorDisplay } from '@/components/ui/error-boundary'
import { useCachedData } from '@/hooks/useApi'
import { Power, Settings, AlertTriangle, CheckCircle, Thermometer, Gauge, Fuel, TrendingUp, Play, Square, Wrench, Zap, Brain, Bell } from 'lucide-react'

// Mock plant status data
const plantStatus = {
  isRunning: true,
  currentDemand: 2.8,
  predictedDemand: 3.2,
  fuelConsumption: 45.6,
  efficiency: 87.3,
  temperature: 185,
  pressure: 8.2,
  fuelLevel: 78.5,
  runtime: 1420
}

const alerts = [
  {
    type: 'warning',
    title: 'High Demand Predicted',
    message: 'Demand expected to increase by 20% in next 4 hours',
    time: '2 min ago',
    icon: AlertTriangle,
    color: 'text-yellow-600 bg-yellow-50'
  },
  {
    type: 'info',
    title: 'AI Optimization Active',
    message: 'System automatically adjusted temperature setpoint',
    time: '15 min ago',
    icon: Brain,
    color: 'text-blue-600 bg-blue-50'
  },
  {
    type: 'success',
    title: 'Efficiency Improved',
    message: 'Current efficiency: 87.3% (+2.1% from yesterday)',
    time: '1 hour ago',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50'
  }
]

// Real API data fetchers - moved outside component to prevent recreation
const plantStatusFetcher = async () => {
  // Simulate real plant status data
  return {
    isRunning: Math.random() > 0.1,
    currentDemand: 2.8 + Math.random() * 0.4,
    predictedDemand: 3.2 + Math.random() * 0.3,
    fuelConsumption: 45.6 + Math.random() * 5,
    efficiency: 85 + Math.random() * 10,
    temperature: 180 + Math.random() * 20,
    pressure: 8 + Math.random() * 2,
    fuelLevel: 75 + Math.random() * 20,
    runtime: 1400 + Math.random() * 100
  }
}

const productionDataFetcher = async () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    actual: 2.5 + Math.sin(i * 0.3) * 0.5 + Math.random() * 0.3,
    predicted: 2.4 + Math.sin(i * 0.3) * 0.5 + Math.random() * 0.2,
    efficiency: 85 + Math.sin(i * 0.2) * 10 + Math.random() * 5
  }))
}

export default function PlantControlPage() {
  // API data hooks
  const { data: realPlantStatus, loading: statusLoading, error: statusError } = useCachedData('plant-status', plantStatusFetcher, 30 * 1000)
  const { data: productionData, loading: productionLoading, error: productionError } = useCachedData('production-data', productionDataFetcher, 60 * 1000)
  
  // Use real data if available, fallback to mock data
  const currentPlantStatus = realPlantStatus || plantStatus
  
  const [isRunning, setIsRunning] = useState(currentPlantStatus.isRunning)
  const [autoMode, setAutoMode] = useState(true)
  const [temperature, setTemperature] = useState(currentPlantStatus.temperature)
  const [pressure, setPressure] = useState(currentPlantStatus.pressure)
  const [demandResponse, setDemandResponse] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <NavigationHeader title="Plant Control" showBackButton />
      
      <main className="container mx-auto px-4 py-8">
        {/* Plant Status Overview */}
        <Card className="mb-8 bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Power className="h-8 w-8 mr-3" />
              District Heating Plant Status
            </CardTitle>
            <CardDescription className="text-orange-100">
              Current operational status and key metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {isRunning ? (
                    <CheckCircle className="h-8 w-8 text-green-300" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-300" />
                  )}
                </div>
                <div className="text-lg font-bold">{isRunning ? 'RUNNING' : 'STOPPED'}</div>
                <div className="text-orange-100 text-sm">Plant Status</div>
              </div>
              
              <div className="text-center">
                {statusLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{currentPlantStatus.currentDemand?.toFixed(1)} MW</div>
                    <div className="text-orange-100 text-sm">Current Demand</div>
                    <div className="text-xs text-orange-200">Target: {currentPlantStatus.predictedDemand?.toFixed(1)} MW</div>
                  </>
                )}
              </div>
              
              <div className="text-center">
                {statusLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{currentPlantStatus.efficiency?.toFixed(1)}%</div>
                    <div className="text-orange-100 text-sm">Efficiency</div>
                    <div className="text-xs text-orange-200">+2.1% from yesterday</div>
                  </>
                )}
              </div>
              
              <div className="text-center">
                {statusLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {isRunning ? (
                        <span className="animate-pulse">●</span>
                      ) : (
                        <span>○</span>
                      )} {Math.floor(currentPlantStatus.runtime / 60)}:{String(Math.floor(currentPlantStatus.runtime % 60)).padStart(2, '0')}
                    </div>
                    <div className="text-orange-100 text-sm">Runtime</div>
                    <div className="text-xs text-orange-200">Continuous operation</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Interface */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Controls</CardTitle>
                <CardDescription>Primary plant operation controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant={isRunning ? "destructive" : "default"}
                    size="lg"
                    onClick={() => setIsRunning(!isRunning)}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    {isRunning ? <Square className="h-6 w-6 mb-1" /> : <Play className="h-6 w-6 mb-1" />}
                    {isRunning ? 'Stop' : 'Start'}
                  </Button>
                  
                  <Button
                    variant={autoMode ? "default" : "outline"}
                    size="lg"
                    onClick={() => setAutoMode(!autoMode)}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Settings className="h-6 w-6 mb-1" />
                    Auto Mode
                  </Button>
                  
                  <Button
                    variant={demandResponse ? "default" : "outline"}
                    size="lg"
                    onClick={() => setDemandResponse(!demandResponse)}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Zap className="h-6 w-6 mb-1" />
                    Demand Response
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Wrench className="h-6 w-6 mb-1" />
                    Maintenance
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temperature & Pressure Control</CardTitle>
                <CardDescription>Adjust operating parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium flex items-center">
                        <Thermometer className="h-4 w-4 mr-2" />
                        Temperature: {temperature}°C
                      </label>
                      <span className="text-xs text-muted-foreground">Range: 160-200°C</span>
                    </div>
                    <input
                      type="range"
                      min="160"
                      max="200"
                      value={temperature}
                      onChange={(e) => setTemperature(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={autoMode}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium flex items-center">
                        <Gauge className="h-4 w-4 mr-2" />
                        Pressure: {pressure} bar
                      </label>
                      <span className="text-xs text-muted-foreground">Range: 6-12 bar</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="12"
                      step="0.1"
                      value={pressure}
                      onChange={(e) => setPressure(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={autoMode}
                    />
                  </div>
                  
                  {autoMode && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Brain className="h-4 w-4 inline mr-1" />
                        Auto mode is active. AI system is optimizing parameters automatically.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuel & Efficiency Monitoring</CardTitle>
                <CardDescription>Real-time efficiency and consumption tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Fuel className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-800">{plantStatus.fuelConsumption}</div>
                    <div className="text-sm text-yellow-700">kg/h Fuel Rate</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-800">{plantStatus.efficiency}%</div>
                    <div className="text-sm text-green-700">Efficiency</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Gauge className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-800">{plantStatus.fuelLevel}%</div>
                    <div className="text-sm text-blue-700">Fuel Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Thermometer className="h-5 w-5 mr-2" />
                  Heat Requirements Feed
                </CardTitle>
                <CardDescription>Current heat demand values being fed to the plant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-red-800">Current Heat Demand</div>
                          <div className="text-2xl font-bold text-red-900">{currentPlantStatus.currentDemand?.toFixed(1)} MW</div>
                        </div>
                        <Thermometer className="h-8 w-8 text-red-600" />
                      </div>
                      <div className="text-xs text-red-700 mt-1">Real-time from district network</div>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-orange-800">Predicted Demand (1h)</div>
                          <div className="text-2xl font-bold text-orange-900">{currentPlantStatus.predictedDemand?.toFixed(1)} MW</div>
                        </div>
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="text-xs text-orange-700 mt-1">AI forecast for next hour</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-blue-800">Peak Demand Today</div>
                          <div className="text-2xl font-bold text-blue-900">{(currentPlantStatus.currentDemand * 1.3).toFixed(1)} MW</div>
                        </div>
                        <Zap className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-xs text-blue-700 mt-1">Highest demand recorded today</div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-green-800">Average Demand (24h)</div>
                          <div className="text-2xl font-bold text-green-900">{(currentPlantStatus.currentDemand * 0.85).toFixed(1)} MW</div>
                        </div>
                        <Settings className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="text-xs text-green-700 mt-1">24-hour rolling average</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Demand Response Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${demandResponse ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {demandResponse ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {demandResponse 
                      ? 'System is responding to grid demand signals and adjusting output accordingly'
                      : 'System operating at normal capacity based on local demand only'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Optimization & Alerts */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Optimization Status
                </CardTitle>
                <CardDescription>Current AI-driven optimizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Predictive Control</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Adjusting output based on 6-hour demand forecast
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Efficiency Optimization</span>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fine-tuning combustion parameters for optimal efficiency
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Load Balancing</span>
                      <Settings className="h-4 w-4 text-yellow-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Coordinating with grid demand response signals
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Alerts & Notifications
                </CardTitle>
                <CardDescription>System alerts and status updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg ${alert.color}`}>
                      <div className="flex items-start space-x-3">
                        <alert.icon className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{alert.title}</h4>
                            <span className="text-xs opacity-75">{alert.time}</span>
                          </div>
                          <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Emergency and maintenance controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="destructive" className="w-full" size="lg">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Stop
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Wrench className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    System Diagnostics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
