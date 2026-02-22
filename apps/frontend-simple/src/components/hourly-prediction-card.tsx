import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { type HourlyPrediction } from '@/hooks/useManualPrediction'

interface HourlyPredictionCardProps {
    hourlyPred: HourlyPrediction
    index?: number
}

export function HourlyPredictionCard({ hourlyPred, index = 0 }: HourlyPredictionCardProps) {
    const getPredictionStatus = (demand: number) => {
        if (demand < 1) return { status: 'low', color: 'bg-green-100 text-green-800', icon: CheckCircle }
        if (demand < 3) return { status: 'moderate', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
        return { status: 'high', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }

    const predictionStatus = getPredictionStatus(hourlyPred.prediction.heat_demand_kw)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">Hour {hourlyPred.hour}</Badge>
                            <Badge className={predictionStatus.color}>
                                <predictionStatus.icon className="mr-1 h-3 w-3" />
                                {predictionStatus.status}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                                {hourlyPred.prediction.heat_demand_kw.toFixed(3)} kW
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(hourlyPred.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex justify-between">
                            <span>Temp:</span>
                            <span className="font-medium">{hourlyPred.weather.temperature}°C</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Humidity:</span>
                            <span className="font-medium">{hourlyPred.weather.humidity}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Wind:</span>
                            <span className="font-medium">{hourlyPred.weather.windSpeed} m/s</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
