"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/error-boundary'
import { weatherService } from '@/lib/weather'
import {
    Search,
    Wind,
    Droplets,
    Sun,
    Cloud,
    Thermometer,
    Gauge,
    MapPin,
    Terminal,
    AlertTriangle,
    Crosshair
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function WeatherExplorer() {
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [weatherData, setWeatherData] = useState<any | null>(null)

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!searchQuery.trim()) return

        setLoading(true)
        setError(null)

        try {
            const data = await weatherService.getCurrentWeather(searchQuery)
            setWeatherData(data)
        } catch (err: any) {
            console.error('[WeatherExplorer] Search failed:', err)
            setError(`${err.message || 'FAILED_TO_LOCATE_TARGET'} (Query: "${searchQuery}")`)
            setWeatherData(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-primary/20 bg-card/40 overflow-hidden font-mono">
            <CardHeader className="border-b border-primary/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/20 rounded">
                            <Crosshair className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm tracking-widest uppercase">SITE_LOCATOR_V2</CardTitle>
                    </div>
                    <div className="text-[10px] opacity-50 uppercase flex items-center gap-2">
                        <Terminal className="h-3 w-3" />
                        <span>Ready_for_Input</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity">
                            <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <Input
                            placeholder="CITY, REGION, COUNTRY (SPECIFIC)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-900/50 border-primary/20 focus-visible:ring-primary/30 text-xs tracking-wider"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={loading || !searchQuery.trim()}
                        className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-bold uppercase text-[10px] tracking-widest min-w-[100px]"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : (
                            <div className="flex items-center gap-2">
                                <Search className="h-3 w-3" />
                                <span>Execute</span>
                            </div>
                        )}
                    </Button>
                </form>

                {/* Tactical Briefing for API Limitations */}
                {!weatherData && !error && (
                    <div className="p-3 bg-slate-900/40 border border-white/5 rounded text-[9px] text-muted-foreground/60 leading-relaxed">
                        <div className="flex items-center gap-2 mb-1 text-primary/40 font-bold uppercase tracking-widest">
                            <Terminal className="h-3 w-3" />
                            <span>Tactical_Briefing_v2.1</span>
                        </div>
                        <p>Search precision required. Use <span className="text-primary/60">"City, Region, Country"</span> for metropolitan zones (e.g. "London, Greater London, United Kingdom") to bypass current API indexing limitations. Short tokens may result in misrouting or signal loss.</p>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex items-start gap-4">
                                <AlertTriangle className="h-5 w-5 text-destructive animate-pulse flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-destructive uppercase tracking-widest">SIGNAL_ERROR</div>
                                    <div className="text-[10px] opacity-70 mt-0.5">{error}</div>
                                    <div className="text-[9px] text-destructive/60 mt-2 border-t border-destructive/10 pt-2 leading-relaxed">
                                        RECO: Increase specificity. Try <span className="text-destructive/80 font-bold">"City, Region, Country"</span>. Your API key requires exhaustive location descriptors for successful resolution.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {!weatherData && !loading && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="py-12 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                                <div className="p-4 border border-dashed border-primary/20 rounded-full">
                                    <Search className="h-8 w-8 text-primary" />
                                </div>
                                <div className="text-[10px] tracking-[0.2em] uppercase">Search_Queue_Empty_Wait_for_Instruction</div>
                            </div>
                        </motion.div>
                    )}

                    {weatherData && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="space-y-6">
                                {/* Summary Header */}
                                <div className="flex items-end justify-between p-4 bg-slate-900/40 border border-white/5 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                                            <Crosshair className="h-3 w-3" />
                                            <span>Target_Subject</span>
                                        </div>
                                        <div className="text-3xl font-bold tracking-tighter text-white uppercase truncate pr-4">
                                            {weatherData.locationName || searchQuery}
                                        </div>
                                        <div className="text-[10px] text-primary/60 font-mono mt-1 uppercase">
                                            SITE_ID: {weatherData.locationCountry || 'NODE_UNKNOWN'}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-[10px] text-muted-foreground uppercase mb-1">Status</div>
                                        <div className="px-2 py-0.5 bg-accent/20 text-accent border border-accent/30 rounded-full text-[8px] font-bold tracking-widest animate-pulse uppercase whitespace-nowrap">Link_Established</div>
                                    </div>
                                </div>

                                {/* Data Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[
                                        { label: 'TEMPERATURE', value: `${weatherData.temperature.toFixed(1)}°C`, icon: Thermometer, color: 'text-primary' },
                                        { label: 'HUMIDITY', value: `${weatherData.humidity}%`, icon: Droplets, color: 'text-accent' },
                                        { label: 'WIND_SPEED', value: `${weatherData.windSpeed.toFixed(1)} m/s`, icon: Wind, color: 'text-primary' },
                                        { label: 'CLOUD_COVER', value: `${weatherData.cloudCover}%`, icon: Cloud, color: 'text-muted-foreground' },
                                        { label: 'SOLAR_RAD', value: `${weatherData.solarRadiation.toFixed(0)} W/m²`, icon: Sun, color: 'text-accent' },
                                        { label: 'PRESSURE', value: `${(weatherData.pressure / 100).toFixed(0)} hPa`, icon: Gauge, color: 'text-primary' },
                                    ].map((stat, i) => (
                                        <div key={i} className="p-3 bg-slate-900/30 border border-white/5 rounded group hover:border-primary/20 transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[8px] text-muted-foreground tracking-widest">{stat.label}</span>
                                                <stat.icon className={cn("h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity", stat.color)} />
                                            </div>
                                            <div className={cn("text-lg font-bold tracking-tighter", stat.color)}>
                                                {stat.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-2 flex items-center gap-4 text-[8px] opacity-40 uppercase tracking-[0.3em]">
                                    <span className="animate-pulse">● SIGNAL_STRONG</span>
                                    <span>BUNNY_CDN_RELAY_M01</span>
                                    <span>PROTO: WEATHER_JSON_V1</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
