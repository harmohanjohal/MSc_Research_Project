"use client"

import { NavigationHeader } from '@/components/navigation-header'
import { WeatherStatus } from '@/components/weather-status'
import { WeatherExplorer } from '@/components/weather-explorer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useWeatherData, useCachedData } from '@/hooks/useApi'
import { weatherService } from '@/lib/weather'
import { LoadingSpinner } from '@/components/ui/error-boundary'
import { Cloud, Droplets, Gauge, Sun, Thermometer, Wind, Activity, Zap, Terminal, ShieldCheck } from 'lucide-react'
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

export default function WeatherPage() {
    const { currentWeather } = useWeatherData()

    // Fetch real weather data - Defers to environment default
    const { data: realWeather, loading, error } = useCachedData(
        'current-weather',
        () => weatherService.getCurrentWeather(),
        5 * 60 * 1000 // 5 minute cache
    )

    return (
        <div className="flex-1 w-full bg-slate-950/20 uppercase font-mono text-xs">
            <NavigationHeader title="CONTROL CENTER: WEATHER_TELEMETRY" showBackButton={true} />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerPresets}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Explorer & Status */}
                        <div className="lg:col-span-1 space-y-8">
                            <motion.div variants={itemPresets}>
                                <WeatherExplorer />
                            </motion.div>

                            <motion.div variants={itemPresets}>
                                <WeatherStatus className="border-primary/20 bg-card/40" />
                            </motion.div>
                        </div>

                        {/* Right Column: Telemetry & Summary */}
                        <div className="lg:col-span-2 space-y-8">
                            <motion.div variants={itemPresets}>
                                <Card className="border-primary/20 bg-card/40">
                                    <CardHeader className="border-b border-primary/10 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/20 rounded">
                                                <Zap className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm tracking-widest uppercase text-white font-bold">CURRENT_METEOR_DATA</CardTitle>
                                                <CardDescription className="text-[10px] opacity-70 uppercase tracking-tighter">Real-time telemetry buffer: Primary_Node</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                                <LoadingSpinner size="lg" text="SYNCING_TELEMETRY..." />
                                            </div>
                                        ) : error ? (
                                            <div className="text-center py-20 border border-dashed border-destructive/30 rounded-lg bg-destructive/5">
                                                <p className="text-destructive font-bold mb-2 tracking-widest">SIGNAL_TERMINATED: DATA_FETCH_FAILED</p>
                                                <p className="text-[10px] opacity-50 uppercase">{error}</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {[
                                                    { label: 'TEMPERATURE', value: `${realWeather?.temperature?.toFixed(1) || currentWeather?.temperature?.toFixed(1)}°C`, icon: Thermometer, color: 'text-primary' },
                                                    { label: 'HUMIDITY', value: `${realWeather?.humidity || currentWeather?.humidity}%`, icon: Droplets, color: 'text-accent' },
                                                    { label: 'WIND_SPEED', value: `${realWeather?.windSpeed?.toFixed(1) || currentWeather?.windSpeed?.toFixed(1)} m/s`, icon: Wind, color: 'text-primary' },
                                                    { label: 'CLOUD_COVER', value: `${realWeather?.cloudCover || currentWeather?.cloudCover}%`, icon: Cloud, color: 'text-muted-foreground' },
                                                    { label: 'SOLAR_RAD', value: `${realWeather?.solarRadiation?.toFixed(0) || currentWeather?.solarRadiation?.toFixed(0)} W/m²`, icon: Sun, color: 'text-accent' },
                                                    { label: 'STATION_PRESSURE', value: `${((realWeather?.pressure || currentWeather?.pressure || 0) / 100).toFixed(0)} hPa`, icon: Gauge, color: 'text-primary' },
                                                ].map((stat, i) => (
                                                    <div key={i} className="p-4 rounded-lg bg-slate-900/50 border border-white/5 group hover:border-primary/30 transition-all">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-bold">{stat.label}</span>
                                                            <stat.icon className={cn("h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity", stat.color)} />
                                                        </div>
                                                        <div className={cn("text-2xl font-bold tracking-tighter", stat.color)}>
                                                            {stat.value}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Additional Weather Information */}
                            {realWeather && (
                                <motion.div variants={itemPresets}>
                                    <Card className="border-accent/20 bg-slate-900/40 border-l-4 border-l-accent overflow-hidden">
                                        <CardHeader>
                                            <CardTitle className="text-xs tracking-widest flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-accent" />
                                                ENVIRONMENTAL_SUMMARY
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-8">
                                                {realWeather.icon && (
                                                    <div className="relative">
                                                        <img src={realWeather.icon} alt={realWeather.condition} className="w-20 h-20 brightness-150 contrast-125" />
                                                        <div className="absolute inset-0 bg-accent/10 rounded-full blur-xl" />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                                        <p className="text-2xl font-bold text-white tracking-widest">{realWeather.condition.toUpperCase()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <Terminal className="h-3 w-3" />
                                                        <span>ATMOSPHERIC_CONDITION: NOMINAL // SIGNAL: STABLE_LINK</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center mt-12 pb-8">
                        <motion.div variants={itemPresets}>
                            <div className="flex items-center gap-4 px-6 py-2 rounded-full border border-primary/20 bg-primary/5">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <span className="text-[8px] tracking-[0.4em] text-primary/80 uppercase">SENSOR_ARRAY: ACTIVE // SIG_ACCURACY: 99.4%</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
