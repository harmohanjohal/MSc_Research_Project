"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Thermometer, Cloud, Wind, Droplets, Sun, RefreshCw, AlertCircle, CheckCircle, Terminal, Activity } from 'lucide-react'
import { weatherService, type WeatherData } from '@/lib/weather'
import { cn } from '@/lib/utils'

interface WeatherStatusProps {
  className?: string
}

export function WeatherStatus({ className }: WeatherStatusProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const status = await weatherService.getStatus()
      setIsAvailable(status.available)
      setLastUpdate(status.lastUpdate)

      if (status.available) {
        const currentWeather = await weatherService.getCurrentWeather()
        setWeatherData(currentWeather)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'FAILED_TO_FETCH_TELEMETRY')
      setIsAvailable(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const handleRefresh = () => {
    fetchWeatherData()
  }

  return (
    <Card className={cn("border-primary/20 bg-card/40 font-mono tracking-tight font-light", className)}>
      <CardHeader className="pb-3 border-b border-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs tracking-[0.2em] font-bold uppercase flex items-center gap-2 text-white">
            <Activity className="h-4 w-4 text-primary" />
            WEATHER_STATUS_HUD
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-6 w-6 p-0 hover:bg-primary/20"
          >
            <RefreshCw className={cn("h-3 w-3", isLoading ? 'animate-spin' : '')} />
          </Button>
        </div>
        <CardDescription className="text-[9px] uppercase opacity-50">
          Source: Sensor_Array_01 // WeatherAPI.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* API Status */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">GATEWAY_CONN:</span>
          <Badge variant={isAvailable ? "default" : "destructive"} className={cn(
            "text-[8px] px-2 py-0.5 uppercase tracking-widest font-black",
            isAvailable ? "bg-primary/20 text-primary border-primary/20" : "bg-destructive/20 text-destructive border-destructive/20"
          )}>
            {isAvailable ? (
              <span className="flex items-center gap-1"><CheckCircle className="h-2 w-2" /> LINK_ACTIVE</span>
            ) : (
              <span className="flex items-center gap-1"><AlertCircle className="h-2 w-2" /> LINK_LOST</span>
            )}
          </Badge>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>TRANS_SYNC:</span>
            <span className="font-bold text-white">
              {new Date(lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <div className="text-[9px] text-destructive bg-destructive/5 border border-destructive/20 p-2 rounded flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              <span className="uppercase font-bold">{error}</span>
            </div>
            {error.includes('API_ERROR') && (
              <p className="text-[8px] text-white/30 uppercase font-mono px-1">
                DEBUG: CHECK_BROWSER_CONSOLE_FOR_URL
              </p>
            )}
          </div>
        )}

        {/* Current Weather Data */}
        {weatherData && isAvailable && (
          <div className="space-y-3 pt-3 border-t border-primary/5">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">LOCAL_POINT_METRICS</h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] opacity-50 uppercase">TEMP</span>
                <span className="text-xs font-bold text-primary">{weatherData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] opacity-50 uppercase">HUMID</span>
                <span className="text-xs font-bold text-accent">{weatherData.humidity}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] opacity-50 uppercase">WIND</span>
                <span className="text-xs font-bold text-primary">{weatherData.windSpeed.toFixed(1)} m/s</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] opacity-50 uppercase">CLOUD</span>
                <span className="text-xs font-bold text-muted-foreground font-mono">{weatherData.cloudCover}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] opacity-50 uppercase">SOLAR</span>
                <span className="text-xs font-bold text-accent">{weatherData.solarRadiation.toFixed(0)} W/m²</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-1">
                <span className="text-[9px] opacity-50 uppercase">PRESS</span>
                <span className="text-xs font-bold text-primary">{(weatherData.pressure / 100).toFixed(0)} hPa</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-primary opacity-50" />
            <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">SYNCHRONIZING...</p>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && !weatherData && !error && (
          <div className="text-center py-4 bg-white/5 rounded border border-dashed border-white/10">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">IDLE: WAITING_FOR_SYNC</p>
          </div>
        )}

        <div className="pt-2">
          <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground/30 uppercase tracking-widest">
            <Terminal className="h-2 w-2" />
            <span>TERMINAL_01 // SECURE_LINK // RSA_ENCRYPTED</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
