"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Thermometer } from 'lucide-react'
import { motion } from 'framer-motion'
import { type WeatherData } from '@/lib/api'

interface HourlyWeatherInputCardProps {
    hour: number
    weatherData: WeatherData
    onWeatherChange: (hour: number, field: keyof WeatherData, value: number) => void
    index?: number
}

export function HourlyWeatherInputCard({ hour, weatherData, onWeatherChange, index = 0 }: HourlyWeatherInputCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
        >
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5" />
                        Hour {hour} Weather Conditions
                    </CardTitle>
                    <CardDescription>
                        Weather parameters for hour {hour}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor={`temp-${hour}`}>Temperature (°C)</Label>
                            <Input
                                id={`temp-${hour}`}
                                type="number"
                                value={weatherData?.temperature || 0}
                                onChange={(e) => onWeatherChange(hour, 'temperature', parseFloat(e.target.value))}
                                onBlur={(e) => onWeatherChange(hour, 'temperature', Number(parseFloat(e.target.value).toFixed(2)))}
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`humidity-${hour}`}>Humidity (%)</Label>
                            <Input
                                id={`humidity-${hour}`}
                                type="number"
                                value={weatherData?.humidity || 0}
                                onChange={(e) => onWeatherChange(hour, 'humidity', parseFloat(e.target.value))}
                                onBlur={(e) => onWeatherChange(hour, 'humidity', Number(parseFloat(e.target.value).toFixed(2)))}
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`wind-${hour}`}>Wind Speed (m/s)</Label>
                            <Input
                                id={`wind-${hour}`}
                                type="number"
                                value={weatherData?.windSpeed || 0}
                                onChange={(e) => onWeatherChange(hour, 'windSpeed', parseFloat(e.target.value))}
                                onBlur={(e) => onWeatherChange(hour, 'windSpeed', Number(parseFloat(e.target.value).toFixed(2)))}
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`solar-${hour}`}>Solar Radiation (W/m²)</Label>
                            <Input
                                id={`solar-${hour}`}
                                type="number"
                                value={weatherData?.solarRadiation || 0}
                                onChange={(e) => onWeatherChange(hour, 'solarRadiation', parseFloat(e.target.value))}
                                onBlur={(e) => onWeatherChange(hour, 'solarRadiation', Number(parseFloat(e.target.value).toFixed(2)))}
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`cloud-${hour}`}>Cloud Cover (0-10)</Label>
                            <Input
                                id={`cloud-${hour}`}
                                type="number"
                                value={weatherData?.cloudCover || 0}
                                onChange={(e) => onWeatherChange(hour, 'cloudCover', parseFloat(e.target.value))}
                                onBlur={(e) => onWeatherChange(hour, 'cloudCover', Number(parseFloat(e.target.value).toFixed(2)))}
                                min="0"
                                max="10"
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`precip-${hour}`}>Precipitation (mm)</Label>
                            <Input
                                id={`precip-${hour}`}
                                type="number"
                                value={weatherData?.precipitation || 0}
                                onChange={(e) => onWeatherChange(hour, 'precipitation', parseFloat(e.target.value))}
                                onBlur={(e) => onWeatherChange(hour, 'precipitation', Number(parseFloat(e.target.value).toFixed(2)))}
                                step="0.01"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
