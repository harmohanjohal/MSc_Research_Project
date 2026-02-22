"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type BuildingData } from '@/hooks/useManualPrediction'
import { Home, Ruler, Layers, Wind, Building } from 'lucide-react'

interface BuildingSpecsCardProps {
    buildingData: BuildingData
    onBuildingChange: (data: Partial<BuildingData>) => void
}

export function BuildingSpecsCard({ buildingData, onBuildingChange }: BuildingSpecsCardProps) {
    return (
        <Card className="border-primary/20 bg-card/40">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded">
                        <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-mono tracking-widest uppercase">STRUCTURAL_PARAMETERS</CardTitle>
                        <CardDescription className="text-[10px] font-mono uppercase opacity-70">
                            Configure building structural telemetry
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Ruler className="h-3 w-3" /> TOTAL_FLOOR_AREA (m²)
                        </Label>
                        <Input
                            type="number"
                            value={buildingData.floorArea}
                            onChange={(e) => onBuildingChange({ floorArea: parseFloat(e.target.value) || 0 })}
                            className="bg-slate-900/50 border-primary/20 font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Layers className="h-3 w-3" /> NUMBER_OF_FLOORS
                        </Label>
                        <Input
                            type="number"
                            value={buildingData.numFloors}
                            onChange={(e) => onBuildingChange({ numFloors: parseInt(e.target.value) || 0 })}
                            className="bg-slate-900/50 border-primary/20 font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Wind className="h-3 w-3" /> INFILTRATION_RATE (ACH)
                        </Label>
                        <Input
                            type="number"
                            step="0.1"
                            value={buildingData.infiltrationRate}
                            onChange={(e) => onBuildingChange({ infiltrationRate: parseFloat(e.target.value) || 0 })}
                            className="bg-slate-900/50 border-primary/20 font-mono text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Building className="h-3 w-3" /> BUILDING_CLASSIFICATION
                        </Label>
                        <Select
                            value={buildingData.buildingType}
                            onValueChange={(value) => onBuildingChange({ buildingType: value as any })}
                        >
                            <SelectTrigger className="bg-slate-900/50 border-primary/20 font-mono text-[10px] uppercase">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="font-mono text-xs uppercase">
                                <SelectItem value="Residential">Residential</SelectItem>
                                <SelectItem value="Commercial">Commercial</SelectItem>
                                <SelectItem value="Industrial">Industrial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
