"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type PredictionResult } from '@/lib/api'
import { Zap, Target, ShieldCheck } from 'lucide-react'

interface HourlyPredictionCardProps {
    hourlyPred: {
        hour: number
        prediction: PredictionResult
    }
}

export function HourlyPredictionCard({ hourlyPred }: HourlyPredictionCardProps) {
    const { hour, prediction } = hourlyPred

    return (
        <div className="relative group overflow-hidden rounded-lg border border-white/5 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/60 hover:border-accent/40">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                <Zap className="h-8 w-8 text-accent" />
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">PHASE_INDEX</span>
                        <span className="text-sm font-mono font-bold text-white">T+{hour}H</span>
                    </div>
                </div>
                <Badge variant="outline" className="font-mono text-[9px] border-primary/30 text-primary uppercase h-5 bg-primary/5">
                    <ShieldCheck className="h-2.5 w-2.5 mr-1" /> DATA_LOCKED
                </Badge>
            </div>

            <div className="space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">LOAD_VALUATION</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-accent tracking-tighter">
                        {prediction.heat_demand_kw.toFixed(4)}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground uppercase">kW</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-[0.1em]">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="h-3 w-3" /> CONF_INTERVAL
                    </div>
                    <span className="text-white">{(prediction.heat_demand_kw * 0.95).toFixed(2)} - {(prediction.heat_demand_kw * 1.05).toFixed(2)}</span>
                </div>
            </div>
        </div>
    )
}
