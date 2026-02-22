"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type WeatherData } from '@/lib/api'
import { Thermometer, Droplets, Wind, Cloud, Sun, Gauge } from 'lucide-react'

interface HourlyWeatherInputCardProps {
    hour: number
    weatherData: Partial<WeatherData>
    onWeatherChange: (hour: number, data: Partial<WeatherData>) => void
}

export function HourlyWeatherInputCard({ hour, weatherData, onWeatherChange }: HourlyWeatherInputCardProps) {
    const handleChange = (field: keyof WeatherData, value: string) => {
        onWeatherChange(hour, { [field]: parseFloat(value) || 0 })
    }

    return (
        <Card className="border-border/50 bg-card/30">
            <CardHeader className="py-3 border-b border-border/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-mono tracking-widest uppercase flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" /> T+{hour}H_ARRAY
                    </CardTitle>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Sensor_Input_Buffer</span>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { id: 'temperature', label: 'TEMP (°C)', icon: Thermometer },
                        { id: 'humidity', label: 'HUMID (%)', icon: Droplets },
                        { id: 'windSpeed', label: 'WIND (m/s)', icon: Wind },
                        { id: 'cloudCover', label: 'CLOUD (%)', icon: Cloud },
                        { id: 'solarRadiation', label: 'SOLAR (W/m²)', icon: Sun },
                        { id: 'pressure', label: 'PRESS (Pa)', icon: Gauge },
                    ].map((field) => (
                        <div key={field.id} className="space-y-1.5">
                            <Label className="text-[9px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                                <field.icon className="h-2.5 w-2.5" /> {field.label}
                            </Label>
                            <Input
                                type="number"
                                step={field.id === 'pressure' ? '100' : '0.1'}
                                value={(weatherData as any)[field.id] || ''}
                                onChange={(e) => handleChange(field.id as any, e.target.value)}
                                placeholder="0.0"
                                className="h-8 bg-slate-950/50 border-primary/10 font-mono text-[10px] focus-visible:ring-primary/30"
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
