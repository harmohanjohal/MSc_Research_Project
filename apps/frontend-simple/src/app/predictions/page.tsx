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
  RefreshCw,
  AlertCircle,
  Target,
  Activity,
  ShieldCheck,
  Cpu
} from 'lucide-react'
import { weatherService, type WeatherForecast } from '@/lib/weather'
import { apiService, type WeatherData } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
  { value: 1, label: "1 HOUR PHASE" },
  { value: 3, label: "3 HOUR PHASE" },
  { value: 6, label: "6 HOUR PHASE" },
  { value: 12, label: "12 HOUR PHASE" },
  { value: 24, label: "24 HOUR PHASE" }
]

const buildingTypes = [
  { value: "detached", label: "DETACHED_HOUSE" },
  { value: "semi_detached", label: "SEMI_DETACHED" },
  { value: "terraced", label: "TERRACED_HOUSE" },
  { value: "bungalow", label: "BUNGALOW" },
  { value: "apartment", label: "APARTMENT" }
]

const insulationLevels = [
  { value: "poor", label: "POOR (PRE-1980)" },
  { value: "basic", label: "BASIC (1980-2000)" },
  { value: "good", label: "GOOD (2000-2010)" },
  { value: "excellent", label: "EXCELLENT (POST-2010)" }
]

const containerPresets = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
};

const itemPresets = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-md border border-primary/30 p-3 rounded-lg shadow-2xl font-mono text-xs">
        <p className="text-muted-foreground uppercase mb-1">HORIZON: {label}H</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-bold flex justify-between gap-4" style={{ color: p.color }}>
            <span>{p.name.toUpperCase()}:</span>
            <span>{p.value.toFixed(2)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
      const { forecast, locationName } = await weatherService.getWeatherForecast(undefined, timeHorizon)
      setWeatherData(forecast)
      // If we wanted to show location name, we could add a state for it here
      console.log(`[Predictions] Resolved location: ${locationName}`)
    } catch (err) {
      console.error('Failed to fetch weather forecast:', err)
      setError('SIGNAL_ERROR: WEATHER_DEGRADED')
    }
  }

  const generatePredictions = async () => {
    if (!weatherData.length) {
      setError('SIGNAL_ERROR: WEATHER_DATA_NULL')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const forecastSlice = weatherData.slice(0, timeHorizon)
      // Extract first hour as "current" and the rest as forecast for the API
      const currentWeather = forecastSlice[0]
      const weatherForecast = forecastSlice.slice(1)

      const weatherPayload: WeatherData = {
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        windSpeed: currentWeather.windSpeed,
        solarRadiation: currentWeather.solarRadiation,
        cloudCover: currentWeather.cloudCover,
        pressure: currentWeather.pressure,
        precipitation: currentWeather.precipitation
      }

      const buildingPayload = {
        floorArea: buildingSpecs.floorArea,
        insulationLevel: buildingSpecs.insulationLevel,
        buildingType: buildingSpecs.buildingType,
        occupancy: buildingSpecs.occupancy
      }

      const { predictions: horizonResult } = await apiService.predictHorizon(
        weatherPayload,
        weatherForecast,
        timeHorizon as any,
        buildingPayload
      )

      const results: PredictionResult[] = horizonResult.map((p: any, i: number) => {
        const weather = forecastSlice[i] || forecastSlice[forecastSlice.length - 1]
        return {
          hour: i + 1,
          heatDemand: p.demand,
          temperature: weather.temperature,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          solarRadiation: weather.solarRadiation,
          timestamp: p.timestamp
        }
      })

      setPredictions(results)

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
      setError('SIGNAL_ERROR: INFERENCE_FAILURE')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherForecast()
  }, [timeHorizon])

  return (
    <div className="flex-1 w-full bg-slate-950/20">
      <NavigationHeader title="CONTROL CENTER: FORECAST_MATRIX" showBackButton />

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerPresets}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              <motion.div variants={itemPresets}>
                <Card className="border-primary/20 bg-card/40">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-mono tracking-widest uppercase">STRUCTURAL_PARAMETERS</CardTitle>
                        <CardDescription className="text-[10px] font-mono uppercase opacity-70">Configure building structural telemetry</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">BUILDING_CLASS</Label>
                        <Select value={buildingSpecs.buildingType} onValueChange={(v) => setBuildingSpecs(p => ({ ...p, buildingType: v }))}>
                          <SelectTrigger className="bg-slate-900/50 border-primary/20 font-mono text-xs uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="font-mono text-xs uppercase">
                            {buildingTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">FLOOR_AREA (m²)</Label>
                        <Input
                          type="number"
                          value={buildingSpecs.floorArea}
                          onChange={(e) => setBuildingSpecs(p => ({ ...p, floorArea: Number(e.target.value) }))}
                          className="bg-slate-900/50 border-primary/20 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">INSULATION_FACTOR</Label>
                        <Select value={buildingSpecs.insulationLevel} onValueChange={(v) => setBuildingSpecs(p => ({ ...p, insulationLevel: v }))}>
                          <SelectTrigger className="bg-slate-900/50 border-primary/20 font-mono text-xs uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="font-mono text-xs uppercase">
                            {insulationLevels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">OCCUPANCY_LOAD</Label>
                        <Input
                          type="number"
                          value={buildingSpecs.occupancy}
                          onChange={(e) => setBuildingSpecs(p => ({ ...p, occupancy: parseInt(e.target.value) || 1 }))}
                          className="bg-slate-900/50 border-primary/20 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-card/40 mt-8">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-mono tracking-widest uppercase">TEMPORAL_HORIZON</CardTitle>
                        <CardDescription className="text-[10px] font-mono uppercase opacity-70">Simulation Window Buffer</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="flex-1 space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">WINDOW_RANGE</Label>
                        <Select value={timeHorizon.toString()} onValueChange={(v) => setTimeHorizon(Number(v))}>
                          <SelectTrigger className="bg-slate-900/50 border-primary/20 font-mono text-xs uppercase"><SelectValue /></SelectTrigger>
                          <SelectContent className="font-mono text-xs uppercase">
                            {timeHorizons.map(h => <SelectItem key={h.value} value={h.value.toString()}>{h.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={generatePredictions}
                        disabled={loading || !weatherData.length}
                        className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold tracking-[0.1em]"
                      >
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                        INIT_SIMULATION
                      </Button>
                    </div>
                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/30 rounded flex items-center gap-2 text-destructive font-mono text-[10px] uppercase">
                        <AlertCircle className="h-3 w-3" /> {error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemPresets}>
                <Card className="border-accent/20 bg-slate-900/60 transition-all border-l-4 border-l-accent text-mono uppercase">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/20 rounded">
                        <Cpu className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-mono tracking-widest uppercase">INFERENCE_OUTPUT_MATRIX</CardTitle>
                        <CardDescription className="text-[10px] font-mono uppercase opacity-70">Validated Prediction Summary</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {summary ? (
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'TOTAL_DEMAND', value: `${summary.totalDemand.toFixed(1)} kWh`, icon: TrendingUp },
                          { label: 'PEAK_LOAD', value: `${summary.peakDemand.toFixed(1)} kW`, icon: Zap },
                          { label: 'MEAN_DEMAND', value: `${summary.averageDemand.toFixed(1)} kW`, icon: BarChart3 },
                          { label: 'CURR_TEMP', value: `${predictions[0]?.temperature.toFixed(1)}°C`, icon: Thermometer },
                        ].map((s, i) => (
                          <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-lg space-y-1">
                            <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
                              <s.icon className="h-3 w-3" /> {s.label}
                            </div>
                            <div className="text-xl font-bold font-mono text-white">{s.value}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-10 text-primary" />
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Awaiting Simulation Sequence...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {predictions.length > 0 && (
              <div className="space-y-8">
                <motion.div variants={itemPresets}>
                  <Tabs defaultValue="chart" className="space-y-6">
                    <TabsList className="bg-slate-900/50 border border-border/50 p-1 rounded-xl h-12 w-full max-w-md mx-auto grid grid-cols-2">
                      <TabsTrigger value="chart" className="font-mono text-[10px] tracking-widest uppercase">VISUAL_TRACE</TabsTrigger>
                      <TabsTrigger value="table" className="font-mono text-[10px] tracking-widest uppercase">RAW_TELEMETRY</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart" className="space-y-8">
                      <Card className="border-primary/20 bg-card/40">
                        <CardHeader>
                          <CardTitle className="text-sm font-mono tracking-widest uppercase">THERMAL_DEMAND_PROJECTION</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={predictions}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={v => `${v}H`} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="heatDemand" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} name="LOAD" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="border-border/50 bg-card/30">
                          <CardHeader><CardTitle className="text-xs font-mono uppercase">Node_Correlations</CardTitle></CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={predictions}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.1)" />
                                  <XAxis dataKey="hour" hide />
                                  <YAxis yAxisId="left" hide />
                                  <YAxis yAxisId="right" orientation="right" hide />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Line yAxisId="left" type="stepAfter" dataKey="temperature" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} name="TEMP" />
                                  <Line yAxisId="right" type="stepAfter" dataKey="heatDemand" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="LOAD" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-border/50 bg-card/30">
                          <CardHeader><CardTitle className="text-xs font-mono uppercase">Phasic_Distribution</CardTitle></CardHeader>
                          <CardContent>
                            <div className="h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={predictions}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.1)" />
                                  <XAxis dataKey="hour" hide />
                                  <YAxis hide />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Bar dataKey="heatDemand" fill="hsl(var(--primary) / 0.6)" radius={[2, 2, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="table">
                      <Card className="border-border/50 bg-card/40">
                        <CardContent className="pt-6">
                          <div className="overflow-x-auto">
                            <table className="w-full text-[10px] font-mono uppercase">
                              <thead>
                                <tr className="border-b border-border/20 text-muted-foreground">
                                  <th className="p-3 text-left">PHASE</th>
                                  <th className="p-3 text-left">STAMP</th>
                                  <th className="p-3 text-left text-primary">DEMAND_KW</th>
                                  <th className="p-3 text-left">TEMP_C</th>
                                  <th className="p-3 text-left font-bold opacity-50">STATUS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {predictions.map((p, i) => (
                                  <tr key={i} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                                    <td className="p-3">T+{p.hour}H</td>
                                    <td className="p-3 opacity-50">{new Date(p.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="p-3 font-bold text-accent">{p.heatDemand.toFixed(3)}</td>
                                    <td className="p-3">{p.temperature.toFixed(1)}°</td>
                                    <td className="p-3">
                                      <Badge variant="outline" className="text-[8px] font-mono border-primary/20 text-primary h-4 px-1">VALID</Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
