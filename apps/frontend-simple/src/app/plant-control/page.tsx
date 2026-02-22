"use client"

import { useState } from 'react'
import { NavigationHeader } from '@/components/navigation-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/error-boundary'
import { useCachedData } from '@/hooks/useApi'
import { Power, Settings, AlertTriangle, CheckCircle, Thermometer, Gauge, Fuel, TrendingUp, Play, Square, Wrench, Zap, Brain, Bell, Cpu, Activity, ShieldAlert, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
    title: 'HIGH_DEMAND_PREDICTED',
    message: 'Demand expected to increase by 20% in next 4 hours',
    time: '2 MIN AGO',
    icon: AlertTriangle,
    color: 'text-accent border-accent/20 bg-accent/5'
  },
  {
    type: 'info',
    title: 'AI_OPTIMIZATION_ACTIVE',
    message: 'System automatically adjusted temperature setpoint',
    time: '15 MIN AGO',
    icon: Brain,
    color: 'text-primary border-primary/20 bg-primary/5'
  },
  {
    type: 'success',
    title: 'EFFICIENCY_IMPROVED',
    message: 'Current efficiency: 87.3% (+2.1% from yesterday)',
    time: '1 HOUR AGO',
    icon: CheckCircle,
    color: 'text-primary border-primary/20 bg-primary/5'
  }
]

// Real API data fetchers
const plantStatusFetcher = async () => {
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

const containerPresets = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
};

const itemPresets = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function PlantControlPage() {
  const { data: realPlantStatus, loading: statusLoading } = useCachedData('plant-status', plantStatusFetcher, 30 * 1000)
  const currentPlantStatus = realPlantStatus || plantStatus

  const [isRunning, setIsRunning] = useState(currentPlantStatus.isRunning)
  const [autoMode, setAutoMode] = useState(true)
  const [temperature, setTemperature] = useState(currentPlantStatus.temperature)
  const [pressure, setPressure] = useState(currentPlantStatus.pressure)
  const [demandResponse, setDemandResponse] = useState(false)

  return (
    <div className="flex-1 w-full bg-slate-950/20 uppercase font-mono">
      <NavigationHeader title="CONTROL CENTER: PLANT_MANAGEMENT" showBackButton />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerPresets}
        >
          <div className="space-y-8">
            {/* Plant Status Overview */}
            <motion.div variants={itemPresets}>
              <Card className="border-primary/20 bg-card/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Power className="h-32 w-32" />
                </div>
                <CardHeader className="border-b border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded">
                      <Cpu className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm tracking-widest uppercase">DISTRICT_HEATING_PLANT_NODES</CardTitle>
                      <CardDescription className="text-[10px] opacity-70 uppercase">Real-time operational telemetry & system vitals</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center">
                        <div className={cn(
                          "p-3 rounded-full",
                          isRunning ? "bg-primary/20 text-primary animate-pulse" : "bg-destructive/20 text-destructive"
                        )}>
                          {isRunning ? <CheckCircle className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}
                        </div>
                      </div>
                      <div className={cn("text-xl font-bold tracking-tighter", isRunning ? "text-primary" : "text-destructive")}>
                        {isRunning ? 'STABLE_RUN' : 'SYS_STOP'}
                      </div>
                      <div className="text-[10px] opacity-50 tracking-widest">PLANT_STATUS</div>
                    </div>

                    {[
                      { label: 'CURR_DEMAND', value: `${currentPlantStatus.currentDemand?.toFixed(1)} MW`, sub: `TARGET: ${currentPlantStatus.predictedDemand?.toFixed(1)} MW`, color: 'text-white' },
                      { label: 'OP_EFFICIENCY', value: `${currentPlantStatus.efficiency?.toFixed(1)}%`, sub: '+2.1% DELTA_D', color: 'text-white' },
                      { label: 'RUNTIME_TCL', value: `${Math.floor(currentPlantStatus.runtime / 60)}:${String(Math.floor(currentPlantStatus.runtime % 60)).padStart(2, '0')}`, sub: 'CONT_OPERATION', color: 'text-accent' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center space-y-1">
                        {statusLoading ? <div className="h-8 w-24 bg-white/5 animate-pulse mx-auto rounded" /> : (
                          <>
                            <div className={cn("text-2xl font-bold tracking-tighter", stat.color)}>{stat.value}</div>
                            <div className="text-[10px] opacity-50 tracking-widest uppercase">{stat.label}</div>
                            <div className="text-[8px] opacity-30 mt-1 uppercase">{stat.sub}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <motion.div variants={itemPresets}>
                  <Card className="border-primary/10 bg-card/40">
                    <CardHeader>
                      <CardTitle className="text-xs tracking-widest uppercase flex items-center gap-2">
                        <Settings className="h-4 w-4 text-primary" />
                        PRIMARY_NODE_CONTROLS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-bold">
                        <Button
                          variant={isRunning ? "destructive" : "default"}
                          size="lg"
                          onClick={() => setIsRunning(!isRunning)}
                          className="h-20 flex flex-col items-center justify-center p-0 tracking-widest text-[10px]"
                        >
                          {isRunning ? <Square className="h-5 w-5 mb-1" /> : <Play className="h-5 w-5 mb-1" />}
                          {isRunning ? 'TERMINATE' : 'INITIATE'}
                        </Button>

                        <Button
                          variant={autoMode ? "default" : "outline"}
                          size="lg"
                          onClick={() => setAutoMode(!autoMode)}
                          className="h-20 flex flex-col items-center justify-center p-0 tracking-widest text-[10px]"
                        >
                          <Brain className="h-5 w-5 mb-1" />
                          AUTO_MODE
                        </Button>

                        <Button
                          variant={demandResponse ? "default" : "outline"}
                          size="lg"
                          onClick={() => setDemandResponse(!demandResponse)}
                          className="h-20 flex flex-col items-center justify-center p-0 tracking-widest text-[10px]"
                        >
                          <Zap className="h-5 w-5 mb-1" />
                          DMND_RESP
                        </Button>

                        <Button
                          variant="outline"
                          size="lg"
                          className="h-20 flex flex-col items-center justify-center p-0 tracking-widest text-[10px]"
                        >
                          <Wrench className="h-5 w-5 mb-1" />
                          MAINTENANCE
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemPresets}>
                  <Card className="border-primary/10 bg-card/40">
                    <CardHeader>
                      <CardTitle className="text-xs tracking-widest uppercase">PARAM_VECTORS: THERMAL & HYDRAULIC</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] tracking-widest flex items-center gap-2">
                            <Thermometer className="h-3 w-3 text-primary" />
                            TEMPERATURE_CORE: <span className="text-white font-bold">{temperature}°C</span>
                          </label>
                          <span className="text-[8px] opacity-40">BUFFER: 160-200°C</span>
                        </div>
                        <div className="relative group/slider">
                          <input
                            type="range"
                            min="160"
                            max="200"
                            value={temperature}
                            onChange={(e) => setTemperature(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                            disabled={autoMode}
                          />
                          <div className="absolute inset-x-0 -top-full h-0.5 bg-primary/20 blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] tracking-widest flex items-center gap-2">
                            <Gauge className="h-3 w-3 text-accent" />
                            PRESSURE_HEAD: <span className="text-white font-bold">{pressure} BAR</span>
                          </label>
                          <span className="text-[8px] opacity-40">BUFFER: 6-12 BAR</span>
                        </div>
                        <input
                          type="range"
                          min="6"
                          max="12"
                          step="0.1"
                          value={pressure}
                          onChange={(e) => setPressure(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent"
                          disabled={autoMode}
                        />
                      </div>

                      {autoMode && (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded flex items-center gap-3">
                          <Brain className="h-4 w-4 text-primary animate-pulse" />
                          <p className="text-[9px] text-primary/80 leading-relaxed italic">
                            PLANT_AI ACTIVE: AUTONOMOUS OPTIMIZATION OF THERMAL VECTORS IN PROGRESS...
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemPresets}>
                  <Card className="border-primary/10 bg-card/40">
                    <CardHeader>
                      <CardTitle className="text-xs tracking-widest uppercase">HEATING_REQUIREMENTS_ARRAY</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: 'CURR_HEAT_LOAD', value: `${currentPlantStatus.currentDemand?.toFixed(1)} MW`, sub: 'REAL-TIME NETWORK FEED', icon: Thermometer, color: 'text-primary' },
                          { label: 'PRED_LOAD (1H)', value: `${currentPlantStatus.predictedDemand?.toFixed(1)} MW`, sub: 'AI FORECAST_PHASE', icon: TrendingUp, color: 'text-accent' },
                          { label: 'PEAK_LOAD_T', value: `${(currentPlantStatus.currentDemand * 1.3).toFixed(1)} MW`, sub: 'DAILY PEAK BUFFER', icon: Zap, color: 'text-white' },
                          { label: 'AVG_LOAD (24H)', value: `${(currentPlantStatus.currentDemand * 0.85).toFixed(1)} MW`, sub: 'ROLLING AVG METRIC', icon: Settings, color: 'text-muted-foreground' },
                        ].map((item, i) => (
                          <div key={i} className="p-4 bg-slate-900/40 border border-white/5 rounded-lg flex items-center justify-between">
                            <div>
                              <div className="text-[9px] opacity-50 tracking-widest uppercase">{item.label}</div>
                              <div className={cn("text-xl font-bold tracking-tighter mt-1", item.color)}>{item.value}</div>
                              <div className="text-[8px] opacity-30 uppercase mt-1 flex items-center gap-1">
                                <Terminal className="h-2 w-2" /> {item.sub}
                              </div>
                            </div>
                            <item.icon className={cn("h-6 w-6 opacity-20", item.color)} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="space-y-8">
                <motion.div variants={itemPresets}>
                  <Card className="border-accent/20 bg-slate-900/60 border-l-4 border-l-accent">
                    <CardHeader>
                      <CardTitle className="text-xs tracking-widest uppercase flex items-center gap-2">
                        <Bell className="h-4 w-4 text-accent" />
                        SYSTEM_LOGS & ALERTS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {alerts.map((alert, index) => (
                        <div key={index} className={cn("p-3 rounded border font-mono", alert.color)}>
                          <div className="flex items-start gap-3">
                            <alert.icon className="h-4 w-4 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-[10px] tracking-widest">{alert.title}</h4>
                                <span className="text-[8px] opacity-50">{alert.time}</span>
                              </div>
                              <p className="text-[9px] opacity-80 leading-tight uppercase font-light italic">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemPresets}>
                  <Card className="border-primary/10 bg-card/40">
                    <CardHeader>
                      <CardTitle className="text-xs tracking-widest uppercase">QUICK_INTERRUPTS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="destructive" className="w-full text-[10px] tracking-widest font-bold h-12" size="lg">
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        EMERGENCY_KILL
                      </Button>
                      <Button variant="outline" className="w-full text-[10px] tracking-widest h-10 border-white/10 hover:bg-white/5">
                        <Wrench className="h-4 w-4 mr-2 opacity-50" />
                        SCHED_MAINTENANCE
                      </Button>
                      <Button variant="outline" className="w-full text-[10px] tracking-widest h-10 border-white/10 hover:bg-white/5">
                        <Settings className="h-4 w-4 mr-2 opacity-50" />
                        SYS_DIAGNOSTICS
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
