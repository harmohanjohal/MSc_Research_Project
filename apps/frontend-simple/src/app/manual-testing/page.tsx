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
import {
  Clock,
  Target,
  AlertCircle,
  Loader2,
  Gauge,
  Layers,
  BarChart3,
  Zap,
  Activity,
  Terminal,
  Cpu,
  ShieldAlert
} from 'lucide-react'
import { useApiHealth, useModelInfo } from '@/hooks/useApi'
import { useManualPrediction } from '@/hooks/useManualPrediction'
import { BuildingSpecsCard } from '@/components/building-specs-card'
import { HourlyWeatherInputCard } from '@/components/hourly-weather-input-card'
import { HourlyPredictionCard } from '@/components/hourly-prediction-card'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const containerPresets = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1 }
  }
};

const itemPresets = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

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
    <div className="flex-1 w-full bg-slate-950/20">
      <NavigationHeader title="CONTROL CENTER: MANUAL_OVERRIDE" showBackButton />

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerPresets}
        >
          {/* Status HUD */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 glass-industrial rounded-lg border-primary/20 mb-8">
            <div className="flex items-center gap-4">
              <motion.div variants={itemPresets}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-full",
                    apiHealth ? "bg-primary/20 text-primary animate-pulse" : "bg-destructive/20 text-destructive"
                  )}>
                    {apiHealth ? <Activity className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">SYSTEM_LINK_STATUS</div>
                    <div className="text-sm font-mono font-bold uppercase tracking-tight text-white">
                      {apiHealth ? "STABLE_CONNECTION" : "LINK_TERMINATED"}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-6">
              <div className="flex items-center gap-6">
                <motion.div variants={itemPresets}>
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">ACTIVE_NODE</div>
                    <div className="text-sm font-mono text-primary uppercase">Prediction_Engine_v1.0</div>
                  </div>
                </motion.div>
                <Separator orientation="vertical" className="h-8 bg-border/50 hidden md:block" />
                <motion.div variants={itemPresets}>
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">OPERATOR_ACCESS</div>
                    <div className="text-sm font-mono text-white uppercase font-bold">GRANTED</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="prediction" className="space-y-8">
            <TabsList className="bg-slate-900/50 border border-border/50 p-1 rounded-xl h-12 w-full max-w-2xl mx-auto grid grid-cols-3 font-mono">
              <TabsTrigger value="prediction" className="text-[10px] tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Manual_Inject
              </TabsTrigger>
              <TabsTrigger value="model" className="text-[10px] tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Core_Metrics
              </TabsTrigger>
              <TabsTrigger value="features" className="text-[10px] tracking-widest uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Signal_Specs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prediction" className="space-y-8">
              <motion.div variants={itemPresets}>
                <Card className="border-primary/10 bg-card/40">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-mono tracking-widest uppercase">HORIZON_CONFIG</CardTitle>
                        <CardDescription className="text-[10px] font-mono uppercase opacity-70">
                          Define temporal projection buffer
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-8">
                      <div className="space-y-1">
                        <Label htmlFor="horizon" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          WINDOW_LENGTH:
                        </Label>
                        <Select
                          value={predictionHorizon.toString()}
                          onValueChange={(value) => setPredictionHorizon(parseInt(value) as 1 | 3 | 6)}
                        >
                          <SelectTrigger className="w-40 font-mono text-xs uppercase bg-slate-900/50 border-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="font-mono text-xs uppercase">
                            <SelectItem value="1">1 Hour Phase</SelectItem>
                            <SelectItem value="3">3 Hour Phase</SelectItem>
                            <SelectItem value="6">6 Hour Phase</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-5">
                        <div className="px-3 py-1.5 rounded border border-primary/30 bg-primary/5 flex items-center gap-2">
                          <Terminal className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-widest">
                            T+{predictionHorizon}H_PROJECTED
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                  <motion.div variants={itemPresets}>
                    <BuildingSpecsCard buildingData={buildingData} onBuildingChange={handleBuildingChange} />
                  </motion.div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">WEATHER_INPUT_ARRAYS</span>
                    </div>
                    {Array.from({ length: predictionHorizon }, (_, i) => i + 1).map((hour) => (
                      <motion.div key={hour} variants={itemPresets}>
                        <HourlyWeatherInputCard
                          hour={hour}
                          weatherData={hourlyWeatherData[hour] || {}}
                          onWeatherChange={handleWeatherChange}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <motion.div variants={itemPresets}>
                    <Button
                      onClick={handlePredict}
                      disabled={loading || !apiHealth}
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold tracking-[0.2em] relative overflow-hidden group shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          EXECUTING_INFERENCE...
                        </>
                      ) : (
                        <>
                          <Target className="mr-2 h-5 w-5" />
                          INITIATE_PREDICTION_SEQUENCE
                        </>
                      )}
                      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    </Button>
                  </motion.div>
                </div>

                <div className="h-full">
                  <motion.div variants={itemPresets}>
                    <Card className="border-accent/20 bg-slate-900/60 transition-all border-l-4 border-l-accent min-h-[400px]">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-accent/20 rounded">
                            <Cpu className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-mono tracking-widest uppercase text-white">INFERENCE_OUTPUT_MATRIX</CardTitle>
                            <CardDescription className="text-[10px] font-mono uppercase opacity-70">
                              Validated thermal load projections
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {error && (
                          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 font-mono text-xs">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="uppercase tracking-widest">SIGNAL_ERROR: {error}</AlertDescription>
                          </Alert>
                        )}

                        {hourlyPredictions.length > 0 ? (
                          <>
                            <div className="grid grid-cols-2 gap-6 p-6 rounded-lg bg-black/40 border border-white/5 font-mono">
                              <div className="space-y-1">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">TOTAL_AGGREGATE</div>
                                <div className="text-3xl font-bold text-accent tracking-tighter">
                                  {getTotalDemand().toFixed(3)} <span className="text-sm font-normal opacity-50">kW</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">MEAN_PHASE_LOAD</div>
                                <div className="text-3xl font-bold text-white tracking-tighter">
                                  {getAverageDemand().toFixed(3)} <span className="text-sm font-normal opacity-50">kW</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                              <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4" />
                                  SIGNAL_DECOMPOSITION
                                </h4>
                                <Badge variant="outline" className="text-[8px] font-mono border-accent/30 text-accent uppercase">Phase_Verified</Badge>
                              </div>
                              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {hourlyPredictions.map((hourlyPred) => (
                                  <HourlyPredictionCard key={hourlyPred.hour} hourlyPred={hourlyPred} />
                                ))}
                              </div>
                            </div>
                          </>
                        ) : !loading && (
                          <div className="text-center py-20 bg-black/20 rounded-lg border border-dashed border-white/10">
                            <Target className="h-16 w-16 mx-auto mb-6 opacity-10 text-primary" />
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Awaiting_Inference_Parameters</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="model" className="space-y-8">
              <motion.div variants={itemPresets}>
                <Card className="border-border/50 bg-card/40">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded">
                        <Gauge className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-mono tracking-widest uppercase">MODEL_ENGINE_SPECS</CardTitle>
                        <CardDescription className="text-[10px] font-mono uppercase opacity-70 text-muted-foreground">
                          CatBoost Industrial Prediction Framework
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {modelInfo ? (
                      <div className="space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
                          {[
                            { label: 'ENGINE_TYPE', value: modelInfo.model_type, color: 'text-primary' },
                            { label: 'FEATURE_ARRAY', value: modelInfo.total_features, color: 'text-white' },
                            { label: 'VARIANCE_R2', value: modelInfo?.performance?.test_r2?.toFixed(3) ?? "N/A", color: 'text-accent' },
                            { label: 'ERROR_MAPE', value: `${modelInfo?.performance?.test_mape?.toFixed(1) ?? "N/A"}%`, color: 'text-white' },
                          ].map((stat, i) => (
                            <div key={i} className="p-4 rounded bg-white/5 border border-white/5 text-center">
                              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</div>
                              <div className={cn("text-xl font-bold tracking-tighter uppercase", stat.color)}>{stat.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Scanning_System_Registry...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="features" className="space-y-8">
              <motion.div variants={itemPresets}>
                <Card className="border-border/50 bg-card/40">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded">
                        <Layers className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-mono tracking-widest uppercase">SIGNAL_ARCH_SCHEMA</CardTitle>
                        <CardDescription className="text-[10px] font-mono uppercase opacity-70">
                          Feature engineering and data normalization details
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
                      {[
                        { title: 'METEOROLOGICAL_ARRAYS', items: ['Temperature', 'Humidity', 'Wind Speed'] },
                        { title: 'STRUCTURAL_SPECIFICATIONS', items: ['Floor Area', 'Building Type', 'Insulation'] }
                      ].map((section, idx) => (
                        <div key={idx} className="space-y-4 p-4 rounded bg-black/20 border border-white/5">
                          <h4 className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">{section.title}</h4>
                          <div className="flex flex-wrap gap-2">
                            {section.items.map((item, i) => (
                              <Badge key={i} variant="outline" className="text-[8px] border-white/10 uppercase">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.3);
        }
      `}</style>
    </div>
  )
}
